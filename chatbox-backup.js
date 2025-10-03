// script-chatbox.js
// Xử lý chatbox: gửi câu hỏi đến Gemini API và hiển thị phản hồi

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatWindow = document.getElementById('chat-window');
const sendBtn = document.getElementById('send-btn');
const typingIndicator = document.getElementById('typing-indicator');

// AI Personality system
const personalityModes = {
  professor: {
    name: "Giáo sư",
    prompt: "Bạn là một giáo sư đại học chuyên về Tư tưởng Hồ Chí Minh với phong cách nghiêm túc, học thuật. " +
            "Trả lời bằng ngôn ngữ trang trọng, sử dụng thuật ngữ chính xác, trích dẫn tài liệu và phân tích sâu sắc. " +
            "Cấu trúc câu trả lời rõ ràng với các luận điểm có căn cứ. Nếu câu hỏi không liên quan đến chủ tịch Hồ Chí Minh, hãy lịch sự từ chối trả lời.",
    avatar: "🎓"
  },
  storyteller: {
    name: "Người kể chuyện",
    prompt: "Bạn là một người kể chuyện thân thiện, gần gũi về Tư tưởng Hồ Chí Minh. " +
            "Sử dụng ngôn ngữ dễ hiểu, sinh động, có thể kể các câu chuyện, giai thoại để minh họa. " +
            "Tạo không khí thân mật như đang trò chuyện với bạn bè. Nếu câu hỏi không liên quan đến chủ tịch Hồ Chí Minh, hãy lịch sự từ chối trả lời.",
    avatar: "😊"
  },
  researcher: {
    name: "Nhà nghiên cứu",
    prompt: "Bạn là một nhà nghiên cứu chuyên sâu về Tư tưởng Hồ Chí Minh với khả năng phân tích chi tiết. " +
            "Cung cấp thông tin toàn diện, so sánh các quan điểm, nêu ra nhiều khía cạnh của vấn đề. " +
            "Đưa ra các dẫn chứng cụ thể, số liệu, và bối cảnh lịch sử. Nếu câu hỏi không liên quan đến chủ tịch Hồ Chí Minh, hãy lịch sự từ chối trả lời.",
    avatar: "🔬"
  }
};

let currentPersonality = 'storyteller';

