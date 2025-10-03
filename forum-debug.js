// forum-fallback.js - Alternative Firebase setup with more error handling
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
  getDatabase, 
  ref, 
  push, 
  set, 
  onValue, 
  off,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
  connectDatabaseEmulator
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyASgyPCEktt6XzKYeSy9D9rrnR2hHb0110",
  authDomain: "mln111-cff07.firebaseapp.com",
  databaseURL: "https://mln111-cff07-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "mln111-cff07",
  storageBucket: "mln111-cff07.firebasestorage.app",
  messagingSenderId: "25534326749",
  appId: "1:25534326749:web:a896b2aa1ff6958bdaf834",
  measurementId: "G-5ZP1K3NQN3"
};

// Initialize Firebase with error handling
let app, auth, database, provider;

try {
  console.log('🔥 Initializing Firebase...');
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized');
  
  auth = getAuth(app);
  console.log('✅ Firebase auth initialized');
  
  // Try to initialize database with additional error handling
  database = getDatabase(app);
  console.log('✅ Firebase database initialized');
  console.log('Database URL:', firebaseConfig.databaseURL);
  
  provider = new GoogleAuthProvider();
  console.log('✅ Google Auth provider initialized');
  
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
  alert('Lỗi khởi tạo Firebase: ' + error.message);
}

// Test database connection
function testDatabaseConnection() {
  try {
    const testRef = ref(database, '.info/connected');
    onValue(testRef, (snapshot) => {
      if (snapshot.val() === true) {
        console.log('✅ Database connected successfully');
      } else {
        console.log('❌ Database disconnected');
      }
    });
  } catch (error) {
    console.error('❌ Database connection test failed:', error);
  }
}

// Global variables
let currentUser = null;
let allTopics = [];
let allCategories = [];

// Forum Categories (same as before)
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

// Initialize forum when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Forum initializing...');
  
  // Test database connection first
  if (database) {
    testDatabaseConnection();
  }
  
  // Check authentication state
  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        console.log('✅ User authenticated:', user.displayName);
        updateAuthUI(user);
        updateUserStats(user);
      } else {
        currentUser = null;
        console.log('ℹ️ No user authenticated');
        updateAuthUI(null);
      }
    });
  }

  // Load initial data
  loadCategories();
  if (database) {
    loadTopics();
    loadForumStats();
  } else {
    console.error('❌ Cannot load topics - database not available');
    showOfflineMessage();
  }
});

