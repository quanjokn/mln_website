
const sheetId = "1kx--gwSvckfHcUMxAKcZbfxKhN_Jf7s1tQQECro1-1U";
const apiKey = "AIzaSyBNi1lEqoeaUoTkWNYg8rqdwcvziJ7ImAw";
const resultRange = "Result!A:F";

const serviceAccountConfig = {
    "type": "service_account",
    "project_id": "n8n-basico-test",
    "private_key_id": "eb3d906cc1476951a364db5366e08786bc6ca31c",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC0jv+OQ/zdlJ8Z\nbqbyFtarrnsUEnmf9Iq5G4w3YKK8RkSEKFCtFNjB0oS5UJe8cBLtm+Bpzq36sV1x\nXUs88vP4TU1HrBVwXCEcuzx0EmrqjQDX8lrkh+iTa3RPPEkCxZeYz2EAQH+yOErP\nsey2xq1PSE1jb4Ivvei7U6J61ZY7iYHCFwDRSkavjzgTQBciHYIpxsSHNQ3xwVZ2\nuRkjkRbZdZDRUK8rp+HqHVCrDEPJV3Tas7IF1VHT2u/KvGqxhx3tIKZlEPw7/GQf\nHid4r5XidHkHqTFmDy2Kd82t7bseGfHn5TS9J98Ec0CpdoFCB9yeK51t6e9LiTyw\nLFimv+vzAgMBAAECggEAMXc9rxmUNJZLchm89fTo0fcGtAyNspM50BWqd99rJf5w\nNe6fj5N3AL6uauCX+WGQ5fS+6e3b/yLJUU34V1XOHff7lIeiBfrPfYIUQU5saR7B\nHOhCG3rabkzRfAWtkOtWKWCjGAETmt1OLZF2oupSP7a0sOmzNmYmVO/IQzOxqVR/\nVaNsi3yio8aT+Xl9vM0NC4d1uOOXNobSaMwnERsB7KFJbPVLTgLcNIrYK0mTRwZL\neKAEbMBh0Tym4PLBEF/8UNo7+j7sCSOIGOkVmcEHp94kq6y5hqAu2SSBGrnYEuOG\nxWZlWIFsK82YUckGypbw11cU0eBGm2s4psufuhFVCQKBgQD1m/7CawuLxmN8sF7X\nTl9V/qSZitZUh9VJr7boj+uAYl9kOUJCv3YcNgW+KzbKMQtShEuqV1jwKStnkP75\nYipMrdl85QNgOtorMIy+8m78/QOENTJvqjOql4t+G9ip+d6aR8BHyfUjk5Ax0ZoA\nMS0lPP1VjJsBV74zvHx5re0oGwKBgQC8Mn0TWQvj9i2q44ERMsxwq9JEpU35+wrM\nfDOh2QxBA3EkINGHpPnBbzz7oXrbDHkDF3h2Qfnhu5bbR0w3splw15zQXW2roXA5\n2jY0hQuvpZL/VUN5XGqzVGbdPMpDiophdSreJrzrt1rIao10i6EDnVLASrCVp73x\n45Bo6Sq5CQKBgQDXkm3O0wm1SxGzNVJpA97lqbVrFtL8KqToIhQWl4uKic1UOHWS\nBF50cG4l9eQHH3jimj+XaUcks93m7vr8hE7AMq770j5eTgmDcv918W+9GY3mkpKM\nNAVZK95Bd8t5lVjubR+1YuuIqFIdh+z1UjRfxOJOHjVGvm6xFjTiz+eiFQKBgFud\nuIXSs5cmINUwK4TT1fKDsrj4QB2RuJATZo9DulNr+Yg88cO27F7eaDGXSteYGtEG\ne/4V4C+jwqy86L20lD36uLw2v0zuKlP/hqPKoQXA9O6X82EBPHBQhkLtdQmsR/Fp\nuJStBws5F1i5hmNWFexMihxSP+Sa5Dz9Ky/nUoUBAoGBAKmhpZxQj98YnoebFqMp\noUDZpxltqqe3Brs+OPORPhHt+nr0lA+e1jPnbZ7JWFja1RyZJTwRHuBJGKq7cy+O\nwZUA4K5bT/o9kOiIIgt5j1Q4fQFgsGES2ww5YHJ2cuDu9GGtr5ld0ulgrauEQ3ZO\nzOf9y/0CE6sx0glrvJ66sJIV\n-----END PRIVATE KEY-----\n",
    "client_email": "mln-slot3@n8n-basico-test.iam.gserviceaccount.com",
    "client_id": "118407744836973155611",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/mln-slot3%40n8n-basico-test.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
  };

