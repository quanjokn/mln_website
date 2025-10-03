
const sheetId = "1kx--gwSvckfHcUMxAKcZbfxKhN_Jf7s1tQQECro1-1U";
const apiKey = "AIzaSyBNi1lEqoeaUoTkWNYg8rqdwcvziJ7ImAw";
const resultRange = "Result!A:F";

// OAuth2 Configuration
const oauth2Config = {
    clientId: "437184391144-ikovnqkf4i44v4jhsqvhvisi3ov3jtod.apps.googleusercontent.com",
    clientSecret: "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", // Cần thêm client secret
    redirectUri: window.location.origin + window.location.pathname,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    authUrl: "https://accounts.google.com/o/oauth2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token"
};

// OAuth2 token storage
let accessToken = null;
let tokenExpiry = null;
let refreshToken = null;
const resultSheetName = "Result";

/**
 * Check if user is authenticated with OAuth2
 * @returns {boolean} Authentication status
 */
function isAuthenticated() {
    return accessToken && tokenExpiry && Date.now() < tokenExpiry;
}

/**
 * Get stored OAuth2 tokens from localStorage
 */
function loadStoredTokens() {
    try {
        const stored = localStorage.getItem('google_oauth_tokens');
        if (stored) {
            const tokens = JSON.parse(stored);
            accessToken = tokens.accessToken;
            tokenExpiry = tokens.tokenExpiry;
            refreshToken = tokens.refreshToken;
        }
    } catch (error) {
        console.error("Error loading stored tokens:", error);
    }
}

/**
 * Save OAuth2 tokens to localStorage
 */
function saveTokens() {
    try {
        const tokens = {
            accessToken,
            tokenExpiry,
            refreshToken
        };
        localStorage.setItem('google_oauth_tokens', JSON.stringify(tokens));
    } catch (error) {
        console.error("Error saving tokens:", error);
    }
}

/**
 * Clear OAuth2 tokens
 */
function clearTokens() {
    accessToken = null;
    tokenExpiry = null;
    refreshToken = null;
    localStorage.removeItem('google_oauth_tokens');
}

/**
 * Start OAuth2 authorization flow
 */
function startOAuth2Flow() {
    const params = new URLSearchParams({
        client_id: oauth2Config.clientId,
        redirect_uri: oauth2Config.redirectUri,
        scope: oauth2Config.scope,
        response_type: 'code',
        access_type: 'offline',
        prompt: 'consent'
    });

    const authUrl = `${oauth2Config.authUrl}?${params.toString()}`;
    window.location.href = authUrl;
}

/**
 * Handle OAuth2 callback and exchange code for tokens
 * @param {string} code - Authorization code from callback
 * @returns {Promise<string>} Access token
 */
async function handleOAuth2Callback(code) {
    try {
        const response = await fetch(oauth2Config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: oauth2Config.clientId,
                client_secret: oauth2Config.clientSecret,
                code: code,
                grant_type: 'authorization_code',
                redirect_uri: oauth2Config.redirectUri
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Token exchange failed:", errorText);
            throw new Error(`Token exchange failed: ${response.status} - ${errorText}`);
        }

        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        refreshToken = tokenData.refresh_token;
        tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer

        saveTokens();
        return accessToken;

    } catch (error) {
        console.error("Error handling OAuth2 callback:", error);
        throw error;
    }
}

/**
 * Refresh OAuth2 access token using refresh token
 * @returns {Promise<string>} New access token
 */
async function refreshAccessToken() {
    if (!refreshToken) {
        throw new Error("No refresh token available");
    }

    try {
        const response = await fetch(oauth2Config.tokenUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: oauth2Config.clientId,
                client_secret: oauth2Config.clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Token refresh failed:", errorText);
            throw new Error(`Token refresh failed: ${response.status} - ${errorText}`);
        }

        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer

        saveTokens();
        return accessToken;

    } catch (error) {
        console.error("Error refreshing access token:", error);
        clearTokens();
        throw error;
    }
}

/**
 * Get valid OAuth2 access token
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
    // Load tokens from storage if not already loaded
    if (!accessToken) {
        loadStoredTokens();
    }

    // Check if we have a valid token
    if (isAuthenticated()) {
        return accessToken;
    }

    // Try to refresh token if we have refresh token
    if (refreshToken) {
        try {
            return await refreshAccessToken();
        } catch (error) {
            console.log("Token refresh failed, need to re-authenticate");
        }
    }

    // Need to start OAuth2 flow
    throw new Error("Not authenticated. Please login first.");
}

/**
 * Lưu kết quả quiz vào Google Sheets
 * @param {Object} resultData - Dữ liệu kết quả {mssv, name, score, submitTime}
 * @returns {Promise<Object>} Kết quả lưu dữ liệu
 */
