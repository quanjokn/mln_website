// auth.js - Firebase Authentication System
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Firebase Configuration - Sử dụng chung cho toàn bộ website
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Set persistence to maintain auth state across page reloads
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('✅ Auth persistence set to LOCAL');
  })
  .catch((error) => {
    console.error('❌ Error setting auth persistence:', error);
  });

// Global variables
let currentUser = null;
let authStateListeners = [];

// Authentication state management
onAuthStateChanged(auth, (user) => {
  currentUser = user;
  console.log('Auth state changed:', user ? user.displayName : 'No user');
  
  // Notify all listeners
  authStateListeners.forEach(listener => {
    try {
      listener(user);
    } catch (error) {
      console.error('Error in auth state listener:', error);
    }
  });
});

// Authentication Functions
window.signInWithGoogle = function() {
  return signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      console.log('✅ User signed in:', user.displayName);
      
      // Close login modal if exists
      const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
      if (loginModal) loginModal.hide();
      
      // Show success message
      showNotification('Đăng nhập thành công!', 'success');
      
      return user;
    })
    .catch((error) => {
      console.error('❌ Sign in error:', error);
      showNotification('Đăng nhập thất bại. Vui lòng thử lại!', 'error');
      throw error;
    });
};

window.signOutUser = function() {
  return signOut(auth).then(() => {
    console.log('✅ User signed out');
    showNotification('Đã đăng xuất thành công!', 'info');
  }).catch((error) => {
    console.error('❌ Sign out error:', error);
    showNotification('Có lỗi xảy ra khi đăng xuất!', 'error');
    throw error;
  });
};

// Authentication middleware
window.requireAuth = function(callback) {
  if (currentUser) {
    callback(currentUser);
  } else {
    // Show login modal
    const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
    loginModal.show();
    
    // Set up one-time listener for successful login
    const authListener = (user) => {
      if (user) {
        // Remove this listener
        removeAuthStateListener(authListener);
        // Execute callback
        callback(user);
      }
    };
    addAuthStateListener(authListener);
  }
};

// Add auth state listener
function addAuthStateListener(listener) {
  authStateListeners.push(listener);
}

// Remove auth state listener
function removeAuthStateListener(listener) {
  const index = authStateListeners.indexOf(listener);
  if (index > -1) {
    authStateListeners.splice(index, 1);
  }
}

// Check if user is authenticated
window.isAuthenticated = function() {
  return currentUser !== null;
};

// Get current user
window.getCurrentUser = function() {
  return currentUser;
};

// Initialize authentication for a page
window.initAuth = function(options = {}) {
  const {
    onAuthSuccess = null,
    onAuthFailure = null,
    requireAuth = false,
    showUserInfo = false
  } = options;

  console.log('🔐 Initializing authentication...');

  // Check current auth state immediately
  if (currentUser) {
    console.log('✅ User already authenticated:', currentUser.displayName);
    
    // Update UI if needed
    if (showUserInfo) {
      updateUserInfoUI(currentUser);
    }
    
    // Call success callback
    if (onAuthSuccess) {
      onAuthSuccess(currentUser);
    }
    
    // Hide login required messages if any
    hideLoginRequiredMessages();
  } else {
    console.log('ℹ️ No user authenticated');
    
    // Update UI if needed
    if (showUserInfo) {
      updateUserInfoUI(null);
    }
    
    // Call failure callback
    if (onAuthFailure) {
      onAuthFailure();
    }
    
    // Show login required messages if needed
    if (requireAuth) {
      showLoginRequiredMessages();
    }
  }

  // Add auth state listener for future changes
  const authListener = (user) => {
    if (user) {
      console.log('✅ User authenticated:', user.displayName);
      
      // Update UI if needed
      if (showUserInfo) {
        updateUserInfoUI(user);
      }
      
      // Call success callback
      if (onAuthSuccess) {
        onAuthSuccess(user);
      }
      
      // Hide login required messages if any
      hideLoginRequiredMessages();
      
    } else {
      console.log('ℹ️ No user authenticated');
      
      // Update UI if needed
      if (showUserInfo) {
        updateUserInfoUI(null);
      }
      
      // Call failure callback
      if (onAuthFailure) {
        onAuthFailure();
      }
      
      // Show login required messages if needed
      if (requireAuth) {
        showLoginRequiredMessages();
      }
    }
  };
  
  addAuthStateListener(authListener);
  
  // Return cleanup function
  return () => removeAuthStateListener(authListener);
};

// Update user info UI
function updateUserInfoUI(user) {
  const userInfoElements = document.querySelectorAll('.user-info');
  
  userInfoElements.forEach(element => {
    if (user) {
      element.innerHTML = `
        <div class="d-flex align-items-center gap-3">
          <div class="user-info d-flex align-items-center">
            <img src="${user.photoURL || '/pic/default-avatar.png'}" 
                 alt="${user.displayName}" 
                 class="rounded-circle me-2" 
                 width="32" height="32">
            <span class="fw-medium">${user.displayName}</span>
          </div>
          <button class="btn btn-outline-secondary btn-sm" onclick="signOutUser()">
            <i class="bi bi-box-arrow-right me-1"></i>Đăng xuất
          </button>
        </div>
      `;
    } else {
      element.innerHTML = `
        <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
          <i class="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
        </button>
      `;
    }
  });
}

// Show login required messages
function showLoginRequiredMessages() {
  const loginRequiredElements = document.querySelectorAll('.login-required');
  loginRequiredElements.forEach(element => {
    element.style.display = 'block';
  });
  
  const authRequiredElements = document.querySelectorAll('.auth-required');
  authRequiredElements.forEach(element => {
    element.style.display = 'none';
  });
}

// Hide login required messages
function hideLoginRequiredMessages() {
  const loginRequiredElements = document.querySelectorAll('.login-required');
  loginRequiredElements.forEach(element => {
    element.style.display = 'none';
  });
  
  const authRequiredElements = document.querySelectorAll('.auth-required');
  authRequiredElements.forEach(element => {
    element.style.display = 'block';
  });
}

// Show notification
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

// Create login modal if it doesn't exist
window.createLoginModal = function() {
  if (document.getElementById('loginModal')) {
    return; // Modal already exists
  }
  
  const modalHTML = `
    <div class="modal fade" id="loginModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-classical text-white">
            <h5 class="modal-title">
              <i class="bi bi-box-arrow-in-right me-2"></i>Đăng nhập
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body text-center py-4">
            <div class="mb-4">
              <i class="bi bi-shield-check text-primary" style="font-size: 3rem;"></i>
            </div>
            <h5 class="mb-3">Đăng nhập để tiếp tục</h5>
            <p class="mb-4">Bạn cần đăng nhập để sử dụng tính năng này</p>
            <button class="btn btn-danger btn-lg" onclick="signInWithGoogle()">
              <i class="bi bi-google me-2"></i>Đăng nhập với Google
            </button>
            <p class="mt-3 small text-muted">
              Bằng việc đăng nhập, bạn đồng ý với điều khoản sử dụng
            </p>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.insertAdjacentHTML('beforeend', modalHTML);
};

// Export functions for global access
window.authFunctions = {
  signInWithGoogle,
  signOutUser,
  requireAuth,
  isAuthenticated,
  getCurrentUser,
  initAuth,
  createLoginModal
};

// Auto-create login modal when script loads
document.addEventListener('DOMContentLoaded', function() {
  createLoginModal();
});

console.log('✅ Authentication system loaded');
