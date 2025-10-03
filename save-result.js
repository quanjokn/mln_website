// save-result.js - AuthManager + Google Sheets Integration
const sheetId = "1kx--gwSvckfHcUMxAKcZbfxKhN_Jf7s1tQQECro1-1U";
const apiKey = "AIzaSyBNi1lEqoeaUoTkWNYg8rqdwcvziJ7ImAw";
const resultRange = "Result!A:F"; 

// Google Sheets token management
let accessToken = null;
let tokenExpiry = null;
const resultSheetName = "Result";

/**
 * Get OAuth2 access token using AuthManager
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        // Use AuthManager to get access token
        if (window.authManager) {
            accessToken = await window.authManager.getAccessToken();
            tokenExpiry = Date.now() + (3600 * 1000); // 1 hour expiry
            console.log("OAuth2 token obtained successfully via AuthManager");
            return accessToken;
        } else {
            throw new Error("AuthManager not available");
        }

    } catch (error) {
        console.error("Error getting OAuth2 access token:", error);
        throw error;
    }
}

/**
 * Check if student already exists in the sheet
 * @param {string} mssv - Student ID
 * @param {string} name - Student name
 * @returns {Promise<Object>} Check result
 */
async function checkExistingStudent(mssv, name) {
    try {
        console.log("Checking existing student:", mssv, name);
        
        const token = await getAccessToken();
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${resultSheetName}!A:B?key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Sheet data received:", data);

        if (data.values && data.values.length > 0) {
            // Check if student exists (skip header row)
            for (let i = 1; i < data.values.length; i++) {
                const row = data.values[i];
                if (row.length >= 2) {
                    const existingMssv = row[0]?.toString().trim();
                    const existingName = row[1]?.toString().trim();
                    
                    if (existingMssv === mssv.toString().trim() || 
                        existingName === name.toString().trim()) {
                        console.log("Student found:", existingMssv, existingName);
                        return {
                            exists: true,
                            row: i + 1,
                            data: row
                        };
                    }
                }
            }
        }

        console.log("Student not found");
        return { exists: false };
    } catch (error) {
        console.error("Error checking existing student:", error);
        throw error;
    }
}

/**
 * Add new result to Google Sheets
 * @param {Object} resultData - Result data to add
 * @param {string} token - Access token
 * @returns {Promise<Object>} Add result
 */
async function addNewResult(resultData, token) {
    try {
        console.log("Adding new result to Google Sheets...");
        console.log("Result data:", resultData);

        const values = [
            [
                resultData.mssv,
                resultData.name,
                resultData.email || '',
                resultData.score,
                resultData.totalQuestions,
                new Date().toLocaleString('vi-VN')
            ]
        ];

        const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${resultRange}:append?valueInputOption=RAW&key=${apiKey}`;
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: values
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error response:", errorData);
            throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        console.log("Result added successfully:", data);

        return {
            success: true,
            message: "Kết quả đã được lưu thành công!",
            data: resultData,
            sheetData: data
        };
    } catch (error) {
        console.error("Error adding new result:", error);
        throw error;
    }
}

/**
 * Save quiz result to Google Sheets
 * @param {Object} resultData - Result data
 * @returns {Promise<Object>} Save result
 */
async function saveQuizResult(resultData) {
    try {
        console.log("Saving quiz result to Google Sheets...");
        console.log("Result data:", resultData);

        // Validate input data
        if (!resultData || !resultData.mssv || !resultData.name) {
            throw new Error("Missing required data: mssv and name are required");
        }

        // Get user profile from AuthManager for OAuth2 token only
        if (window.authManager) {
            const user = window.authManager.getCurrentUser();
            if (user) {
                console.log("Using Google OAuth2 token for Sheets API access");
                // Only use Google account for OAuth2 token, not for student info
                // Student info comes from the form input
            }
        }

        // Get OAuth2 access token
        const token = await getAccessToken();

        // Check if student already exists
        const existingStudent = await checkExistingStudent(resultData.mssv, resultData.name);
        console.log("Existing student check:", existingStudent);

        if (existingStudent.exists) {
            console.log("Student already exists, preventing duplicate submission...");
            return {
                success: false,
                error: "Bạn đã nộp bài rồi. Không thể nộp lại.",
                action: "duplicate_prevented",
                data: resultData
            };
        } else {
            console.log("New student, adding new record...");
            return await addNewResult(resultData, token);
        }

    } catch (error) {
        console.error("Error saving quiz result:", error);
        
        // Check if it's an OAuth2 error
        if (error.message.includes('OAuth2') || error.message.includes('not logged in')) {
            return {
                success: false,
                error: "Vui lòng đăng nhập bằng Google trước khi làm bài kiểm tra.",
                action: "oauth_required",
                data: resultData,
                details: "Cần đăng nhập Google để lưu kết quả"
            };
        }
        
        return {
            success: false,
            error: error.message,
            data: resultData
        };
    }
}

// Initialize when script loads
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Wait for AuthManager to be ready
        if (window.authManager) {
            await window.authManager.waitForAuthState();
            console.log("AuthManager ready for save-result.js");
        } else {
            console.warn("AuthManager not available");
        }
    } catch (error) {
        console.error("Failed to initialize save-result.js:", error);
    }
});

// Export functions for global access
window.saveQuizResult = saveQuizResult;
window.getAccessToken = getAccessToken;
window.checkExistingStudent = checkExistingStudent;
window.addNewResult = addNewResult;

console.log("✅ save-result.js loaded with AuthManager + OAuth2 integration");