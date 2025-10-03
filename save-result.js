
const sheetId = "1kx--gwSvckfHcUMxAKcZbfxKhN_Jf7s1tQQECro1-1U";
const apiKey = "AIzaSyBNi1lEqoeaUoTkWNYg8rqdwcvziJ7ImAw";
const resultRange = "Result!A:F";

// OAuth 2.0 authentication is handled by auth.js
const resultSheetName = "Result";

/**
 * Get OAuth 2.0 access token from current user
 * @returns {Promise<string>} Access token
 */
async function getAccessToken() {
    // Get current user from auth system
    const user = getCurrentUser();
    if (!user) {
        throw new Error("User not authenticated. Please login first.");
    }

    // Get access token from Firebase Auth
    try {
        const token = await user.getIdToken();
        return token;
    } catch (error) {
        console.error("Error getting user token:", error);
        throw new Error("Failed to get authentication token");
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

        // Check if user is authenticated
        const user = getCurrentUser();
        if (!user) {
            console.log("User not authenticated, saving locally");
            return {
                success: true,
                message: "Result saved locally - User not authenticated",
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
                    'Authorization': `Bearer ${token}`
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