async function saveQuizResult(resultData) {
    try {
        console.log("Saving quiz result to Google Sheets...");
        console.log("Result data:", resultData);

        // Validate input data
        if (!resultData || !resultData.mssv || !resultData.name) {
            throw new Error("Missing required data: mssv and name are required");
        }

        // Check if OAuth2 is configured
        if (!oauth2Config.clientId || oauth2Config.clientId.includes('YOUR_OAUTH2_CLIENT_ID') || 
            !oauth2Config.clientSecret || oauth2Config.clientSecret.includes('your-client-secret')) {
            console.log("OAuth2 not configured, saving locally");
            return {
                success: true,
                message: "Result saved locally - OAuth2 not configured",
                data: resultData
            };
        }

        // Get access token
        let token;
        try {
            token = await getAccessToken();
        } catch (error) {
            if (error.message.includes("Not authenticated")) {
                return {
                    success: false,
                    error: "Bạn cần đăng nhập Google để lưu kết quả. Vui lòng nhấn nút 'Đăng nhập Google' trước.",
                    action: "login_required",
                    data: resultData
                };
            }
            throw error;
        }

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
        return {
            success: false,
            error: error.message,
            data: resultData
        };
    }
}

/**
 * Kiểm tra xem sinh viên đã tồn tại trong sheet chưa
 * @param {string} mssv - Mã số sinh viên
 * @param {string} name - Họ và tên
 * @returns {Promise<Object>} Thông tin sinh viên đã tồn tại
 */
async function checkExistingStudent(mssv, name) {
    try {
        console.log("Checking existing student...");
        console.log("MSSV:", mssv);
        console.log("Name:", name);

        // Use API key for read operations (still works)
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${resultRange}?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw data from Result sheet:", data);

        if (!data.values || data.values.length === 0) {
            console.log("No existing data found");
            return { exists: false, rowIndex: -1 };
        }

        const rows = data.values;
        console.log("Total rows in Result sheet:", rows.length);

        // Check each row for existing student
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            console.log(`Checking row ${i + 1}:`, row);

            if (row.length >= 2) {
                const existingMSSV = row[0] ? row[0].toString().trim() : "";
                const existingName = row[1] ? row[1].toString().trim() : "";

                console.log(`Row ${i + 1} - Existing MSSV: "${existingMSSV}", Name: "${existingName}"`);
                console.log(`Comparing with - MSSV: "${mssv}", Name: "${name}"`);

                // Check if MSSV matches (case insensitive)
                if (existingMSSV.toLowerCase() === mssv.toLowerCase()) {
                    console.log("Found existing student by MSSV");
                    return {
                        exists: true,
                        rowIndex: i + 1, // +1 because Google Sheets uses 1-based indexing
                        matchType: "MSSV",
                        existingData: row
                    };
                }

                // Check if name matches (case insensitive, remove extra spaces)
                if (existingName.toLowerCase().replace(/\s+/g, ' ') === name.toLowerCase().replace(/\s+/g, ' ')) {
                    console.log("Found existing student by name");
                    return {
                        exists: true,
                        rowIndex: i + 1,
                        matchType: "Name",
                        existingData: row
                    };
                }
            }
        }

        console.log("No existing student found");
        return { exists: false, rowIndex: -1 };

    } catch (error) {
        console.error("Error checking existing student:", error);
        throw error;
    }
}

/**
 * Thêm kết quả mới vào sheet
 * @param {Object} resultData - Dữ liệu kết quả
 * @returns {Promise<Object>} Kết quả thêm dữ liệu
 */
async function addNewResult(resultData, accessToken) {
    try {
        console.log("Adding new result...");

        const values = [
            [
                resultData.mssv,
                resultData.name,
                resultData.startTime || "",
                resultData.submitTime || new Date().toISOString(),
                resultData.timeSpent || 0,
                resultData.score || 0
            ]
        ];

        console.log("Values to append:", values);

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${resultRange}:append?valueInputOption=RAW`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    values: values
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log("Successfully added new result:", result);

        return {
            success: true,
            action: "added",
            data: resultData,
            response: result
        };

    } catch (error) {
        console.error("Error adding new result:", error);
        throw error;
    }
}

/**
 * Cập nhật kết quả đã tồn tại
 * @param {number} rowIndex - Chỉ số dòng cần cập nhật
 * @param {Object} resultData - Dữ liệu kết quả mới
 * @returns {Promise<Object>} Kết quả cập nhật dữ liệu
 */
async function updateExistingResult(rowIndex, resultData, accessToken) {
    try {
        console.log("Updating existing result at row:", rowIndex);

        const range = `Result!A${rowIndex}:F${rowIndex}`;
        const values = [
            [
                resultData.mssv,
                resultData.name,
                resultData.startTime || "",
                resultData.submitTime || new Date().toISOString(),
                resultData.timeSpent || 0,
                resultData.score || 0
            ]
        ];

        console.log("Update range:", range);
        console.log("Values to update:", values);

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    values: values
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error response:", errorText);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log("Successfully updated existing result:", result);

        return {
            success: true,
            action: "updated",
            data: resultData,
            rowIndex: rowIndex,
            response: result
        };

    } catch (error) {
        console.error("Error updating existing result:", error);
        throw error;
    }
}

/**
 * Lấy tất cả kết quả từ sheet
 * @returns {Promise<Array>} Danh sách kết quả
 */
async function getAllResults() {
    try {
        console.log("Getting all results from sheet...");

        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${resultRange}?key=${apiKey}`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("All results data:", data);

        if (!data.values || data.values.length === 0) {
            return [];
        }

        const results = data.values.map((row, index) => ({
            rowIndex: index + 1,
            mssv: row[0] || "",
            name: row[1] || "",
            startTime: row[2] || "",
            submitTime: row[3] || "",
            timeSpent: row[4] || 0,
            score: row[5] || 0
        }));

        console.log("Processed results:", results);
        return results;

    } catch (error) {
        console.error("Error getting all results:", error);
        throw error;
    }
}

