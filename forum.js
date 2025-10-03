// forum.js - Forum Logic with Google OAuth
// Global variables
let currentUser = null;
let allTopics = [];
let allCategories = [];

// Forum Categories
const CATEGORIES = {
  'tu-tuong-yeu-nuoc': {
    name: 'Tư tưởng yêu nước',
    icon: 'bi-heart',
    description: 'Thảo luận về tinh thần yêu nước trong tư tưởng HCM',
    color: '#dc3545'
  },
  'dao-duc-hcm': {
    name: 'Đạo đức Hồ Chí Minh',
    icon: 'bi-star',
    description: 'Những giá trị đạo đức và nhân cách của Bác Hồ',
    color: '#ffc107'
  },
  'ung-dung-thuc-te': {
    name: 'Ứng dụng thực tế',
    icon: 'bi-gear',
    description: 'Áp dụng tư tưởng HCM trong đời sống hiện đại',
    color: '#198754'
  },
  'cau-hoi-giai-dap': {
    name: 'Câu hỏi & Giải đáp',
    icon: 'bi-question-circle',
    description: 'Đặt câu hỏi và trao đổi kiến thức',
    color: '#0d6efd'
  },
  'tai-lieu-chia-se': {
    name: 'Tài liệu chia sẻ',
    icon: 'bi-file-earmark-text',
    description: 'Chia sẻ tài liệu, sách báo, video học tập',
    color: '#6f42c1'
  },
  'su-kien-hoat-dong': {
    name: 'Sự kiện & Hoạt động',
    icon: 'bi-calendar-event',
    description: 'Thông tin về các sự kiện, hoạt động liên quan',
    color: '#fd7e14'
  }
};

// Sample data for demo (replace with real database later)
const SAMPLE_TOPICS = [
  {
    id: '1',
    title: 'Tư tưởng yêu nước trong thời đại mới',
    content: 'Làm thế nào để áp dụng tư tưởng yêu nước của Bác Hồ vào cuộc sống hiện đại? Tôi muốn thảo luận về vấn đề này với mọi người.',
    category: 'tu-tuong-yeu-nuoc',
    authorName: 'Nguyễn Văn A',
    authorPhoto: 'https://via.placeholder.com/40',
    timestamp: Date.now() - 3600000,
    replyCount: 3,
    viewCount: 15,
    pinned: false
  },
  {
    id: '2',
    title: 'Đạo đức cách mạng và đạo đức công dân',
    content: 'Bác Hồ đã dạy: "Đạo đức là gốc, tài năng là ngọn". Làm thế nào để rèn luyện đạo đức cách mạng trong thời đại ngày nay?',
    category: 'dao-duc-hcm',
    authorName: 'Trần Thị B',
    authorPhoto: 'https://via.placeholder.com/40',
    timestamp: Date.now() - 7200000,
    replyCount: 5,
    viewCount: 28,
    pinned: true
  },
  {
    id: '3',
    title: 'Ứng dụng tư tưởng HCM trong giáo dục',
    content: 'Tư tưởng Hồ Chí Minh về giáo dục có ý nghĩa gì đối với việc đổi mới giáo dục hiện nay?',
    category: 'ung-dung-thuc-te',
    authorName: 'Lê Văn C',
    authorPhoto: 'https://via.placeholder.com/40',
    timestamp: Date.now() - 10800000,
    replyCount: 2,
    viewCount: 12,
    pinned: false
  }
];

// Initialize forum when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Forum initializing...');
  console.log('📋 Checking required functions...');
  
  // Verify all functions exist
  const requiredFunctions = [
    'showCreateTopicModal',
    'createTopic', 
    'openTopicDetail',
    'addReply',
    'filterByCategory',
    'showAllTopics',
    'searchTopics'
  ];
  
  requiredFunctions.forEach(funcName => {
    if (window[funcName]) {
      console.log(`✅ ${funcName} - Ready`);
    } else {
      console.log(`❌ ${funcName} - Missing`);
    }
  });
  
  // Check authentication state
  checkAuthState();
  
  // Load initial data
  loadCategories();
  loadTopics();
});

