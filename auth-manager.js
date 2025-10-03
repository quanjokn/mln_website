// auth-manager.js - Centralized Authentication Manager
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

class AuthManager {
    constructor() {
        this.auth = null;
        this.provider = null;
        this.currentUser = null;
        this.listeners = [];
        this.isInitialized = false;
        this.initPromise = null;
    }

    async initialize() {
        if (this.isInitialized) {
            return this.auth;
        }

        if (this.initPromise) {
            return this.initPromise;
        }

        this.initPromise = this._doInitialize();
        return this.initPromise;
    }

    async _doInitialize() {
        try {
            // Import Firebase modules dynamically
            const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js');
            const { 
                getAuth, 
                signInWithPopup, 
                GoogleAuthProvider, 
                signOut, 
                onAuthStateChanged 
            } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js');

            // Store Firebase functions for later use
            this.signInWithPopup = signInWithPopup;
            this.firebaseSignOut = signOut;
            this.onAuthStateChanged = onAuthStateChanged;

            // Initialize Firebase
            const app = initializeApp(firebaseConfig);
            this.auth = getAuth(app);
            this.provider = new GoogleAuthProvider();

            // Listen for auth state changes
            this.onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                this._updateUserProfile(user);
                this._notifyListeners(user);
            });

            this.isInitialized = true;
            console.log('✅ AuthManager initialized successfully');
            return this.auth;

        } catch (error) {
            console.error('❌ AuthManager initialization error:', error);
            throw error;
        }
    }

    _updateUserProfile(user) {
        if (user) {
            const userProfile = {
                name: user.displayName,
                email: user.email,
                picture: user.photoURL,
                sub: user.uid,
                uid: user.uid
            };
            localStorage.setItem('userProfile', JSON.stringify(userProfile));
            console.log('✅ User profile updated:', user.displayName);
        } else {
            localStorage.removeItem('userProfile');
            console.log('ℹ️ User profile cleared');
        }
    }

    _notifyListeners(user) {
        this.listeners.forEach(listener => {
            try {
                listener(user);
            } catch (error) {
                console.error('Error in auth listener:', error);
            }
        });
    }

    // Add auth state listener
    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        
        // If already initialized and user exists, call immediately
        if (this.isInitialized && this.currentUser) {
            callback(this.currentUser);
        }
        
        // Return unsubscribe function
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Sign in with Google
    async signIn() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            const result = await this.signInWithPopup(this.auth, this.provider);
            const user = result.user;
            console.log('✅ Sign in successful:', user.displayName);
            return user;
        } catch (error) {
            console.error('❌ Sign in error:', error);
            throw error;
        }
    }

    // Sign out
    async signOut() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        try {
            await this.firebaseSignOut(this.auth);
            console.log('✅ Sign out successful');
        } catch (error) {
            console.error('❌ Sign out error:', error);
            throw error;
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.currentUser !== null;
    }

    // Get user profile from localStorage
    getUserProfile() {
        const userProfile = localStorage.getItem('userProfile');
        if (userProfile) {
            try {
                return JSON.parse(userProfile);
            } catch (error) {
                console.error('Error parsing user profile:', error);
                localStorage.removeItem('userProfile');
                return null;
            }
        }
        return null;
    }

    // Wait for auth state to be determined
    async waitForAuthState() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        return new Promise((resolve) => {
            if (this.currentUser !== undefined) {
                resolve(this.currentUser);
            } else {
                const unsubscribe = this.onAuthStateChanged((user) => {
                    unsubscribe();
                    resolve(user);
                });
            }
        });
    }

    // Check if user needs to login and redirect if necessary
    async requireAuth(redirectUrl = 'login.html') {
        const user = await this.waitForAuthState();
        if (!user) {
            console.log('User not authenticated, redirecting to login...');
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }

    // Get OAuth2 access token for Google Sheets API
    async getAccessToken() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (!this.currentUser) {
            throw new Error("User not authenticated. Please login first.");
        }

        // Load Google Identity Services if not already loaded
        if (typeof google === 'undefined' || !google.accounts.oauth2) {
            await this._loadGoogleIdentityServices();
        }

        return new Promise((resolve, reject) => {
            google.accounts.oauth2.initTokenClient({
                client_id: "118407744836973155611",
                scope: "https://www.googleapis.com/auth/spreadsheets",
                callback: (response) => {
                    if (response.error) {
                        console.error("OAuth2 error:", response.error);
                        reject(new Error(`OAuth2 error: ${response.error}`));
                        return;
                    }
                    
                    console.log("OAuth2 token obtained successfully");
                    resolve(response.access_token);
                }
            }).requestAccessToken();
        });
    }

    // Load Google Identity Services
    _loadGoogleIdentityServices() {
        return new Promise((resolve, reject) => {
            if (typeof google !== 'undefined' && google.accounts.oauth2) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            script.onload = () => {
                if (typeof google !== 'undefined' && google.accounts.oauth2) {
                    resolve();
                } else {
                    reject(new Error('Google Identity Services failed to load'));
                }
            };
            script.onerror = () => {
                reject(new Error('Failed to load Google Identity Services'));
            };
            document.head.appendChild(script);
        });
    }
}

// Create global instance
window.authManager = new AuthManager();

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        await window.authManager.initialize();
        console.log('✅ AuthManager ready');
    } catch (error) {
        console.error('❌ Failed to initialize AuthManager:', error);
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}

console.log('✅ auth-manager.js loaded');