// Show offline message if database not available
function showOfflineMessage() {
  const container = document.getElementById('topicsContainer');
  if (container) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="bi bi-wifi-off text-danger" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-danger">Không thể kết nối database</h5>
        <p class="text-muted">Vui lòng kiểm tra:</p>
        <ul class="list-unstyled">
          <li>1. Firebase project đã được tạo chưa?</li>
          <li>2. Realtime Database đã được enable chưa?</li>
          <li>3. Config trong forum.js đã đúng chưa?</li>
        </ul>
        <button class="btn btn-primary mt-3" onclick="location.reload()">
          <i class="bi bi-arrow-clockwise me-1"></i>Thử lại
        </button>
      </div>
    `;
  }
}

// Authentication Functions (same as before but with error handling)
window.signInWithGoogle = function() {
  if (!auth || !provider) {
    alert('Authentication service not available');
    return;
  }
  
  signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log('✅ User signed in:', user.displayName);
      
      // Close login modal
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      if (loginModal) loginModal.hide();
      
      // Show success message
      showNotification('Đăng nhập thành công!', 'success');
    })
    .catch((error) => {
      console.error('❌ Sign in error:', error);
      showNotification('Đăng nhập thất bại: ' + error.message, 'error');
    });
};

window.signOutUser = function() {
  if (!auth) {
    alert('Authentication service not available');
    return;
  }
  
  signOut(auth).then(() => {
    console.log('✅ User signed out');
    showNotification('Đã đăng xuất thành công!', 'info');
  }).catch((error) => {
    console.error('❌ Sign out error:', error);
  });
};

// Rest of the functions remain the same...
// (I'll copy the essential functions from the original forum.js)

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
    if (createTopicBtn) createTopicBtn.style.display = 'inline-block';
  } else {
    authSection.innerHTML = `
      <button class="btn btn-light" data-bs-toggle="modal" data-bs-target="#loginModal">
        <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
      </button>
    `;
    if (createTopicBtn) createTopicBtn.style.display = 'none';
  }
}

function loadCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;
  
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

function loadTopics() {
  if (!database) {
    console.error('❌ Cannot load topics - database not available');
    return;
  }
  
  const topicsRef = ref(database, 'topics');
  const topicsQuery = query(topicsRef, orderByChild('timestamp'));
  
  onValue(topicsQuery, (snapshot) => {
    const topics = snapshot.val();
    allTopics = topics ? Object.keys(topics).map(key => ({
      id: key,
      ...topics[key]
    })).reverse() : []; // Reverse to show newest first
    
    displayTopics(allTopics);
    updateCategoryCounts();
  }, (error) => {
    console.error('❌ Error loading topics:', error);
    showOfflineMessage();
  });
}

function displayTopics(topics) {
  const container = document.getElementById('topicsContainer');
  if (!container) return;
  
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

// Essential utility functions
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
  const totalTopicsEl = document.getElementById('totalTopics');
  const totalRepliesEl = document.getElementById('totalReplies');
  const totalUsersEl = document.getElementById('totalUsers');
  const onlineUsersEl = document.getElementById('onlineUsers');
  
  if (totalTopicsEl) totalTopicsEl.textContent = allTopics.length;
  if (totalRepliesEl) totalRepliesEl.textContent = allTopics.reduce((sum, topic) => sum + (topic.replyCount || 0), 0);
  if (totalUsersEl) totalUsersEl.textContent = new Set(allTopics.map(topic => topic.authorId)).size;
  if (onlineUsersEl) onlineUsersEl.textContent = currentUser ? '1' : '0';
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

function updateUserStats(user) {
  if (!database) return;
  
  const userRef = ref(database, `users/${user.uid}`);
  set(userRef, {
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    lastSeen: serverTimestamp()
  }).catch(error => {
    console.error('❌ Error updating user stats:', error);
  });
}

// Dummy functions for now (you can implement these later)
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
  
  if (!database) {
    showNotification('Database không khả dụng!', 'error');
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
  
  console.log('Creating topic:', { title, category, content, pinned });
  
  const topicsRef = ref(database, 'topics');
  const newTopicRef = push(topicsRef);
  
  const topicData = {
    title: title,
    content: content,
    category: category,
    authorId: currentUser.uid,
    authorName: currentUser.displayName,
    authorPhoto: currentUser.photoURL,
    timestamp: Date.now(),
    pinned: pinned,
    replyCount: 0,
    viewCount: 0,
    lastActivity: Date.now()
  };
  
  set(newTopicRef, topicData)
    .then(() => {
      console.log('✅ Topic created successfully');
      showNotification('Chủ đề đã được tạo thành công!', 'success');
      
      // Close modal and reset form
      const modal = bootstrap.Modal.getInstance(document.getElementById('createTopicModal'));
      modal.hide();
      document.getElementById('createTopicForm').reset();
    })
    .catch((error) => {
      console.error('❌ Error creating topic:', error);
      showNotification('Có lỗi xảy ra khi tạo chủ đề: ' + error.message, 'error');
    });
};

window.filterByCategory = function(categoryKey) {
  console.log('Filtering by category:', categoryKey);
  
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
  const searchInput = document.getElementById('searchInput');
  if (!searchInput) return;
  
  const searchTerm = searchInput.value.toLowerCase().trim();
  
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

window.openTopicDetail = function(topicId) {
  const topic = allTopics.find(t => t.id === topicId);
  if (!topic) return;
  
  console.log('Opening topic detail:', topic.title);
  
  // Update view count
  if (database) {
    const topicRef = ref(database, `topics/${topicId}/viewCount`);
    set(topicRef, (topic.viewCount || 0) + 1);
  }
  
  // Show modal
  const modal = new bootstrap.Modal(document.getElementById('topicDetailModal'));
  
  // Set title
  const category = CATEGORIES[topic.category] || { name: 'Khác', icon: 'bi-tag' };
  const titleElement = document.getElementById('topicDetailTitle');
  if (titleElement) {
    titleElement.innerHTML = `
      <i class="${category.icon} me-2"></i>${topic.title}
    `;
  }
  
  // Load content and replies
  loadTopicDetail(topicId);
  
  modal.show();
};

function loadTopicDetail(topicId) {
  const topic = allTopics.find(t => t.id === topicId);
  if (!topic) return;
  
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
          <div class="text-center py-4 text-muted">
            <i class="bi bi-chat-dots"></i>
            <p class="mb-0 mt-2">Chưa có phản hồi nào</p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  const contentElement = document.getElementById('topicDetailContent');
  if (contentElement) {
    contentElement.innerHTML = contentHTML;
  }
  
  // Setup footer with reply form
  const footer = document.getElementById('topicDetailFooter');
  if (footer) {
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
  }
  
  // Load replies if database available
  if (database) {
    loadReplies(topicId);
  }
}

function loadReplies(topicId) {
  const repliesRef = ref(database, `replies/${topicId}`);
  
  onValue(repliesRef, (snapshot) => {
    const replies = snapshot.val();
    const repliesArray = replies ? Object.keys(replies).map(key => ({
      id: key,
      ...replies[key]
    })).sort((a, b) => a.timestamp - b.timestamp) : [];
    
    displayReplies(repliesArray);
    const replyCountEl = document.getElementById('replyCount');
    if (replyCountEl) {
      replyCountEl.textContent = repliesArray.length;
    }
  });
}

function displayReplies(replies) {
  const container = document.getElementById('repliesContainer');
  if (!container) return;
  
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
  
  if (!database) {
    showNotification('Database không khả dụng!', 'error');
    return;
  }
  
  const contentEl = document.getElementById('replyContent');
  if (!contentEl) return;
  
  const content = contentEl.value.trim();
  if (!content) {
    showNotification('Vui lòng nhập nội dung phản hồi!', 'error');
    return;
  }
  
  const repliesRef = ref(database, `replies/${topicId}`);
  const newReplyRef = push(repliesRef);
  
  const replyData = {
    content: content,
    authorId: currentUser.uid,
    authorName: currentUser.displayName,
    authorPhoto: currentUser.photoURL,
    timestamp: Date.now()
  };
  
  set(newReplyRef, replyData)
    .then(() => {
      // Update topic reply count
      const topic = allTopics.find(t => t.id === topicId);
      if (topic) {
        const newReplyCount = (topic.replyCount || 0) + 1;
        const topicRef = ref(database, `topics/${topicId}`);
        set(topicRef, {
          ...topic,
          replyCount: newReplyCount,
          lastActivity: Date.now()
        });
      }
      
      // Clear form
      contentEl.value = '';
      showNotification('Phản hồi đã được gửi!', 'success');
    })
    .catch((error) => {
      console.error('❌ Error adding reply:', error); 
    });
}

// Export functions for global access
window.forumFunctions = {
  signInWithGoogle,
  signOutUser,
  showCreateTopicModal,
  createTopic,
  openTopicDetail,
  addReply,
  filterByCategory,
  showAllTopics,
  searchTopics
};