// Khởi tạo chatbox với lời chào
function initializeChatbox() {
  // Lấy personality đã lưu từ localStorage
  const savedPersonality = localStorage.getItem('aiPersonality');
  if (savedPersonality && personalityModes[savedPersonality]) {
    currentPersonality = savedPersonality;
  }
  
  // Tạo welcome message
  const welcomeMessage = document.createElement('div');
  welcomeMessage.className = 'welcome-message';
  
  const currentPersonalityInfo = personalityModes[currentPersonality];
  
  welcomeMessage.innerHTML = `
    <h5 class="mb-3">Xin chào! Tôi là ${currentPersonalityInfo.name}</h5>
    <p class="mb-3">Tôi có thể giúp bạn tìm hiểu về cuộc đời, tư tưởng và di sản của Chủ tịch Hồ Chí Minh. Hãy đặt câu hỏi cho tôi!</p>
    <div class="alert alert-info mt-2 mb-3" style="font-size: 0.85rem; padding: 10px 15px; background: rgba(212, 165, 116, 0.1); border: 1px solid var(--primary-color); color: var(--accent-color);">
      <i class="bi bi-info-circle me-2"></i>
      <strong>Chế độ hiện tại:</strong> ${currentPersonalityInfo.name} - Bạn có thể thay đổi phong cách AI ở phần trên.
    </div>
    <div class="alert alert-warning mt-2 mb-3" style="font-size: 0.85rem; padding: 10px 15px;">
      <i class="bi bi-exclamation-triangle me-2"></i>
      <strong>Lưu ý:</strong> Thông tin do AI cung cấp chỉ mang tính chất tham khảo và có thể không chính xác tuyệt đối. Vui lòng kiểm chứng với các nguồn tài liệu chính thống.
    </div>    <div class="quick-questions">
      <button class="quick-question-btn" onclick="askQuickQuestion('Tư tưởng Hồ Chí Minh về độc lập dân tộc là gì?')">
        Độc lập dân tộc
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Chủ tịch Hồ Chí Minh sinh năm nao và ở đâu?')">
        Tiểu sử Bác Hồ
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Ý nghĩa câu nói Dân là gốc của chủ tịch Hồ Chí Minh?')">
        Dân là gốc
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('4 đức tính Cần kiệm liêm chính là gì?')">
        Cần kiệm liêm chính
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Tư tưởng chủ tịch Hồ Chí Minh về đại đoàn kết dân tộc?')">
        Đại đoàn kết
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Chủ tịch Hồ Chí Minh viết tác phẩm nào nổi tiếng?')">
        Tác phẩm
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Tuyên ngôn độc lập được đọc khi nào?')">
        Tuyên ngôn độc lập
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Chủ tịch Hồ Chí Minh mất vào năm nào?')">
        Ngày mất
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Ý nghĩa câu Học, học nữa, học mãi?')">
        Học tập suốt đời
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Tư tưởng văn hóa của chủ tịch Hồ Chí Minh?')">
        Tư tưởng văn hóa
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Di chúc của chủ tịch Hồ Chí Minh nói gì?')">
        Di chúc
      </button>
      <button class="quick-question-btn" onclick="askQuickQuestion('Vai trò của chủ tịch Hồ Chí Minh trong cách mạng?')">
        Vai trò lãnh đạo
      </button>
    </div>
  `;
  chatWindow.appendChild(welcomeMessage);
  
  // Hiệu ứng fade in cho welcome message
  setTimeout(() => {
    welcomeMessage.style.opacity = '1';
    welcomeMessage.style.transform = 'translateY(0)';
  }, 100);
}

// Hàm xử lý câu hỏi nhanh
function askQuickQuestion(question) {
  chatInput.value = question;
  chatForm.dispatchEvent(new Event('submit'));
}

// Hàm xử lý follow-up questions
function askFollowUpQuestion(question) {
  chatInput.value = question;
  chatForm.dispatchEvent(new Event('submit'));
}