// Check authentication state from localStorage
function checkAuthState() {
  const userProfile = localStorage.getItem('userProfile');
  if (userProfile) {
    try {
      const profile = JSON.parse(userProfile);
      currentUser = {
        uid: profile.sub,
        displayName: profile.name,
        email: profile.email,
        photoURL: profile.picture
      };
      console.log('✅ User authenticated:', profile.name);
      updateAuthUI(currentUser);
    } catch (error) {
      console.error('❌ Error parsing user profile:', error);
      localStorage.removeItem('userProfile');
      currentUser = null;
      updateAuthUI(null);
    }
  } else {
    currentUser = null;
    console.log('ℹ️ No user authenticated');
    updateAuthUI(null);
  }
  
  // Update online count after auth state changes
  loadForumStats();
}

// Authentication Functions
window.signOutUser = function() {
  localStorage.removeItem('userProfile');
  currentUser = null;
  updateAuthUI(null);
  showNotification('Đã đăng xuất thành công!', 'info');
  // Reload page to refresh data
  location.reload();
};

function updateAuthUI(user) {
  const authSection = document.getElementById('userAuthSection');
  const createTopicBtn = document.getElementById('createTopicBtn');
  
  if (user) {
    authSection.innerHTML = `
      <div class="d-flex align-items-center gap-3">
        <div class="user-info d-flex align-items-center">
          <img src="${user.photoURL || '/pic/default-avatar.png'}" 
               alt="${user.displayName}" 
               class="rounded-circle me-2" 
               width="32" height="32">
          <span class="text-white fw-medium">${user.displayName}</span>
        </div>
        <button class="btn btn-outline-light btn-sm" onclick="signOutUser()">
          <i class="bi bi-box-arrow-right me-1"></i>Đăng xuất
        </button>
      </div>
    `;
    createTopicBtn.style.display = 'inline-block';
  } else {
    authSection.innerHTML = `
      <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#loginModal">
        <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
      </button>
    `;
    createTopicBtn.style.display = 'none';
  }
}

