const questionSheetId = "1kx--gwSvckfHcUMxAKcZbfxKhN_Jf7s1tQQECro1-1U"; 
const questionApiKey = "AIzaSyBNi1lEqoeaUoTkWNYg8rqdwcvziJ7ImAw";
const passwordRange = "Password!A1:C10";
const questionRange = "Questions!A:F";

// Function to validate password from Google Sheets
async function validatePasswordFromSheet(inputPassword) {
    try {
        console.log("Validating password");

        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${questionSheetId}/values/${passwordRange}?key=${questionApiKey}`);
        const data = await response.json();

        if (!data.values) {
            return { valid: false, error: "Không thể kết nối đến cơ sở dữ liệu" };
        }

        const rows = data.values;

        // Check if password exists in the sheet
        // Assuming column A contains passwords
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (row && row[0] && row[0].trim() === inputPassword.trim()) {
                return {
                    valid: true,
                };
            }
        }

        return { valid: false, error: "Mật khẩu không đúng" };

    } catch (error) {
        return {
            valid: false,
            error: "Lỗi kết nối. Vui lòng thử lại sau."
        };
    }
}

// Function to handle password check event
function handlePasswordCheck() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value.trim();

    if (!password) {
        showPasswordError("Vui lòng nhập mật khẩu");
        return;
    }

    // Show loading state
    const submitBtn = document.getElementById('checkPassword');
    submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Đang kiểm tra...';
    submitBtn.disabled = true;

    // Validate password from Google Sheets
    validatePasswordFromSheet(password)
        .then(result => {
            if (result.valid) {
                // Store user info for later use
                window.currentUser = result.userInfo;

                // hide password modal
                passwordModal.hide();

                // Clean up modal backdrops after hiding
                setTimeout(() => {
                    // Remove any existing modal backdrops
                    const existingBackdrops = document.querySelectorAll('.modal-backdrop');
                    existingBackdrops.forEach(backdrop => backdrop.remove());
                    
                    // Remove modal-open class from body
                    document.body.classList.remove('modal-open');
                    
                    // Reset body padding and overflow if they were modified
                    document.body.style.paddingRight = '';
                    document.body.style.overflow = '';
                    
                    // Ensure body can scroll
                    document.body.style.overflowY = 'auto';
                    document.body.style.overflowX = 'hidden';
                }, 100);

                setTimeout(() => {
                    // show student info modal
                    studentInfoModal.show();
                }, 300);

            } else {
                showPasswordError(result.error || "Mật khẩu không đúng");
            }
        })
        .catch(error => {
            showPasswordError("Lỗi hệ thống. Vui lòng thử lại.");
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Xác nhận';
            submitBtn.disabled = false;
        });
}

// Function to show password error
function showPasswordError(message) {
    const passwordInput = document.getElementById('passwordInput');
    const errorDiv = document.getElementById('passwordError');

    passwordInput.classList.add('is-invalid');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';

    // Clear error after 3 seconds
    setTimeout(() => {
        passwordInput.classList.remove('is-invalid');
        errorDiv.style.display = 'none';
        passwordInput.value = '';
        passwordInput.focus();
    }, 3000);
}

// Function to get questions from Google Sheets
async function getQuestionsFromSheet() {
    try {
        console.log("Getting questions");

        const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${questionSheetId}/values/${questionRange}?key=${questionApiKey}`);
        const data = await response.json();

        if (!data.values) {
            console.error("No questions found");
            return [];
        }

        const rows = data.values;

        // Skip header row if exists
        const questionRows = rows.slice(1);
        
        const questions = questionRows.map((row, index) => {
            // Format: Question, Options (JSON string), CorrectAnswer, Explanation
            if (row.length >= 3) {
                let options = [];
                
                // Parse options from JSON string
                if (row[1]) {
                    try {
                        options = JSON.parse(row[1]);
                    } catch (error) {
                        // Fallback: treat as comma-separated string
                        options = row[1].split(',').map(opt => opt.trim());
                    }
                }
                
                // Ensure we have at least 4 options
                while (options.length < 4) {
                    options.push(`Lựa chọn ${String.fromCharCode(65 + options.length)}`);
                }
                
                return {
                    question: row[0] || `Câu hỏi ${index + 1}`,
                    options: options,
                    correct: parseInt(row[2]) || 0,
                    explanation: row[3] || ""
                };
            }
            return null;
        }).filter(question => question !== null);

        return questions;

    } catch (error) {
        return [];
    }
}

// Make functions globally available
window.validatePasswordFromSheet = validatePasswordFromSheet;
window.handlePasswordCheck = handlePasswordCheck;
window.getQuestionsFromSheet = getQuestionsFromSheet;