// Hàm tạo timestamp
function getCurrentTime() {
  return new Date().toLocaleTimeString('vi-VN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

// Hàm hiển thị tin nhắn lên khung chat
function appendMessage(sender, message, isHtml = false, followUpQuestions = null) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  
  if (sender === 'user') {
    avatar.innerHTML = '<i class="bi bi-person-fill"></i>';
  } else {
    // Thêm personality avatar cho AI
    const personalityAvatar = personalityModes[currentPersonality]?.avatar || '🤖';
    avatar.innerHTML = `<span style="font-size: 1.1rem;">${personalityAvatar}</span>`;
  }
  
  const content = document.createElement('div');
  content.className = 'message-content';
  
  // Thêm personality badge cho AI messages
  if (sender === 'ai') {
    const personalityBadge = document.createElement('div');
    personalityBadge.className = 'personality-badge';
    personalityBadge.textContent = personalityModes[currentPersonality]?.name || 'AI';
    content.appendChild(personalityBadge);
  }
  
  // Xử lý nội dung message
  const messageContent = document.createElement('div');
  if (isHtml) {
    messageContent.innerHTML = message;
  } else {
    // Format text để hiển thị đẹp hơn
    const formattedMessage = formatMessage(message);
    messageContent.innerHTML = formattedMessage;
  }
  content.appendChild(messageContent);
  
  // Thêm follow-up questions cho AI messages
  if (sender === 'ai' && followUpQuestions && followUpQuestions.length > 0) {
    const followUpContainer = document.createElement('div');
    followUpContainer.className = 'follow-up-questions';
    
    const followUpTitle = document.createElement('div');
    followUpTitle.className = 'follow-up-title';
    followUpTitle.innerHTML = '<i class="bi bi-lightbulb"></i> Câu hỏi gợi ý:';
    followUpContainer.appendChild(followUpTitle);
    
    const questionsContainer = document.createElement('div');
    questionsContainer.className = 'follow-up-buttons';
    
    followUpQuestions.forEach((question, index) => {
      const questionBtn = document.createElement('button');
      questionBtn.className = 'follow-up-btn';
      questionBtn.textContent = question;
      questionBtn.onclick = () => askFollowUpQuestion(question);
      
      // Thêm delay animation cho từng button
      questionBtn.style.animationDelay = `${index * 0.1}s`;
      
      questionsContainer.appendChild(questionBtn);
    });
    
    followUpContainer.appendChild(questionsContainer);
    content.appendChild(followUpContainer);
  }
  
  const time = document.createElement('div');
  time.className = 'message-time';
  time.textContent = getCurrentTime();
  
  content.appendChild(time);
  messageDiv.appendChild(avatar);
  messageDiv.appendChild(content);
  
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
  
  return messageDiv;
}

// Hàm format message để hiển thị đẹp hơn
function formatMessage(message) {
  // Thay thế các ký tự markdown cơ bản
  let formatted = message
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
    .replace(/`(.*?)`/g, '<code style="background: rgba(212, 165, 116, 0.1); padding: 2px 4px; border-radius: 3px; font-family: monospace;">$1</code>') // `code`
    .replace(/\n/g, '<br>'); // line breaks
  
  // Tạo các đoạn văn cho câu trả lời dài
  if (formatted.length > 200) {
    formatted = formatted.replace(/\. /g, '.<br><br>');
  }
  
  return formatted;
}

// Hiển thị typing indicator
function showTypingIndicator() {
  // Tạo typing indicator element động
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message ai typing-message';
  typingDiv.id = 'dynamic-typing-indicator';
  
  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.innerHTML = '<i class="bi bi-robot"></i>';
    const content = document.createElement('div');
  content.className = 'typing-indicator';
  content.innerHTML = `
    <div class="typing-dots"></div>
  `;
  
  typingDiv.appendChild(avatar);
  typingDiv.appendChild(content);
  
  chatWindow.appendChild(typingDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Ẩn typing indicator
function hideTypingIndicator() {
  const dynamicIndicator = document.getElementById('dynamic-typing-indicator');
  if (dynamicIndicator) {
    dynamicIndicator.remove();
  }
}

// Vô hiệu hóa form khi đang gửi
function setFormDisabled(disabled) {
  chatInput.disabled = disabled;
  sendBtn.disabled = disabled;
  
  if (disabled) {
    sendBtn.innerHTML = '<i class="bi bi-hourglass-split"></i>';
  } else {
    sendBtn.innerHTML = '<i class="bi bi-send-fill"></i>';
  }
}

// Hàm gửi câu hỏi đến Gemini API (chuẩn Google Gemini API, model free)
async function sendToGemini(question) {
  // Gemini API endpoint (model free: gemini-2.5-flash)
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  // Thay YOUR_GEMINI_API_KEY bằng API key của bạn
  const apiKey = 'AIzaSyBf283oIMKAOOHGlmkjQIwRHwZMBlt_02o';
  
  // Lấy prompt theo personality hiện tại
  const personalityPrompt = personalityModes[currentPersonality]?.prompt || '';
  
  // Prompt tập trung vào kiến thức Tư Tưởng Hồ Chí Minh với personality
  const systemPrompt =
    personalityPrompt + '\n\n' +
    'Nhiệm vụ chính: trả lời mọi câu hỏi liên quan đến cuộc đời, tư tưởng, đạo đức, phong cách, và di sản của Chủ tịch Hồ Chí Minh bằng tiếng Việt.\n' +
    'Nếu câu hỏi không liên quan đến Tư tưởng Hồ Chí Minh, bạn phải trả lời: "Tôi chỉ có thể trả lời các câu hỏi có liên quan về Tư Tưởng Hồ Chí Minh."\n' +
    'Khi gặp những câu xã giao (ví dụ: "cảm ơn", "xin chào"), bạn hãy đáp lại một cách thân thiện, đồng thời lồng ghép tinh thần yêu nước và khẳng định ý nghĩa của Tư tưởng Hồ Chí Minh trong xây dựng đất nước Việt Nam.\n' +
    'Mọi câu trả lời đều cần toát lên tình yêu nước Việt Nam, niềm tự hào dân tộc, và nhấn mạnh vai trò dẫn dắt của Tư tưởng Hồ Chí Minh đối với sự nghiệp cách mạng.\n\n' +
    'QUAN TRỌNG: Sau khi trả lời câu hỏi chính, hãy đề xuất 2-3 câu hỏi tiếp theo liên quan để người dùng khám phá thêm. ( Không có chữ "Bạn muốn" hay mở đầu tương tự ) ' +
    'Định dạng như sau:\n' +
    '[CÂU TRA LỜI CHÍNH]\n\n' +
    '###FOLLOW_UP###\n' +
    '1. [Câu hỏi gợi ý 1]\n' +
    '2. [Câu hỏi gợi ý 2]\n' +
    '3. [Câu hỏi gợi ý 3]';
    
  const payload = {
    contents: [
      {
        parts: [ { text: systemPrompt + '\n\nCâu hỏi: ' + question } ]
      }
    ]
  };
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Lỗi API Gemini: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const fullResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Không tìm thấy thông tin phù hợp.';
    
    // Tách câu trả lời chính và follow-up questions
    return parseResponseWithFollowUp(fullResponse);
    
  } catch (err) {
    console.error('Gemini API Error:', err);
    return {
      answer: 'Có lỗi xảy ra khi truy vấn Gemini API: ' + err.message,
      followUpQuestions: []
    };
  }
}

// Hàm phân tích response để tách câu trả lời và follow-up questions
function parseResponseWithFollowUp(fullResponse) {
  const followUpMarker = '###FOLLOW_UP###';
  
  if (fullResponse.includes(followUpMarker)) {
    const parts = fullResponse.split(followUpMarker);
    const answer = parts[0].trim();
    const followUpText = parts[1].trim();
    
    // Trích xuất các câu hỏi follow-up
    const followUpQuestions = [];
    const lines = followUpText.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      // Tìm các dòng bắt đầu bằng số hoặc dấu gạch ngang
      if (trimmed.match(/^[\d\-\*]\.\s/) || trimmed.match(/^[\d\-\*]\s/)) {
        let question = trimmed.replace(/^[\d\-\*]\.?\s*/, '').trim();
        if (question.length > 0 && followUpQuestions.length < 3) {
          followUpQuestions.push(question);
        }
      }
    }
    
    return {
      answer: answer,
      followUpQuestions: followUpQuestions
    };
  } else {
    // Nếu không có follow-up questions, tạo một số câu hỏi mặc định dựa trên từ khóa
    const defaultFollowUps = generateDefaultFollowUps(fullResponse);
    return {
      answer: fullResponse,
      followUpQuestions: defaultFollowUps
    };
  }
}

// Hàm tạo follow-up questions mặc định dựa trên từ khóa
function generateDefaultFollowUps(answer) {
  const followUps = [];
  const lowerAnswer = answer.toLowerCase();
  
  // Tập hợp câu hỏi follow-up theo chủ đề
  const followUpQuestions = {
    'độc lập': [
      'Tuyên ngôn độc lập có ý nghĩa gì đối với dân tộc Việt Nam?',
      'Hồ Chí Minh đã chuẩn bị như thế nào cho ngày độc lập?',
      'Tinh thần độc lập của Hồ Chí Minh ảnh hưởng ra sao đến thế hệ sau?'
    ],
    'dân là gốc': [
      'Hồ Chí Minh đã thể hiện tư tưởng "Dân là gốc" như thế nào?',
      'Ý nghĩa của "Dân là gốc" trong xã hội hiện đại?',
      'Những ví dụ cụ thể về tư tưởng "Dân là gốc" trong thực tế?'
    ],
    'cần kiệm liêm chính': [
      'Làm thế nào để áp dụng "Cần kiệm liêm chính" trong cuộc sống?',
      'Tại sao Hồ Chí Minh coi trọng phẩm chất "Cần kiệm liêm chính"?',
      'Ví dụ nào cho thấy Bác Hồ thực hành "Cần kiệm liêm chính"?'
    ],
    'đại đoàn kết': [
      'Tư tưởng đại đoàn kết dân tộc có ý nghĩa gì hiện nay?',
      'Hồ Chí Minh đã xây dựng khối đại đoàn kết như thế nào?',
      'Vai trò của đại đoàn kết trong sự nghiệp xây dựng đất nước?'
    ],
    'học tập': [
      'Tại sao Hồ Chí Minh nói "Học, học nữa, học mãi"?',
      'Phương pháp học tập của Hồ Chí Minh có gì đặc biệt?',
      'Làm thế nào để áp dụng tinh thần học tập suốt đời của Bác Hồ?'
    ],
    'văn hóa': [
      'Quan điểm của Hồ Chí Minh về văn hóa dân tộc?',
      'Tư tưởng văn hóa Hồ Chí Minh có ảnh hưởng gì đến giáo dục?',
      'Làm thế nào để phát huy bản sắc văn hóa dân tộc theo tư tưởng Hồ Chí Minh?'
    ],
    'cách mạng': [
      'Vai trò lãnh đạo của Hồ Chí Minh trong cách mạng Việt Nam?',
      'Chiến lược cách mạng của Hồ Chí Minh có gì đặc sắc?',
      'Bài học từ phong cách lãnh đạo của Hồ Chí Minh?'
    ]
  };
  
  // Tìm từ khóa phù hợp và tạo follow-up questions
  for (const [keyword, questions] of Object.entries(followUpQuestions)) {
    if (lowerAnswer.includes(keyword)) {
      followUps.push(...questions.slice(0, 2));
      break;
    }
  }
  
  // Nếu không tìm thấy từ khóa nào, sử dụng câu hỏi chung
  if (followUps.length === 0) {
    followUps.push(
      'Cuộc đời Hồ Chí Minh có giai đoạn nào ấn tượng nhất?',
      'Tác phẩm nào của Hồ Chí Minh bạn muốn tìm hiểu thêm?',
      'Tư tưởng Hồ Chí Minh còn có ý nghĩa gì trong thời đại hiện nay?'
    );
  }
  
  return followUps.slice(0, 3);
}

chatForm.addEventListener('submit', async function(e) {
  e.preventDefault();
  const question = chatInput.value.trim();
  if (!question) return;
  
  // Hiển thị tin nhắn người dùng
  appendMessage('user', question);
  chatInput.value = '';
  
  // Hiển thị typing indicator và vô hiệu hóa form
  showTypingIndicator();
  setFormDisabled(true);
  
  try {
    const result = await sendToGemini(question);
    hideTypingIndicator();
    
    if (typeof result === 'object' && result.answer) {
      // Trường hợp có follow-up questions
      appendMessage('ai', result.answer, false, result.followUpQuestions);
    } else {
      // Trường hợp chỉ có câu trả lời (backward compatibility)
      appendMessage('ai', result);
    }
  } catch (error) {
    hideTypingIndicator();
    appendMessage('ai', 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.');
  } finally {
    setFormDisabled(false);
    chatInput.focus();
  }
});

// Khởi tạo chatbox khi trang được tải
document.addEventListener('DOMContentLoaded', function() {
  initializeChatbox();
  chatInput.focus();
  
  // Khởi tạo personality selector
  initializePersonalitySelector();
});

// Khởi tạo personality selector
function initializePersonalitySelector() {
  const personalitySelect = document.getElementById('personality-mode');
  if (personalitySelect) {
    // Set value từ current personality (đã được load từ localStorage)
    personalitySelect.value = currentPersonality;
    
    // Add change event listener
    personalitySelect.addEventListener('change', function() {
      const newPersonality = this.value;
      const oldPersonality = currentPersonality;
      
      // Nếu không thay đổi thực sự thì không làm gì
      if (newPersonality === oldPersonality) {
        return;
      }
      
      // Hiển thị modal xác nhận
      showPersonalityChangeConfirmation(newPersonality, oldPersonality, this);
    });
  }
}

// Hiển thị modal xác nhận thay đổi personality
function showPersonalityChangeConfirmation(newPersonality, oldPersonality, selectElement) {
  const newPersonalityInfo = personalityModes[newPersonality];
  const oldPersonalityInfo = personalityModes[oldPersonality];
  
  const modal = document.createElement('div');
  modal.className = 'personality-change-modal';
  modal.innerHTML = `
    <div class="modal-backdrop"></div>
    <div class="modal-content">
      <div class="modal-header">
        <h5>Xác nhận thay đổi chế độ AI</h5>
      </div>
      <div class="modal-body">
        <div class="change-info">
          <div class="">
            <span class="personality-name">${oldPersonalityInfo.name}</span>
          </div>
          <div class="arrow">→</div>
          <div class="">
            <span class="personality-name">${newPersonalityInfo.name}</span>
          </div>
        </div>
        <p class="warning-text">
          <i class="bi bi-info-circle"></i>
          Trang sẽ được tải lại để áp dụng chế độ mới. Cuộc hội thoại hiện tại sẽ bị xóa.
        </p>
      </div>
      <div class="modal-footer">
        <button class="btn-cancel">Hủy</button>
        <button class="btn-confirm">Xác nhận</button>
      </div>
    </div>
  `;
    // Thêm CSS cho modal
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0;
    padding: 20px;
    box-sizing: border-box;
  `;
    // Style cho các elements
  const backdrop = modal.querySelector('.modal-backdrop');
  backdrop.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 1000000px;
    height: 10000px;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 1;
  `;
  
  const content = modal.querySelector('.modal-content');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
    max-width: 480px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    position: relative;
    z-index: 2;
    transform: scale(0.8) translateY(-20px);
    opacity: 0;
    transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
     position: fixed;
  top: 10%;
  left: 40%;
  `;
    const header = modal.querySelector('.modal-header');
  header.style.cssText = `
    padding: 25px 30px 20px;
    border-bottom: 1px solid #f0f0f0;
    text-align: center;
  `;
  
  const headerTitle = header.querySelector('h5');
  if (headerTitle) {
    headerTitle.style.cssText = `
      margin: 0;
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--accent-color);
    `;
  }
    const body = modal.querySelector('.modal-body');
  body.style.cssText = `
    padding: 25px 30px;
    text-align: center;
  `;
  
  const changeInfo = modal.querySelector('.change-info');
  changeInfo.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-bottom: 20px;
    padding: 20px;
    background: linear-gradient(135deg, var(--light-bg) 0%, #f8f9fa 100%);
    border-radius: 12px;
    border: 1px solid rgba(212, 165, 116, 0.2);
  `;
    const personalities = modal.querySelectorAll('.from-personality, .to-personality');
  personalities.forEach(p => {
    p.style.cssText = `
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      font-weight: 600;
      color: var(--accent-color);
    `;
  });
  
  const personalityNames = modal.querySelectorAll('.personality-name');
  personalityNames.forEach(name => {
    name.style.cssText = `
      font-size: 1rem;
      text-align: center;
    `;
  });
  
  const icons = modal.querySelectorAll('.personality-icon');
  icons.forEach(icon => {
    icon.style.cssText = `
      font-size: 2rem;
      margin-bottom: 5px;
    `;
  });
  
  const arrow = modal.querySelector('.arrow');
  arrow.style.cssText = `
    font-size: 1.5rem;
    color: var(--primary-color);
    font-weight: bold;
    transform: translateY(-5px);
  `;
    const warning = modal.querySelector('.warning-text');
  warning.style.cssText = `
    color: #666;
    font-size: 0.95rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin: 0;
    padding: 15px;
    background: rgba(255, 193, 7, 0.1);
    border: 1px solid rgba(255, 193, 7, 0.3);
    border-radius: 8px;
    line-height: 1.4;
  `;
  
  const footer = modal.querySelector('.modal-footer');
  footer.style.cssText = `
    padding: 20px 30px 25px;
    display: flex;
    gap: 15px;
    justify-content: center;
  `;
    const buttons = modal.querySelectorAll('.btn-cancel, .btn-confirm');
  buttons.forEach(btn => {
    btn.style.cssText = `
      padding: 12px 30px;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    `;
  });
  
  const cancelBtn = modal.querySelector('.btn-cancel');
  cancelBtn.style.cssText += `
    background: #f8f9fa;
    color: #6c757d;
    border: 2px solid #e9ecef;
  `;
  
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#e9ecef';
    cancelBtn.style.color = '#495057';
    cancelBtn.style.transform = 'translateY(-1px)';
  });
  
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = '#f8f9fa';
    cancelBtn.style.color = '#6c757d';
    cancelBtn.style.transform = 'translateY(0)';
  });
  
  const confirmBtn = modal.querySelector('.btn-confirm');
  confirmBtn.style.cssText += `
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    box-shadow: 0 4px 15px rgba(212, 165, 116, 0.3);
  `;
  
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.transform = 'translateY(-2px)';
    confirmBtn.style.boxShadow = '0 6px 20px rgba(212, 165, 116, 0.4)';
  });
  
  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.transform = 'translateY(0)';
    confirmBtn.style.boxShadow = '0 4px 15px rgba(212, 165, 116, 0.3)';
  });
  
  document.body.appendChild(modal);
    // Animation
  setTimeout(() => {
    content.style.transform = 'scale(1) translateY(0)';
    content.style.opacity = '1';
  }, 50);
  
  // Event listeners
  cancelBtn.addEventListener('click', () => {
    // Reset select về giá trị cũ
    selectElement.value = oldPersonality;
    closeModal();
  });
  
  confirmBtn.addEventListener('click', () => {
    closeModal();
    // Thêm loading effect cho dropdown
    selectElement.classList.add('personality-loading');
    selectElement.disabled = true;
    
    // Delay để hiển thị loading effect
    setTimeout(() => {
      changePersonality(newPersonality);
    }, 200);
  });
  
  backdrop.addEventListener('click', () => {
    selectElement.value = oldPersonality;
    closeModal();
  });
    function closeModal() {
    content.style.transform = 'scale(0.8) translateY(-20px)';
    content.style.opacity = '0';
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 400);
  }
}