// Categories Functions
function loadCategories() {
  const container = document.getElementById('categoriesContainer');
  let categoriesHTML = '';
  
  Object.keys(CATEGORIES).forEach(key => {
    const category = CATEGORIES[key];
    categoriesHTML += `
      <div class="col-lg-4 col-md-6 mb-3" data-aos="fade-up">
        <div class="card category-card h-100 border-0 shadow-sm" 
             onclick="filterByCategory('${key}')" 
             style="cursor: pointer; border-left: 4px solid ${category.color} !important;">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <i class="${category.icon} fs-4 me-3" style="color: ${category.color};"></i>
              <h6 class="card-title mb-0">${category.name}</h6>
            </div>
            <p class="card-text small text-muted">${category.description}</p>
            <div class="d-flex justify-content-between text-muted small">
              <span><i class="bi bi-file-text me-1"></i><span id="count-${key}">0</span> chủ đề</span>
              <span><i class="bi bi-clock me-1"></i>Mới cập nhật</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = categoriesHTML;
}

// Topics Functions
function loadTopics() {
  console.log('📥 Loading topics...');
  
  // For demo, use sample data
  // In real implementation, this would load from a database
  allTopics = [...SAMPLE_TOPICS];
  
  console.log(`✅ Loaded ${allTopics.length} topics`);
  
  displayTopics(allTopics);
  updateCategoryCounts();
  loadForumStats();
}

function displayTopics(topics) {
  const container = document.getElementById('topicsContainer');
  
  if (!topics || topics.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-chat-dots-fill text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Chưa có chủ đề thảo luận nào</h5>
        <p class="text-muted">Hãy là người đầu tiên chia sẻ suy nghĩ!</p>
        ${currentUser ? `
          <button class="btn btn-classical mt-2" onclick="showCreateTopicModal()">
            <i class="bi bi-plus-circle me-1"></i>Tạo chủ đề đầu tiên
          </button>
        ` : `
          <button class="btn btn-outline-classical mt-2" data-bs-toggle="modal" data-bs-target="#loginModal">
            <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập để tạo chủ đề
          </button>
        `}
      </div>
    `;
    return;
  }
  
  let topicsHTML = '';
  topics.forEach(topic => {
    const category = CATEGORIES[topic.category] || { name: 'Khác', icon: 'bi-tag', color: '#6c757d' };
    const timeAgo = getTimeAgo(topic.timestamp);
    const replyCount = topic.replyCount || 0;
    
    topicsHTML += `
      <div class="topic-item border-bottom p-3" onclick="openTopicDetail('${topic.id}')">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <div class="d-flex align-items-start">
              <div class="topic-icon me-3 mt-1">
                <i class="${category.icon}" style="color: ${category.color};"></i>
              </div>
              <div class="topic-content flex-grow-1">
                <h6 class="topic-title mb-1">
                  ${topic.pinned ? '<i class="bi bi-pin-fill text-warning me-1"></i>' : ''}
                  ${topic.title}
                </h6>
                <div class="topic-meta text-muted small">
                  <span class="badge" style="background-color: ${category.color};">${category.name}</span>
                  <span class="mx-2">•</span>
                  <span>bởi <strong>${topic.authorName}</strong></span>
                  <span class="mx-2">•</span>
                  <span>${timeAgo}</span>
                </div>
                <p class="topic-preview text-muted small mt-1 mb-0">
                  ${topic.content.length > 150 ? topic.content.substring(0, 150) + '...' : topic.content}
                </p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 text-lg-end">
            <div class="topic-stats">
              <div class="d-flex align-items-center justify-content-lg-end gap-3">
                <div class="stat-item text-center">
                  <div class="text-muted small">Trả lời</div>
                  <div class="fw-bold">${replyCount}</div>
                </div>
                <div class="stat-item text-center">
                  <div class="text-muted small">Lượt xem</div>
                  <div class="fw-bold">${topic.viewCount || 0}</div>
                </div>
                <div class="last-activity text-center">
                  <div class="text-muted small">Hoạt động cuối</div>
                  <div class="fw-bold small">${timeAgo}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = topicsHTML;
}

// Create Topic Functions
window.showCreateTopicModal = function() {
  if (!currentUser) {
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    return;
  }
  
  const modal = new bootstrap.Modal(document.getElementById('createTopicModal'));
  modal.show();
};

window.createTopic = function() {
  if (!currentUser) {
    showNotification('Vui lòng đăng nhập để tạo chủ đề!', 'error');
    return;
  }
  
  const title = document.getElementById('topicTitle').value.trim();
  const category = document.getElementById('topicCategory').value;
  const content = document.getElementById('topicContent').value.trim();
  const pinned = document.getElementById('topicPinned').checked;
  
  if (!title || !category || !content) {
    showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
    return;
  }
  
  // Create new topic object
  const newTopic = {
    id: Date.now().toString(),
    title: title,
    content: content,
    category: category,
    authorName: currentUser.displayName,
    authorPhoto: currentUser.photoURL,
    timestamp: Date.now(),
    pinned: pinned,
    replyCount: 0,
    viewCount: 0
  };
  
  // Add to topics array
  allTopics.unshift(newTopic);
  
  // Update display
  displayTopics(allTopics);
  updateCategoryCounts();
  loadForumStats();
  
  // Close modal and reset form
  const modal = bootstrap.Modal.getInstance(document.getElementById('createTopicModal'));
  modal.hide();
  document.getElementById('createTopicForm').reset();
  
  showNotification('Chủ đề đã được tạo thành công!', 'success');
};

// Topic Detail Functions
window.openTopicDetail = function(topicId) {
  const topic = allTopics.find(t => t.id === topicId);
  if (!topic) return;
  
  // Update view count
  topic.viewCount = (topic.viewCount || 0) + 1;
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('topicDetailModal'));
  
  // Set title
  const category = CATEGORIES[topic.category] || { name: 'Khác', icon: 'bi-tag' };
  document.getElementById('topicDetailTitle').innerHTML = `
    <i class="${category.icon} me-2"></i>${topic.title}
  `;
  
  // Load content and replies
  loadTopicDetail(topicId);
  
  modal.show();
};

function loadTopicDetail(topicId) {
  const topic = allTopics.find(t => t.id === topicId);
  const category = CATEGORIES[topic.category] || { name: 'Khác', icon: 'bi-tag', color: '#6c757d' };
  
  let contentHTML = `
    <div class="topic-detail">
      <div class="topic-header mb-4">
        <div class="d-flex align-items-center mb-2">
          <span class="badge me-2" style="background-color: ${category.color};">${category.name}</span>
          <span class="text-muted small">${getTimeAgo(topic.timestamp)}</span>
        </div>
        <div class="author-info d-flex align-items-center mb-3">
          <img src="${topic.authorPhoto || '/pic/default-avatar.png'}" 
               alt="${topic.authorName}" 
               class="rounded-circle me-2" 
               width="40" height="40">
          <div>
            <div class="fw-bold">${topic.authorName}</div>
            <div class="text-muted small">Tác giả chủ đề</div>
          </div>
        </div>
        <div class="topic-content">
          <p style="white-space: pre-wrap;">${topic.content}</p>
        </div>
      </div>
      
      <hr>
      
      <div class="replies-section">
        <h6><i class="bi bi-chat-left-text me-2"></i>Phản hồi (<span id="replyCount">${topic.replyCount || 0}</span>)</h6>
        <div id="repliesContainer">
          <!-- Replies will be loaded here -->
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('topicDetailContent').innerHTML = contentHTML;
  
  // Setup footer with reply form
  const footer = document.getElementById('topicDetailFooter');
  if (currentUser) {
    footer.innerHTML = `
      <div class="w-100">
        <div class="input-group">
          <textarea class="form-control" id="replyContent" rows="3" 
                    placeholder="Viết phản hồi của bạn..."></textarea>
          <button class="btn btn-classical" onclick="addReply('${topicId}')">
            <i class="bi bi-send me-1"></i>Gửi
          </button>
        </div>
      </div>
    `;
  } else {
    footer.innerHTML = `
      <button class="btn btn-outline-classical" data-bs-toggle="modal" data-bs-target="#loginModal">
        <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập để phản hồi
      </button>
    `;
  }
  
  // Load replies (demo data)
  loadReplies(topicId);
}

function loadReplies(topicId) {
  // Demo replies data
  const demoReplies = [
    {
      id: '1',
      content: 'Cảm ơn bạn đã chia sẻ. Tôi cũng có cùng quan điểm về vấn đề này.',
      authorName: 'Phạm Văn D',
      authorPhoto: 'https://via.placeholder.com/32',
      timestamp: Date.now() - 1800000
    },
    {
      id: '2',
      content: 'Rất hay! Tôi muốn tìm hiểu thêm về chủ đề này.',
      authorName: 'Hoàng Thị E',
      authorPhoto: 'https://via.placeholder.com/32',
      timestamp: Date.now() - 900000
    }
  ];
  
  displayReplies(demoReplies);
  
  // Update reply count
  const replyCountEl = document.getElementById('replyCount');
  if (replyCountEl) {
    replyCountEl.textContent = demoReplies.length;
  }
}

function displayReplies(replies) {
  const container = document.getElementById('repliesContainer');
  
  if (!replies || replies.length === 0) {
    container.innerHTML = `
      <div class="text-center py-4 text-muted">
        <i class="bi bi-chat-dots"></i>
        <p class="mb-0 mt-2">Chưa có phản hồi nào</p>
      </div>
    `;
    return;
  }
  
  let repliesHTML = '';
  replies.forEach((reply, index) => {
    repliesHTML += `
      <div class="reply-item ${index > 0 ? 'border-top' : ''} pt-3 pb-3">
        <div class="d-flex">
          <img src="${reply.authorPhoto || '/pic/default-avatar.png'}" 
               alt="${reply.authorName}" 
               class="rounded-circle me-3" 
               width="32" height="32">
          <div class="flex-grow-1">
            <div class="d-flex align-items-center mb-1">
              <strong class="me-2">${reply.authorName}</strong>
              <span class="text-muted small">${getTimeAgo(reply.timestamp)}</span>
            </div>
            <p class="mb-0" style="white-space: pre-wrap;">${reply.content}</p>
          </div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = repliesHTML;
}

window.addReply = function(topicId) {
  if (!currentUser) {
    showNotification('Vui lòng đăng nhập để phản hồi!', 'error');
    return;
  }
  
  const content = document.getElementById('replyContent').value.trim();
  if (!content) {
    showNotification('Vui lòng nhập nội dung phản hồi!', 'error');
    return;
  }
  
  // Create new reply
  const newReply = {
    id: Date.now().toString(),
    content: content,
    authorName: currentUser.displayName,
    authorPhoto: currentUser.photoURL,
    timestamp: Date.now()
  };
  
  // Add to replies (in real implementation, this would save to database)
  const topic = allTopics.find(t => t.id === topicId);
  if (topic) {
    topic.replyCount = (topic.replyCount || 0) + 1;
  }
  
  // Clear form
  document.getElementById('replyContent').value = '';
  
  // Reload replies
  loadReplies(topicId);
  
  showNotification('Phản hồi đã được gửi!', 'success');
};

// Filter and Search Functions
window.filterByCategory = function(categoryKey) {
  if (categoryKey === 'hot') {
    // Sort by reply count + view count
    const hotTopics = [...allTopics].sort((a, b) => {
      const scoreA = (a.replyCount || 0) + (a.viewCount || 0);
      const scoreB = (b.replyCount || 0) + (b.viewCount || 0);
      return scoreB - scoreA;
    });
    displayTopics(hotTopics);
  } else if (categoryKey === 'new') {
    // Sort by timestamp (newest first)
    const newTopics = [...allTopics].sort((a, b) => b.timestamp - a.timestamp);
    displayTopics(newTopics);
  } else if (categoryKey === 'unanswered') {
    // Filter topics with 0 replies
    const unansweredTopics = allTopics.filter(topic => (topic.replyCount || 0) === 0);
    displayTopics(unansweredTopics);
  } else {
    // Filter by specific category
    const filteredTopics = allTopics.filter(topic => topic.category === categoryKey);
    displayTopics(filteredTopics);
  }
};

window.showAllTopics = function() {
  displayTopics(allTopics);
};

window.searchTopics = function() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
  
  if (!searchTerm) {
    displayTopics(allTopics);
    return;
  }
  
  const filteredTopics = allTopics.filter(topic => 
    topic.title.toLowerCase().includes(searchTerm) ||
    topic.content.toLowerCase().includes(searchTerm) ||
    topic.authorName.toLowerCase().includes(searchTerm)
  );
  
  displayTopics(filteredTopics);
};

// Utility Functions
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Không xác định';
  
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return new Date(timestamp).toLocaleDateString('vi-VN');
}

function showNotification(message, type = 'info') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
  notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px;';
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  document.body.appendChild(notification);
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 5000);
}

function loadForumStats() {
  console.log('📊 Updating forum stats...');
  console.log('All topics count:', allTopics.length);
  
  const totalTopicsEl = document.getElementById('totalTopics');
  const totalRepliesEl = document.getElementById('totalReplies');
  const totalUsersEl = document.getElementById('totalUsers');
  const onlineUsersEl = document.getElementById('onlineUsers');
  
  const topicsCount = allTopics.length;
  const repliesCount = allTopics.reduce((sum, topic) => sum + (topic.replyCount || 0), 0);
  const usersCount = new Set(allTopics.map(topic => topic.authorName)).size;
  const onlineCount = currentUser ? 1 : 0;
  
  console.log('Stats:', { topicsCount, repliesCount, usersCount, onlineCount });
  
  if (totalTopicsEl) {
    totalTopicsEl.textContent = topicsCount;
    console.log('✅ Updated total topics:', topicsCount);
  }
  
  if (totalRepliesEl) {
    totalRepliesEl.textContent = repliesCount;
    console.log('✅ Updated total replies:', repliesCount);
  }
  
  if (totalUsersEl) {
    totalUsersEl.textContent = usersCount;
    console.log('✅ Updated total users:', usersCount);
  }
  
  if (onlineUsersEl) {
    onlineUsersEl.textContent = onlineCount;
    console.log('✅ Updated online users:', onlineCount);
  }
}

function updateCategoryCounts() {
  Object.keys(CATEGORIES).forEach(categoryKey => {
    const count = allTopics.filter(topic => topic.category === categoryKey).length;
    const countElement = document.getElementById(`count-${categoryKey}`);
    if (countElement) {
      countElement.textContent = count;
    }
  });
}

// Export functions for global access
window.forumFunctions = {
  signOutUser,
  showCreateTopicModal,
  createTopic,
  openTopicDetail,
  addReply,
  filterByCategory,
  showAllTopics,
  searchTopics
};

// Ensure functions are globally accessible
window.showCreateTopicModal = window.showCreateTopicModal;
window.createTopic = window.createTopic;
window.openTopicDetail = window.openTopicDetail;
window.addReply = window.addReply;
window.filterByCategory = window.filterByCategory;
window.showAllTopics = window.showAllTopics;
window.searchTopics = window.searchTopics;
window.signOutUser = window.signOutUser;

console.log('✅ All forum functions exported globally');