/**
 * Test function để kiểm tra kết nối và lưu dữ liệu
 * @param {Object} testData - Dữ liệu test
 * @returns {Promise<Object>} Kết quả test
 */
async function testSaveResult(testData = null) {
    console.log("=== Testing Save Result Function ===");

    try {
        // Use test data if provided, otherwise create sample data
        const sampleData = testData || {
            mssv: "TEST001",
            name: "Nguyễn Văn Test",
            score: 15,
            submitTime: new Date().toISOString()
        };

        console.log("Testing with data:", sampleData);

        const result = await saveQuizResult(sampleData);
        console.log("Test result:", result);

        return result;
    } catch (error) {
        console.error("Test failed:", error);
        return {
            success: false,
            error: error.message
        };
    }
}

// Test function to verify the script loaded
function testSaveResultLoaded() {
    console.log("save-result.js loaded successfully!");
    return true;
}

// OAuth2 UI Functions
/**
 * Show login button if not authenticated
 */
function showLoginButton() {
    const loginContainer = document.getElementById('oauth2-login-container');
    if (loginContainer) {
        loginContainer.innerHTML = `
            <div class="alert alert-info">
                <h5><i class="bi bi-google"></i> Đăng nhập Google</h5>
                <p>Bạn cần đăng nhập Google để lưu kết quả quiz vào Google Sheets.</p>
                <button class="btn btn-primary" onclick="startOAuth2Flow()">
                    <i class="bi bi-google"></i> Đăng nhập Google
                </button>
            </div>
        `;
    }
}

/**
 * Show logout button if authenticated
 */
function showLogoutButton() {
    const loginContainer = document.getElementById('oauth2-login-container');
    if (loginContainer) {
        loginContainer.innerHTML = `
            <div class="alert alert-success">
                <h5><i class="bi bi-check-circle"></i> Đã đăng nhập Google</h5>
                <p>Bạn đã đăng nhập thành công. Có thể lưu kết quả quiz.</p>
                <button class="btn btn-outline-danger" onclick="logoutGoogle()">
                    <i class="bi bi-box-arrow-right"></i> Đăng xuất
                </button>
            </div>
        `;
    }
}

/**
 * Logout from Google
 */
function logoutGoogle() {
    clearTokens();
    showLoginButton();
    console.log("Logged out from Google");
}

/**
 * Check authentication status and update UI
 */
function updateAuthUI() {
    loadStoredTokens();
    if (isAuthenticated()) {
        showLogoutButton();
    } else {
        showLoginButton();
    }
}

/**
 * Handle OAuth2 callback from URL parameters
 */
function handleOAuth2CallbackFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
        console.error("OAuth2 error:", error);
        return;
    }

    if (code) {
        handleOAuth2Callback(code).then(() => {
            console.log("OAuth2 login successful");
            // Remove code from URL
            const newUrl = window.location.origin + window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            updateAuthUI();
            
        }).catch(error => {
            console.error("OAuth2 callback error:", error);
        });
    }
}

// Initialize OAuth2 on page load
document.addEventListener('DOMContentLoaded', function() {
    handleOAuth2CallbackFromURL();
    updateAuthUI();
});

// Expose global functions
window.saveQuizResult = saveQuizResult;
window.checkExistingStudent = checkExistingStudent;
window.addNewResult = addNewResult;
window.updateExistingResult = updateExistingResult;
window.getAllResults = getAllResults;
window.testSaveResult = testSaveResult;
window.testSaveResultLoaded = testSaveResultLoaded;

// OAuth2 functions
window.startOAuth2Flow = startOAuth2Flow;
window.logoutGoogle = logoutGoogle;
window.updateAuthUI = updateAuthUI;
window.isAuthenticated = isAuthenticated;

// Log that the script has loaded
console.log("save-result.js: All functions exported to window object");