// Thay đổi personality mode
function changePersonality(newPersonality) {
  if (personalityModes[newPersonality]) {
    currentPersonality = newPersonality;
    
    // Lưu vào localStorage trước
    localStorage.setItem('aiPersonality', newPersonality);
    
    // Hiển thị loading overlay
    showPageLoadingOverlay();
    
    // Hiển thị thông báo thay đổi personality
    const personalityInfo = personalityModes[newPersonality];
    const changeMessage = `Đang chuyển sang chế độ: ${personalityInfo.name}...`;
    
    // Thêm animation cho thông báo với countdown
    showPersonalityChangeNotification(changeMessage, personalityInfo.avatar, true);
  }
}

// Hiển thị loading overlay trên toàn trang
function showPageLoadingOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'page-loading-overlay';
  overlay.innerHTML = `
    <div class="loading-content">
      <div class="loading-spinner"></div>
      <div class="loading-text">Đang chuẩn bị chế độ mới...</div>
    </div>
  `;
  
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(212, 165, 116, 0.95);
    backdrop-filter: blur(5px);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;
  
  const loadingContent = overlay.querySelector('.loading-content');
  loadingContent.style.cssText = `
    text-align: center;
    color: white;
    font-family: inherit;
  `;
  
  const spinner = overlay.querySelector('.loading-spinner');
  spinner.style.cssText = `
    width: 50px;
    height: 50px;
    border: 3px solid rgba(255, 255, 255, 0.3);
    border-top: 3px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 15px;
  `;
  
  const loadingText = overlay.querySelector('.loading-text');
  loadingText.style.cssText = `
    font-size: 1.1rem;
    font-weight: 500;
  `;
  
  // Thêm keyframe cho spinner
  if (!document.querySelector('#spinner-style')) {
    const style = document.createElement('style');
    style.id = 'spinner-style';
    style.textContent = `
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(overlay);
  
  // Fade in
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);
}

// Hiển thị thông báo thay đổi personality
function showPersonalityChangeNotification(message, avatar, shouldReload = false) {
  const notification = document.createElement('div');
  notification.className = 'personality-notification';
  
  if (shouldReload) {
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-avatar">${avatar}</span>
        <span class="notification-text">${message}</span>
        <div class="reload-countdown">
          <div class="countdown-circle">
            <span class="countdown-number">3</span>
          </div>
        </div>
      </div>
    `;
  } else {
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-avatar">${avatar}</span>
        <span class="notification-text">${message}</span>
      </div>
    `;
  }
  
  // Thêm CSS cho notification
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%);
    color: white;
    padding: 15px 25px;
    border-radius: 12px;
    box-shadow: 0 6px 20px rgba(212, 165, 116, 0.4);
    z-index: 1000;
    opacity: 0;
    transform: translateX(100px);
    transition: all 0.3s ease;
    font-size: 0.9rem;
    min-width: 280px;
  `;
  
  document.body.appendChild(notification);
  
  // Animation
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 100);
  
  if (shouldReload) {
    // Countdown và reload
    let countdown = 1.5;
    const countdownElement = notification.querySelector('.countdown-number');
    const countdownCircle = notification.querySelector('.countdown-circle');
    
    // Thêm CSS cho countdown
    countdownCircle.style.cssText = `
      width: 30px;
      height: 30px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 10px;
      position: relative;
      overflow: hidden;
    `;
    
    countdownElement.style.cssText = `
      font-weight: bold;
      font-size: 0.9rem;
      position: relative;
      z-index: 2;
    `;
    
    // Thêm progress ring
    const progressRing = document.createElement('div');
    progressRing.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(white 0deg, transparent 0deg);
      transition: background 1s linear;
    `;
    countdownCircle.appendChild(progressRing);
    
    const countdownInterval = setInterval(() => {
      countdown--;
      countdownElement.textContent = countdown;
      
      // Cập nhật progress ring
      const degree = (2 - countdown) * 120;
      progressRing.style.background = `conic-gradient(white ${degree}deg, transparent ${degree}deg)`;
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        // Reload trang
        window.location.reload();
      }
    }, 1000);
    
  } else {
    // Tự động ẩn sau 3 giây cho thông báo thường
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100px)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }
}

// Xử lý Enter để gửi tin nhắn
chatInput.addEventListener('keypress', function(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    chatForm.dispatchEvent(new Event('submit'));
  }
});

// Auto-resize textarea khi nhập nhiều dòng
chatInput.addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = this.scrollHeight + 'px';
});

// Làm global function askQuickQuestion
window.askQuickQuestion = askQuickQuestion;
window.askFollowUpQuestion = askFollowUpQuestion;