// JWT token for authentication
let accessToken = null;
let tokenExpiry = null;
const resultSheetName = "Result";

/**
 * Generate JWT token for service account authentication
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
    // Check if we have a valid token
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    try {
        // Create JWT header
        const header = {
            alg: "RS256",
            typ: "JWT"
        };

        // Create JWT payload
        const now = Math.floor(Date.now() / 1000);
        const payload = {
            iss: serviceAccountConfig.client_email,
            scope: "https://www.googleapis.com/auth/spreadsheets",
            aud: serviceAccountConfig.token_uri,
            iat: now,
            exp: now + 3600 // 1 hour
        };

        // Encode header and payload
        const encodedHeader = btoa(JSON.stringify(header)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        const encodedPayload = btoa(JSON.stringify(payload)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        // Create signature
        const signatureInput = `${encodedHeader}.${encodedPayload}`;

        // Import the private key
        // Convert PEM format to ArrayBuffer
        const pemHeader = "-----BEGIN PRIVATE KEY-----";
        const pemFooter = "-----END PRIVATE KEY-----";
        const pemContents = serviceAccountConfig.private_key
            .replace(pemHeader, "")
            .replace(pemFooter, "")
            .replace(/\s/g, "");

        const binaryDer = atob(pemContents);
        const privateKeyBuffer = new Uint8Array(binaryDer.length);
        for (let i = 0; i < binaryDer.length; i++) {
            privateKeyBuffer[i] = binaryDer.charCodeAt(i);
        }

        const privateKey = await crypto.subtle.importKey(
            "pkcs8",
            privateKeyBuffer,
            {
                name: "RSASSA-PKCS1-v1_5",
                hash: "SHA-256"
            },
            false,
            ["sign"]
        );

        // Sign the JWT
        const signature = await crypto.subtle.sign(
            "RSASSA-PKCS1-v1_5",
            privateKey,
            new TextEncoder().encode(signatureInput)
        );

        // Encode signature
        const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

        const jwt = `${signatureInput}.${encodedSignature}`;

        // Exchange JWT for access token
        const response = await fetch(serviceAccountConfig.token_uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });

        if (!response.ok) {
            throw new Error(`Token request failed: ${response.status}`);
        }

        const tokenData = await response.json();
        accessToken = tokenData.access_token;
        tokenExpiry = Date.now() + (tokenData.expires_in * 1000) - 60000; // 1 minute buffer

        return accessToken;

    } catch (error) {
        console.error("Error getting access token:", error);
        throw error;
    }
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

        // Check if service account is configured
        if (!serviceAccountConfig.client_email || serviceAccountConfig.client_email.includes('your-service-account')) {
            console.log("Service account not configured, saving locally");
            return {
                success: true,
                message: "Result saved locally - Service account not configured",
                data: resultData
            };
        }

        // Get access token
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

// Expose global functions
window.saveQuizResult = saveQuizResult;
window.checkExistingStudent = checkExistingStudent;
window.addNewResult = addNewResult;
window.updateExistingResult = updateExistingResult;
window.getAllResults = getAllResults;
window.testSaveResult = testSaveResult;
window.testSaveResultLoaded = testSaveResultLoaded;

// Log that the script has loaded
console.log("save-result.js: All functions exported to window object");
