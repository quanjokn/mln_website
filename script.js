// JavaScript for Ho Chi Minh Thought Historical Timeline Website with Bootstrap

// Timeline navigation variables
let currentPosition = 0;
const cardWidth = 370; // width + gap
const timeline = document.getElementById('timeline');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Bootstrap Modal
let milestoneModal;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set the background image for hero section
    setHeroBackground();

    // Initialize AOS
    AOS.init({
        duration: 1000,
        easing: 'ease-in-out',
        once: true,
        offset: 100
    });
    
    // Initialize Bootstrap Modal (only if exists)
    const milestoneModalElement = document.getElementById('milestoneModal');
    if (milestoneModalElement) {
        milestoneModal = new bootstrap.Modal(milestoneModalElement);
    }
    
    setupEventListeners();
    updateNavigationButtons();
    
    // Smooth scroll for navigation links
    setupSmoothScrolling();
    
    // Initialize navbar scroll behavior
    initNavbarScrollBehavior();
    
    // Initialize dropdown animations
    initDropdownAnimations();
    
    // Set initial active dropdown item
    updateActiveDropdownItem('#philosophy-overview');
});

// Navbar scroll behavior
function initNavbarScrollBehavior() {
    const navbar = document.querySelector('.navbar');
    const philosophyOverviewSection = document.getElementById('philosophy-overview');
    
    // Check if we're on a page with philosophy overview section
    if (!philosophyOverviewSection) {
        // For pages without philosophy overview (like quiz page), show navbar immediately
        navbar.classList.remove('navbar-hidden');
        navbar.classList.add('navbar-visible');
        return;
    }
    
    // Hide navbar initially only for pages with philosophy overview
    navbar.classList.add('navbar-hidden');
    navbar.classList.remove('navbar-visible');
    
    // Create intersection observer for philosophy overview section
    const philosophyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Philosophy overview is visible - show navbar and keep it visible
                navbar.classList.remove('navbar-hidden');
                navbar.classList.add('navbar-visible');
                
                // Once navbar is shown, stop observing and keep it visible
                philosophyObserver.disconnect();
                
                // Add scroll listener to keep navbar visible for rest of page
                window.addEventListener('scroll', keepNavbarVisible);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '-100px 0px 0px 0px' // Show navbar when philosophy overview is 100px from top
    });
    
    // Start observing the philosophy overview section
    philosophyObserver.observe(philosophyOverviewSection);
}

// Function to keep navbar visible once it's shown
function keepNavbarVisible() {
    const navbar = document.querySelector('.navbar');
    const philosophyOverviewSection = document.getElementById('philosophy-overview');
    
    if (philosophyOverviewSection) {
        const philosophyTop = philosophyOverviewSection.offsetTop - 100;
        
        // If we're at or past the philosophy overview section, keep navbar visible
        if (window.scrollY >= philosophyTop) {
            navbar.classList.remove('navbar-hidden');
            navbar.classList.add('navbar-visible');
        } else {
            // If we scroll back up above philosophy overview, hide navbar again
            navbar.classList.add('navbar-hidden');
            navbar.classList.remove('navbar-visible');
        }
    }
}

// Navbar scroll effect - only for styling when visible
function handleNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    
    // Only apply styling effects if navbar is visible
    if (navbar.classList.contains('navbar-visible')) {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
}

// Enhanced smooth scrolling with navbar consideration
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const navbar = document.querySelector('.navbar');
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = target.offsetTop - navbarHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                const navbarCollapse = document.querySelector('.navbar-collapse');
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    const bsCollapse = new bootstrap.Collapse(navbarCollapse);
                    bsCollapse.hide();
                }
                
                // Close dropdown if open
                const dropdownMenu = document.querySelector('.dropdown-menu.show');
                if (dropdownMenu) {
                    const dropdown = bootstrap.Dropdown.getInstance(document.querySelector('.dropdown-toggle'));
                    if (dropdown) {
                        dropdown.hide();
                    }
                }
                
                // Update active dropdown item
                updateActiveDropdownItem(this.getAttribute('href'));
            }
        });
    });
}

// Function to update active dropdown item based on current section
function updateActiveDropdownItem(targetHref) {
    // Remove active class from all dropdown items
    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to current item
    const currentItem = document.querySelector(`.dropdown-item[href="${targetHref}"]`);
    if (currentItem) {
        currentItem.classList.add('active');
    }
}

// Function to handle dropdown animations
function initDropdownAnimations() {
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu-custom');
    
    if (dropdownToggle && dropdownMenu) {
        // Handle dropdown show/hide events
        dropdownToggle.addEventListener('shown.bs.dropdown', function () {
            dropdownMenu.classList.add('show');
        });
        
        dropdownToggle.addEventListener('hidden.bs.dropdown', function () {
            dropdownMenu.classList.remove('show');
        });
        
        // Handle hover effects on desktop
        if (window.innerWidth > 768) {
            const dropdown = dropdownToggle.closest('.dropdown');
            
            dropdown.addEventListener('mouseenter', function() {
                const dropdownInstance = new bootstrap.Dropdown(dropdownToggle);
                dropdownInstance.show();
            });
            
            dropdown.addEventListener('mouseleave', function() {
                const dropdownInstance = bootstrap.Dropdown.getInstance(dropdownToggle);
                if (dropdownInstance) {
                    dropdownInstance.hide();
                }
            });
        }
    }
}

// Function to detect current section and update dropdown active state
function updateDropdownOnScroll() {
    const sections = ['#philosophy-overview', '#timeline', '#philosophy-intro', '#key-thinkers', '#applications', '#resources'];
    let currentSection = '#philosophy-overview';
    
    sections.forEach(section => {
        const element = document.querySelector(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            
            if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
                currentSection = section;
            }
        }
    });
    
    updateActiveDropdownItem(currentSection);
}

// Milestone detailed content
const milestoneDetails = {
    1: {
        title: "Thưa niên và hình thành (1890-1911)",
        content: `
            <p>Nguyễn Sinh Cung (sau này là Hồ Chí Minh) sinh ngày 19/5/1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An trong một gia đình có truyền thống yêu nước.</p>
            
            <h4>1. Môi trường gia đình và quê hương</h4>
            <p>Cha là Nguyễn Sinh Sắc (Nguyễn Sinh Huy), một nhà nho yêu nước, từng làm quan nhưng bỏ quan vì không chịu nổi cảnh nô lệ. Mẹ là bà Hoàng Thị Loan, người phụ nữ hiền lành, đảm đang. Quê hương Nghệ An là vùng đất có truyền thống đấu tranh yêu nước lâu đời.</p>
            
            <h4>2. Thời thơ ấu và niên thiếu</h4>
            <p>Từ nhỏ, Nguyễn Sinh Cung đã thể hiện tính cách thông minh, ham học hỏi và tinh thần yêu nước. Năm 1895, gia đình chuyển về Huế, nơi ông học tại trường Quốc học Huế từ 1907-1909.</p>
            
            <h5>Những ảnh hưởng sớm:</h5>
            <ul>
                <li>Chứng kiến cảnh đau khổ của dân tộc dưới ách đô hộ Pháp</li>
                <li>Tiếp xúc với phong trào Duy Tân và tư tưởng cải cách</li>
                <li>Được cha truyền dạy lòng yêu nước và tinh thần bất khuất</li>
                <li>Học hỏi từ những nhà yêu nước như Phan Bội Châu, Phan Chu Trinh</li>
            </ul>
            
            <h4>3. Hình thành ý thức yêu nước</h4>
            <p>Giai đoạn này, tâm hồn trẻ thơ của Hồ Chí Minh đã được hun đúc bởi:</p>
            <ul>
                <li>Tình yêu sâu sắc dành cho đất nước và dân tộc</li>
                <li>Lòng căm thù kẻ thù xâm lược</li>
                <li>Khát vọng tìm ra con đường cứu nước</li>
                <li>Tinh thần học hỏi không ngừng</li>
            </ul>
            
            <h4>Ý nghĩa lịch sử:</h4>
            <p>Giai đoạn thưa niên này đã hình thành nên nền tảng tư tưởng yêu nước sâu sắc, tình yêu dân tộc mãnh liệt và khát vong giải phóng tổ quốc - những giá trị cốt lõi sẽ xuyên suốt cuộc đời hoạt động cách mạng của Người.</p>
        `
    },
    2: {
        title: "Ra đi tìm đường cứu nước (1911-1920)",
        content: `
            <p>Năm 1911, với ước mơ tìm đường cứu nước, Nguyễn Tất Thành lên tàu Amiral Latouche-Tréville rời cảng Nhà Rồng (Sài Gòn) ra đi tìm hiểu thế giới.</p>
            
            <h4>1. Cuộc hành trình khắp năm châu</h4>
            <p>Trong gần 10 năm (1911-1920), Hồ Chí Minh đã đi qua nhiều quốc gia, làm nhiều nghề khác nhau để tìm hiểu thế giới và con đường cứu nước.</p>
            
            <h5>Những điểm đến chính:</h5>
            <ul>
                <li><strong>Pháp (1917-1923):</strong> Làm thợ rửa ảnh, phụ bếp, công nhân. Tham gia hoạt động chính trị, viết báo</li>
                <li><strong>Anh:</strong> Làm việc trên tàu biển, tiếp xúc với phong trào công nhân</li>
                <li><strong>Mỹ:</strong> Quan sát xã hội tư bản chủ nghĩa phát triển</li>
                <li><strong>Châu Phi:</strong> Chứng kiến thực dân phương Tây bóc lột các dân tộc</li>
            </ul>
            
            <h4>2. Những trải nghiệm quan trọng</h4>
            <p>Qua cuộc sống lao động vất vả, Hồ Chí Minh đã:</p>
            <ul>
                <li>Hiểu sâu sắc về đời sống của tầng lớp lao động</li>
                <li>Chứng kiến sự bất công trong xã hội tư bản chủ nghĩa</li>
                <li>Nhận thức được tình đoàn kết của các dân tộc bị áp bức</li>
                <li>Học được nhiều ngoại ngữ và kinh nghiệm sống</li>
            </ul>
            
            <h4>3. Bước đầu hoạt động chính trị</h4>
            <p>Tại Pháp (1917-1923), với tên Nguyễn Ái Quốc, Người đã:</p>
            <ul>
                <li>Tham gia Hội người Việt yêu nước tại Pháp</li>
                <li>Viết nhiều bài báo phê phán chế độ thực dân</li>
                <li>Gửi "Bản yêu sách 8 điều" tới Hội nghị Versailles (1919)</li>
                <li>Sáng lập báo "Le Paria" (Kẻ cùng đinh) năm 1922</li>
            </ul>
            
            <h4>4. Tiếp cận với các tư tưởng giải phóng</h4>
            <p>Trong thời gian này, Hồ Chí Minh đã tìm hiểu nhiều tư tưởng khác nhau:</p>
            <ul>
                <li>Dân chủ tư sản phương Tây</li>
                <li>Các phong trào giải phóng dân tộc</li>
                <li>Tư tưởng xã hội chủ nghĩa không tưởng</li>
                <li>Phong trào công nhân quốc tế</li>
            </ul>
            
            <h4>Ý nghĩa lịch sử:</h4>
            <p>Giai đoạn "ra đi tìm đường cứu nước" đã giúp Hồ Chí Minh mở rộng tầm nhìn, tích lũy kinh nghiệm và chuẩn bị cho việc lựa chọn con đường cách mạng phù hợp với Việt Nam. Đây là tiền đề quan trọng để Người tiếp cận với chủ nghĩa Mác-Lê-nin.</p>
        `
    },
    3: {
        title: "Tiếp cận tư tưởng tiến bộ (1920-1930)",
        content: `
            <p>Năm 1920, khi đọc "Luận cương của Lenin về vấn đề dân tộc và thuộc địa", Nguyễn Ái Quốc đã tìm thấy con đường cứu nước chân chính.</p>
            
            <h4>1. Sự lựa chọn lịch sử (1920)</h4>
            <p>Tại Đại hội Tours của Đảng Xã hội Pháp (tháng 12/1920), Nguyễn Ái Quốc đã bỏ phiếu tán thành gia nhập Quốc tế Cộng sản lần thứ III, trở thành một trong những người sáng lập Đảng Cộng sản Pháp.</p>
            
            <h5>Lý do lựa chọn tư tưởng tiến bộ:</h5>
            <ul>
                <li><strong>Tính khoa học:</strong> Mác-Lê-nin chỉ ra quy luật phát triển khách quan của xã hội</li>
                <li><strong>Tính cách mạng:</strong> Đề ra con đường đấu tranh cách mạng quyết liệt</li>
                <li><strong>Tính quốc tế:</strong> Liên kết đấu tranh giải phóng các dân tộc</li>
                <li><strong>Quan tâm đến vấn đề thuộc địa:</strong> Lenin đặc biệt chú ý đến các dân tộc bị áp bức</li>
            </ul>
            
            <h4>2. Hoạt động tuyên truyền và tổ chức (1920-1924)</h4>
            <p>Từ 1920-1924, tại Pháp, Hồ Chí Minh đã:</p>
            <ul>
                <li>Nghiên cứu sâu các tác phẩm của Marx, Engels, Lenin</li>
                <li>Viết nhiều bài báo tuyên truyền tư tưởng tiến bộ</li>
                <li>Thành lập Hội Liên hiệp thuộc địa (1921)</li>
                <li>Xuất bản báo "Le Paria" rồi "Le Proscrit"</li>
                <li>Tham gia các hoạt động của Đảng Cộng sản Pháp</li>
            </ul>
            
            <h4>3. Học tập và tu nghiệp tại Liên Xô (1924-1925)</h4>
            <p>Tại Liên Xô, Hồ Chí Minh đã:</p>
            <ul>
                <li>Học tại Trường Đại học Phương Đông</li>
                <li>Nghiên cứu lý thuyết tiến bộ một cách có hệ thống</li>
                <li>Viết tác phẩm "Bản án chế độ thực dân Pháp"</li>
                <li>Tham gia Đại hội V Quốc tế Cộng sản</li>
                <li>Chuẩn bị kế hoạch hoạt động cách mạng tại Đông Nam Á</li>
            </ul>
            
            <h4>4. Hoạt động tại Trung Quốc (1925-1930)</h4>
            <p>Giai đoạn quan trọng trong việc chuẩn bị thành lập Đảng:</p>
            <ul>
                <li>Thành lập Hội Việt Nam Cách mạng Thanh niên (1925)</li>
                <li>Mở lớp huấn luyện cán bộ cách mạng</li>
                <li>Viết "Đường Kách Mệnh" - cẩm nang cách mạng</li>
                <li>Chuẩn bị điều kiện thành lập Đảng Cộng sản Việt Nam</li>
            </ul>
            
            <h4>5. Quá trình vận dụng sáng tạo</h4>
            <p>Hồ Chí Minh không máy móc áp dụng mà sáng tạo vận dụng:</p>
            <ul>
                <li><strong>Kết hợp giải phóng dân tộc với giải phóng giai cấp</strong></li>
                <li><strong>Xây dựng khối đại đoàn kết dân tộc</strong></li>
                <li><strong>Vận dụng theo điều kiện Việt Nam</strong></li>
                <li><strong>Giữ gìn bản sắc dân tộc</strong></li>
            </ul>
            
            <h4>Ý nghĩa lịch sử:</h4>
            <p>Giai đoạn này đánh dấu sự trưởng thành về tư tưởng chính trị của Hồ Chí Minh. Từ một người yêu nước đơn thuần, Người đã trở thành một nhà cách mạng chuyên nghiệp, nắm vững lý thuyết Mác-Lê-nin và biết vận dụng sáng tạo vào điều kiện cụ thể của Việt Nam.</p>
        `
    },
    4: {
        title: "Lãnh đạo cách mạng và kháng chiến (1930-1954)",
        content: `
            <p>Từ 1930 đến 1954, Hồ Chí Minh đã lãnh đạo dân tộc Việt Nam qua những giai đoạn lịch sử hết sức khốc liệt và vinh quang.</p>
            
            <h4>1. Thành lập Đảng Cộng sản Việt Nam (1930)</h4>
            <p>Ngày 3/2/1930, tại Hồng Kông, Hồ Chí Minh đã:</p>
            <ul>
                <li>Thống nhất 3 tổ chức cộng sản thành Đảng Cộng sản Việt Nam</li>
                <li>Soạn thảo Cương lĩnh chính trị đầu tiên của Đảng</li>
                <li>Xác định nhiệm vụ cách mạng dân tộc dân chủ nhân dân</li>
                <li>Đề ra đường lối kết hợp giải phóng dân tộc với giải phóng giai cấp</li>
            </ul>
            
            <h4>2. Thời kỳ hoạt động bí mật (1930-1941)</h4>
            <p>Giai đoạn khó khăn nhưng quan trọng trong việc xây dựng lực lượng:</p>
            
            <h5>Những thử thách:</h5>
            <ul>
                <li>Bị thực dân Pháp truy nã gắt gao</li>
                <li>Phải hoạt động bí mật, thường xuyên thay đổi địa điểm</li>
                <li>Đảng và cách mạng gặp nhiều khó khăn, thử thách</li>
                <li>Cần xây dựng và củng cố tổ chức cách mạng</li>
            </ul>
            
            <h5>Những đóng góp:</h5>
            <ul>
                <li>Chỉ đạo Đảng vượt qua khủng hoảng "Trái khuynh" (1930-1932)</li>
                <li>Xây dựng đường lối kháng Nhật cứu nước</li>
                <li>Chuẩn bị lực lượng cho cơ hội cách mạng</li>
            </ul>
            
            <h4>3. Cách mạng Tháng Tám và nền Độc lập (1945)</h4>
            <p>Thành công lịch sử vĩ đại nhất của dân tộc Việt Nam:</p>
            
            <h5>Chuẩn bị cách mạng:</h5>
            <ul>
                <li>Về nước (1941), thành lập Mặt trận Việt Minh</li>
                <li>Xây dựng căn cứ địa Việt Bắc</li>
                <li>Chuẩn bị lực lượng vũ trang</li>
                <li>Chỉ đạo khởi nghĩa Tháng Tám</li>
            </ul>
            
            <h5>Tuyên ngôn Độc lập (2/9/1945):</h5>
            <p>Tại Quảng trường Ba Đình, Hà Nội, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa với những nội dung:</p>
            <ul>
                <li>Khẳng định chân lý "Tất cả mọi người đều sinh ra có quyền bình đẳng"</li>
                <li>Tố cáo tội ác của thực dân Pháp</li>
                <li>Tuyên bố độc lập của dân tộc Việt Nam</li>
                <li>Kêu gọi đoàn kết quốc tế</li>
            </ul>
            
            <h4>4. Kháng chiến chống Pháp (1946-1954)</h4>
            <p>Cuộc chiến tranh nhân dân toàn diện đầu tiên:</p>
            
            <h5>Đường lối kháng chiến:</h5>
            <ul>
                <li>"Toàn dân, toàn diện, trường kỳ, tự lực cánh sinh"</li>
                <li>Kết hợp đấu tranh vũ trang với đấu tranh chính trị, ngoại giao</li>
                <li>Xây dựng hậu phương vững chắc</li>
                <li>Tranh thủ sự ủng hộ của nhân dân thế giới</li>
            </ul>
            
            <h5>Chiến thắng Điện Biên Phủ (1954):</h5>
            <p>"Lừng lẫy năm châu, chấn động địa cầu" - Chiến thắng Điện Biên Phủ đã:</p>
            <ul>
                <li>Bẻ gãy hoàn toàn ý chí xâm lược của thực dân Pháp</li>
                <li>Buộc Pháp ký Hiệp định Genève (1954)</li>
                <li>Khẳng định sức mạnh của chiến tranh nhân dân</li>
                <li>Cổ vũ phong trào giải phóng dân tộc trên thế giới</li>
            </ul>
            
            <h4>5. Tư tưởng lãnh đạo của Hồ Chí Minh</h4>
            <ul>
                <li><strong>Đoàn kết:</strong> "Đoàn kết, đoàn kết, đại đoàn kết"</li>
                <li><strong>Nhân dân:</strong> "Dân là gốc", "Nước có thể mất, dân không thể nô lệ"</li>
                <li><strong>Hy sinh:</strong> "Không có gì quý hơn độc lập tự do"</li>
                <li><strong>Kiên trung:</strong> "Thà hy sinh tất cả, chứ không chịu mất nước"</li>
            </ul>
            
            <h4>Ý nghĩa lịch sử:</h4>
            <p>24 năm lãnh đạo cách mạng và kháng chiến (1930-1954) đã chứng minh tài năng lãnh đạo xuất chúng của Hồ Chí Minh. Người đã biến tư tưởng Mác-Lê-nin thành hiện thực sống động tại Việt Nam, dẫn dắt dân tộc từ thành công này đến thành công khác.</p>
        `
    },
    5: {
        title: "Di sản tư tưởng (1954-nay)",
        content: `
            <p>Từ 1954 đến nay, tư tưởng Hồ Chí Minh đã trở thành kim chỉ nam soi sáng con đường phát triển của dân tộc Việt Nam.</p>
            
            <h4>1. Giai đoạn xây dựng chủ nghĩa xã hội ở miền Bắc (1954-1975)</h4>
            <p>Dưới sự chỉ đạo của Hồ Chí Minh, miền Bắc đã:</p>
            
            <h5>Cải cách ruộng đất và phát triển kinh tế:</h5>
            <ul>
                <li>Thực hiện cải cách ruộng đất, giải phóng nông dân</li>
                <li>Xây dựng nền kinh tế quốc dân độc lập, tự chủ</li>
                <li>Phát triển công nghiệp, nông nghiệp xã hội chủ nghĩa</li>
                <li>Xóa nạn đói, giảm nghèo đáng kể</li>
            </ul>
            
            <h5>Cách mạng văn hóa xã hội:</h5>
            <ul>
                <li>Xóa nạn mù chữ, phổ cập giáo dục</li>
                <li>Xây dựng nền văn hóa dân tộc, khoa học, đại chúng</li>
                <li>Giải phóng phụ nữ, bình đẳng giới</li>
                <li>Xây dựng con người mới xã hội chủ nghĩa</li>
            </ul>
            
            <h4>2. Kháng chiến chống Mỹ và thống nhất đất nước (1954-1975)</h4>
            <p>Tư tưởng Hồ Chí Minh về giải phóng miền Nam, thống nhất Tổ quốc:</p>
            
            <h5>Tư tưởng về thống nhất:</h5>
            <ul>
                <li>"Bắc Nam cùng một dòng máu" - tình đoàn kết dân tộc</li>
                <li>Kiên trì đấu tranh để thống nhất đất nước</li>
                <li>Kết hợp đấu tranh quân sự, chính trị, ngoại giao</li>
                <li>Tranh thủ sự ủng hộ của bạn bè quốc tế</li>
            </ul>
            
            <h5>Di chúc thiêng liêng (1969):</h5>
            <p>Trước khi từ trần, Hồ Chí Minh để lại Di chúc với những lời căn dặn:</p>
            <ul>
                <li>Về sự nghiệp cách mạng: Kiên trì đấu tranh đến thắng lợi cuối cùng</li>
                <li>Về xây dựng Đảng: "Đảng phải thật trong sạch, thật mạnh"</li>
                <li>Về xây dựng con người: "Cần, kiệm, liêm, chính, chí công vô tư"</li>
                <li>Về đoàn kết: "Đoàn kết là truyền thống quý báu của Đảng và của dân ta"</li>
            </ul>
            
            <h4>3. Thời kỳ Đổi mới (1986-nay)</h4>
            <p>Tư tưởng Hồ Chí Minh được vận dụng sáng tạo trong thời kỳ mới:</p>
            
            <h5>Đổi mới tư duy phát triển:</h5>
            <ul>
                <li>Kinh tế thị trường định hướng xã hội chủ nghĩa</li>
                <li>Hội nhập quốc tế nhưng giữ vững độc lập, chủ quyền</li>
                <li>Phát triển toàn diện, bền vững</li>
                <li>Lấy dân làm gốc, vì dân phục vụ</li>
            </ul>
            
            <h5>Xây dựng nhà nước pháp quyền:</h5>
            <ul>
                <li>Nhà nước của dân, do dân, vì dân</li>
                <li>Dân chủ xã hội chủ nghĩa</li>
                <li>Pháp chế xã hội chủ nghĩa</li>
                <li>Đảm bảo quyền con người</li>
            </ul>
            
            <h4>4. Những giá trị cốt lõi của tư tưởng Hồ Chí Minh</h4>
            
            <h5>Về lý tưởng, mục tiêu:</h5>
            <ul>
                <li><strong>Độc lập dân tộc:</strong> "Không có gì quý hơn độc lập tự do"</li>
                <li><strong>Chủ nghĩa xã hội:</strong> Xã hội không có người bóc lột người</li>
                <li><strong>Dân chủ:</strong> "Dân là gốc" - quyền làm chủ của nhân dân</li>
            </ul>
            
            <h5>Về phương pháp, con đường:</h5>
            <ul>
                <li><strong>Đoàn kết:</strong> Sức mạnh từ khối đại đoàn kết toàn dân tộc</li>
                <li><strong>Kết hợp:</strong> Cách mạng dân tộc và cách mạng xã hội</li>
                <li><strong>Quốc tế:</strong> Kết hợp sức mạnh dân tộc với sức mạnh thời đại</li>
            </ul>
            
            <h5>Về đạo đức, nhân cách:</h5>
            <ul>
                <li><strong>Cần kiệm liêm chính:</strong> Phẩm chất đạo đức người cộng sản</li>
                <li><strong>Vì nước vì dân:</strong> "Sống là để phụng sự Tổ quốc, phụng sự nhân dân"</li>
                <li><strong>Học tập suốt đời:</strong> "Học, học nữa, học mãi"</li>
            </ul>
            
            <h4>5. Tư tưởng Hồ Chí Minh trong thời đại mới</h4>
            
            <h5>Ứng dụng trong xây dựng đất nước:</h5>
            <ul>
                <li>Xây dựng nền kinh tế thị trường định hướng xã hội chủ nghĩa</li>
                <li>Phát triển văn hóa, giáo dục, khoa học công nghệ</li>
                <li>Bảo vệ môi trường, phát triển bền vững</li>
                <li>Xây dựng con người Việt Nam thời kỳ mới</li>
            </ul>
            
            <h5>Ứng dụng trong quan hệ quốc tế:</h5>
            <ul>
                <li>"Việt Nam muốn làm bạn với tất cả các nước trên thế giới"</li>
                <li>Hòa bình, hữu nghị, hợp tác và phát triển</li>
                <li>Đa dạng hóa, đa phương hóa quan hệ đối ngoại</li>
                <li>Tích cực hội nhập quốc tế</li>
            </ul>
            
            <h4>Ý nghĩa và giá trị thời đại:</h4>
            <p>Tư tưởng Hồ Chí Minh không chỉ là di sản quý báu của dân tộc Việt Nam mà còn đóng góp vào kho tàng tư tưởng tiến bộ của nhân loại. Trong bối cảnh hiện tại, tư tưởng Hồ Chí Minh vẫn là ngọn đèn soi sáng con đường phát triển của đất nước, hướng tới mục tiêu xây dựng Việt Nam trở thành nước phát triển, có thu nhập cao vào năm 2045.</p>
        `
    }
};

// Setup event listeners
function setupEventListeners() {
    // Timeline navigation (only if elements exist)
    if (prevBtn) {
        prevBtn.addEventListener('click', navigatePrevious);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', navigateNext);
    }
    
    // Milestone cards
    
    const milestoneCards = document.querySelectorAll('.milestone-card');
    milestoneCards.forEach(card => {
        card.addEventListener('click', () => {
            const milestoneId = card.getAttribute('data-milestone');
            openModal(milestoneId);
        });
        
        // Add hover effect with Bootstrap tooltip
        card.setAttribute('data-bs-toggle', 'tooltip');
        card.setAttribute('title', 'Nhấp để xem chi tiết');
    });
    
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);
    
    // Navbar scroll effect
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Add scroll listener for dropdown active state
    window.addEventListener('scroll', updateDropdownOnScroll);
}

// Function to detect current section and update dropdown active state
function updateDropdownOnScroll() {
    const sections = ['#philosophy-overview', '#timeline', '#philosophy-intro', '#key-thinkers', '#applications', '#resources'];
    let currentSection = '#philosophy-overview';
    
    sections.forEach(section => {
        const element = document.querySelector(section);
        if (element) {
            const rect = element.getBoundingClientRect();
            const navbar = document.querySelector('.navbar');
            const navbarHeight = navbar ? navbar.offsetHeight : 0;
            
            if (rect.top <= navbarHeight + 100 && rect.bottom >= navbarHeight + 100) {
                currentSection = section;
            }
        }
    });
    
    updateActiveDropdownItem(currentSection);
}

function updateTimelinePosition() {
    if (timeline) {
        timeline.style.transform = `translateX(-${currentPosition}px)`;
    }
}

function getMaxScrollPosition() {
    if (!timeline) return 0;
    const timelineWidth = timeline.scrollWidth;
    const containerWidth = timeline.parentElement.clientWidth;
    return Math.max(0, timelineWidth - containerWidth);
}

function updateNavigationButtons() {
    if (!prevBtn || !nextBtn) {
        return; // Skip if timeline buttons don't exist
    }
    
    const maxPosition = getMaxScrollPosition();
    
    prevBtn.disabled = currentPosition <= 0;
    nextBtn.disabled = currentPosition >= maxPosition;
    
    // Add visual feedback
    if (prevBtn.disabled) {
        prevBtn.style.opacity = '0.5';
    } else {
        prevBtn.style.opacity = '1';
    }
    
    if (nextBtn.disabled) {
        nextBtn.style.opacity = '0.5';
    } else {
        nextBtn.style.opacity = '1';
    }
}

// Keyboard navigation
function handleKeyboard(e) {
    switch(e.key) {
        case 'ArrowLeft':
            navigatePrevious();
            break;
        case 'ArrowRight':
            navigateNext();
            break;
        case 'Escape':
            milestoneModal.hide();
            break;
    }
}

// Enhanced quiz answers with more philosophical depth
const quizAnswers = {
    q1: 'a', // "Dân là gốc" - nhân dân là nguồn gốc của quyền lực
    q2: 'a', // Cán bộ đảng viên và người công tác
    q3: 'b', // 2/9/1945 - Ngày đọc Tuyên ngôn Độc lập
    q4: 'a', // Quy luật chuyển hóa từ lượng sang chất
    q5: 'c', // Lực lượng sản xuất quyết định quan hệ sản xuất
    q6: 'b'  // Kinh tế thị trường định hướng xã hội chủ nghĩa
};

// Add more detailed quiz explanations
const quizExplanations = {
    q1: 'Tư tưởng "Dân là gốc" của Hồ Chí Minh thể hiện rõ ràng nhất tinh thần dân chủ, khẳng định nhân dân là nguồn gốc của mọi quyền lực, là chủ thể của lịch sử và cách mạng.',
    q2: 'Tiêu chuẩn đạo đức "Cần, kiệm, liêm, chính" do Hồ Chí Minh đề ra áp dụng cho đội ngũ cán bộ, đảng viên và người công tác để họ trở thành tấm gương sáng cho nhân dân noi theo.',
    q3: 'Tuyên ngôn Độc lập nước Việt Nam Dân chủ Cộng hòa do Chủ tịch Hồ Chí Minh đọc vào ngày 2 tháng 9 năm 1945 tại Quảng trường Ba Đình, Hà Nội, khai sinh ra nước Việt Nam độc lập.',
    q4: 'Quy luật chuyển hóa từ lượng sang chất thể hiện rằng sự tích lũy những thay đổi về lượng đến một giới hạn nhất định sẽ dẫn đến sự thay đổi căn bản về chất, tạo ra sự vật mới.',
    q5: 'Theo chủ nghĩa duy vật lịch sử, lực lượng sản xuất (bao gồm người lao động, tư liệu lao động và đối tượng lao động) quyết định tính chất của quan hệ sản xuất.',
    q6: 'Kinh tế thị trường định hướng xã hội chủ nghĩa là mô hình kinh tế độc đáo của Việt Nam, kết hợp cơ chế thị trường với định hướng và mục tiêu xã hội chủ nghĩa.'
};

// Modal functions
function openModal(milestoneId) {
    const milestone = milestoneDetails[milestoneId];
    if (milestone) {
        const modalBody = document.getElementById('modalBody');
        modalBody.innerHTML = `
            <h3>${milestone.title}</h3>
            ${milestone.content}
        `;
        milestoneModal.show();
    }
}

// Timeline navigation functions
function navigatePrevious() {
    if (currentPosition > 0) {
        currentPosition -= cardWidth;
        updateTimelinePosition();
        updateNavigationButtons();
        
        // Add animation effect
        if (timeline) {
            timeline.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }
}

function navigateNext() {
    const maxPosition = getMaxScrollPosition();
    if (currentPosition < maxPosition) {
        currentPosition += cardWidth;
        updateTimelinePosition();
        updateNavigationButtons();
        
        // Add animation effect
        if (timeline) {
            timeline.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }
}

// Quiz functionality with enhanced animations
function checkQuiz() {
    const resultDiv = document.getElementById('quizResult');
    let score = 0;
    let totalQuestions = Object.keys(quizAnswers).length;
    
    // Check each answer
    for (let question in quizAnswers) {
        const selectedAnswer = document.querySelector(`input[name="${question}"]:checked`);
        if (selectedAnswer && selectedAnswer.value === quizAnswers[question]) {
            score++;
        }
    }
    
    // Display result with animation
    const percentage = (score / totalQuestions) * 100;
    let resultText = `Kết quả: ${score}/${totalQuestions} câu đúng (${percentage.toFixed(0)}%)`;
    let resultIcon = '';
    
    if (percentage >= 80) {
        resultText += " - Xuất sắc! Bạn đã nắm vững kiến thức về Tư tưởng Hồ Chí Minh.";
        resultDiv.className = 'quiz-result correct alert alert-success';
        resultIcon = '<i class="bi bi-trophy-fill me-2"></i>';
    } else if (percentage >= 60) {
        resultText += " - Khá tốt! Bạn cần ôn lại một số kiến thức.";
        resultDiv.className = 'quiz-result correct alert alert-info';
        resultIcon = '<i class="bi bi-award-fill me-2"></i>';
    } else {
        resultText += " - Bạn cần học thêm về Tư tưởng Hồ Chí Minh.";
        resultDiv.className = 'quiz-result incorrect alert alert-warning';
        resultIcon = '<i class="bi bi-exclamation-triangle-fill me-2"></i>';
    }
    
    resultDiv.innerHTML = resultIcon + resultText;
    resultDiv.style.display = 'block';
    
    // Add confetti effect for high scores
    if (percentage >= 80) {
        createConfetti();
    }
    
    // Show correct answers after delay
    setTimeout(() => {
        showCorrectAnswers();
    }, 2000);
}

// Create confetti effect
function createConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Create confetti from multiple points
        if (window.confetti) {
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults,
                particleCount,
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }
    }, 250);
}

// Enhanced quiz result display with explanations
function showCorrectAnswers() {
    for (let question in quizAnswers) {
        const correctAnswer = document.querySelector(`input[name="${question}"][value="${quizAnswers[question]}"]`);
        const selectedAnswer = document.querySelector(`input[name="${question}"]:checked`);
        
        if (correctAnswer) {
            const correctOption = correctAnswer.closest('.option-item');
            correctOption.style.background = 'rgba(76, 175, 80, 0.3)';
            correctOption.style.border = '2px solid #4caf50';
            correctOption.style.borderRadius = '10px';
            
            // Add explanation
            if (quizExplanations[question]) {
                const explanationDiv = document.createElement('div');
                explanationDiv.className = 'explanation-text mt-2 p-2 bg-info bg-opacity-10 rounded';
                explanationDiv.innerHTML = `<small><strong>Giải thích:</strong> ${quizExplanations[question]}</small>`;
                correctOption.appendChild(explanationDiv);
            }
        }
        
        if (selectedAnswer && selectedAnswer !== correctAnswer) {
            const incorrectOption = selectedAnswer.closest('.option-item');
            incorrectOption.style.background = 'rgba(244, 67, 54, 0.3)';
            incorrectOption.style.border = '2px solid #f44336';
            incorrectOption.style.borderRadius = '10px';
        }
    }
}

// Responsive timeline adjustment
window.addEventListener('resize', function() {
    currentPosition = 0;
    updateTimelinePosition();
    updateNavigationButtons();
});

// Enhanced loading animations
window.addEventListener('load', function() {
    // Add progressive card loading animation
    const cards = document.querySelectorAll('.milestone-card');
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px) scale(0.9)';
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0) scale(1)';
        }, 100 + (index * 150));
    });
    
    // Add fade-in effect to other elements
    const fadeElements = document.querySelectorAll('.question, .section-title');
    fadeElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'all 0.5s ease';
        
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 200 + (index * 100));
    });
});

// Add intersection observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const elementsToAnimate = document.querySelectorAll('.milestone-card, .question, .section-title');
    elementsToAnimate.forEach(el => observer.observe(el));
});

// Add CSS class for animations
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        animation: slideInUp 0.6s ease forwards;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Simplified background setup - no effects
function setHeroBackground() {
    console.log('Using simple local background: lenin-monument.jpg');
    // No JavaScript effects needed
}

// Feedback and rating functions
function submitRating(type) {
    const button = event.target.closest('button');
    const originalText = button.innerHTML;
    
    // Visual feedback
    button.disabled = true;
    
    if (type === 'positive') {
        button.innerHTML = '<i class="bi bi-check-circle me-1"></i>Cảm ơn!';
        button.className = 'btn btn-sm btn-success';
        
        // Show thank you message
        showFeedbackMessage('Cảm ơn bạn đã đánh giá tích cực! Phản hồi của bạn giúp chúng tôi rất nhiều.', 'success');
    } else {
        button.innerHTML = '<i class="bi bi-check-circle me-1"></i>Đã ghi nhận';
        button.className = 'btn btn-sm btn-info';
        
        // Show improvement message
        showFeedbackMessage('Cảm ơn phản hồi! Chúng tôi sẽ cố gắng cải thiện để mang lại trải nghiệm tốt hơn.', 'info');
    }
    
    // Reset button after 3 seconds
    setTimeout(() => {
        button.disabled = false;
        button.innerHTML = originalText;
        button.className = type === 'positive' ? 'btn btn-sm btn-success me-1' : 'btn btn-sm btn-secondary';
    }, 3000);
    
    // Log rating (in real application, this would be sent to server)
    console.log(`User rating: ${type} at ${new Date().toISOString()}`);
}

function showFeedbackMessage(message, type) {
    // Create toast notification
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="bi bi-check-circle me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        delay: 4000
    });
    
    bsToast.show();
    
    // Remove toast element after it's hidden
    toast.addEventListener('hidden.bs.toast', () => {
        toast.remove();
    });
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    return container;
}

// Enhanced email functionality
function openFeedbackEmail(type) {
    const subject = encodeURIComponent(`${type} - Tư tưởng Hồ Chí Minh`);
    const body = encodeURIComponent(`
Xin chào nhóm phát triển,

Tôi muốn ${type.toLowerCase()} về website Tư tưởng Hồ Chí Minh:

[Vui lòng mô tả chi tiết ở đây]

Thông tin bổ sung:
- Thời gian truy cập: ${new Date().toLocaleString('vi-VN')}
- Trình duyệt: ${navigator.userAgent}
- URL trang: ${window.location.href}

Cảm ơn!
    `);
    
    const email = type === 'Góp ý nội dung' ? 
        'feedback@mln-history.edu.vn' : 
        'error-report@mln-history.edu.vn';
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
}

// Add click handlers for email links
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Add feedback email handlers
    document.querySelectorAll('a[href^="mailto:feedback"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openFeedbackEmail('Góp ý nội dung');
        });
    });
    
    document.querySelectorAll('a[href^="mailto:error-report"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            openFeedbackEmail('Báo lỗi');
        });
    });
});

// Track user engagement for feedback purposes
function trackUserEngagement() {
    const engagementData = {
        timeSpent: Date.now() - (window.loadTime || Date.now()),
        sectionsVisited: [],
        quizCompleted: false,
        modalOpened: false
    };
    
    // Track sections visited
    const sections = ['philosophy-overview', 'timeline', 'philosophy-intro', 'key-thinkers', 'applications', 'resources', 'quiz'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
        if (section) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && !engagementData.sectionsVisited.includes(sectionId)) {
                        engagementData.sectionsVisited.push(sectionId);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(section);
        }
    });
    
    // Store engagement data for feedback context
    window.userEngagement = engagementData;
}

// Initialize engagement tracking
window.loadTime = Date.now();
trackUserEngagement();

// ===== NEW COMPREHENSIVE QUIZ SYSTEM =====
// 10 câu hỏi toàn diện về Tư tưởng Hồ Chí Minh

const comprehensiveQuizData = [
    {
        id: 1,
        question: "Câu nói nổi tiếng nào của Hồ Chí Minh thể hiện tư tưởng yêu nước?",
        options: [
            "A. Dân là gốc",
            "B. Không có gì quý hơn độc lập tự do", 
            "C. Cần, kiệm, liêm, chính",
            "D. Học, học nữa, học mãi"
        ],
        correct: 1, // B
        hint: "Đây là câu nói được khắc trên lăng Chủ tịch Hồ Chí Minh",
        explanation: "Câu nói 'Không có gì quý hơn độc lập tự do' thể hiện rõ nhất tư tưởng yêu nước và khát vọng độc lập dân tộc của Hồ Chí Minh."
    }
    ,
    // {
    //     id: 2,
    //     question: "Tư tưởng dân chủ của Hồ Chí Minh được thể hiện qua câu nói nào?",
    //     options: [
    //         "A. Dân là gốc",
    //         "B. Đảng là đại diện của nhân dân",
    //         "C. Vì dân, vì nước",
    //         "D. Tất cả đều đúng"
    //     ],
    //     correct: 3, // D
    //     hint: "Tư tưởng dân chủ của Bác được thể hiện qua nhiều câu nói nổi tiếng",
    //     explanation: "Tất cả các câu nói này đều thể hiện tư tưởng dân chủ của Hồ Chí Minh: 'Dân là gốc' khẳng định vai trò chủ đạo của nhân dân, các câu còn lại nhấn mạnh việc phục vụ nhân dân."
    // },
    // {
    //     id: 3,
    //     question: "Hồ Chí Minh sinh năm nào và tên thật là gì?",
    //     options: [
    //         "A. 1889 - Nguyễn Tất Thành",
    //         "B. 1890 - Nguyễn Sinh Cung", 
    //         "C. 1891 - Nguyễn Ái Quốc",
    //         "D. 1892 - Hồ Chí Minh"
    //     ],
    //     correct: 1, // B
    //     hint: "Bác sinh vào năm Canh Dần, tên thật là tên lúc mới sinh",
    //     explanation: "Hồ Chí Minh sinh ngày 19/5/1890 tại làng Sen, xã Nam Đàn, tỉnh Nghệ An với tên thật là Nguyễn Sinh Cung."
    // },
    // {
    //     id: 4,
    //     question: "Đức tính 'Cần, kiệm, liêm, chính' áp dụng cho đối tượng nào?",
    //     options: [
    //         "A. Chỉ cán bộ lãnh đạo",
    //         "B. Chỉ đảng viên",
    //         "C. Mọi người dân Việt Nam",
    //         "D. Chỉ công chức nhà nước"
    //     ],
    //     correct: 2, // C
    //     hint: "Bác Hồ mong muốn toàn dân tộc Việt Nam đều có phẩm chất này",
    //     explanation: "Tuy ban đầu dành cho cán bộ, đảng viên, nhưng Bác Hồ mong muốn đức tính 'Cần, kiệm, liêm, chính' trở thành phẩm chất của mọi người dân Việt Nam."
    // },
    // {
    //     id: 5,
    //     question: "Tuyên ngôn Độc lập được Hồ Chí Minh đọc vào ngày nào?",
    //     options: [
    //         "A. 19/8/1945",
    //         "B. 2/9/1945",
    //         "C. 30/4/1945",
    //         "D. 1/1/1946"
    //     ],
    //     correct: 1, // B
    //     hint: "Đây là ngày Quốc khánh nước Việt Nam Dân chủ Cộng hòa",
    //     explanation: "Ngày 2/9/1945, tại Quảng trường Ba Đình, Hà Nội, Chủ tịch Hồ Chí Minh đã đọc Tuyên ngôn Độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa."
    // },
    // {
    //     id: 6,
    //     question: "Tác phẩm 'Nhật ký trong tù' được viết trong hoàn cảnh nào?",
    //     options: [
    //         "A. Khi bị Pháp bắt giam",
    //         "B. Khi bị Trung Quốc giam giữ (1942-1943)",
    //         "C. Trong thời gian ở Paris",
    //         "D. Khi trốn ở các hang động"
    //     ],
    //     correct: 1, // B
    //     hint: "Đây là thời gian Bác bị giam tại Trung Quốc khi đang tìm đường cứu nước",
    //     explanation: "'Nhật ký trong tù' là tập thơ Bác Hồ viết trong 13 tháng bị chính quyền Tưởng Giới Thạch giam giữ tại Trung Quốc (1942-1943)."
    // },
    // {
    //     id: 7,
    //     question: "Ý nghĩa của câu 'Học, học nữa, học mãi' là gì?",
    //     options: [
    //         "A. Chỉ khuyến khích việc học tập trong trường học",
    //         "B. Tinh thần học tập suốt đời và từ mọi nguồn",
    //         "C. Chỉ học lý thuyết chính trị",
    //         "D. Học chỉ để lấy bằng cấp"
    //     ],
    //     correct: 1, // B
    //     hint: "Bác nhấn mạnh việc học từ sách vở, từ thực tiễn, từ nhân dân",
    //     explanation: "'Học, học nữa, học mãi' thể hiện tinh thần học tập suốt đời, học từ sách vở, từ thực tiễn cuộc sống và từ nhân dân để không ngừng hoàn thiện bản thân."
    // },
    // {
    //     id: 8,
    //     question: "Tư tưởng Hồ Chí Minh về xây dựng Đảng được thể hiện qua nguyên tắc nào?",
    //     options: [
    //         "A. Đảng phải trong sạch, vững mạnh",
    //         "B. Đảng là đại diện trung thành của nhân dân",
    //         "C. Đảng viên phải là người tốt, việc tốt",
    //         "D. Tất cả đều đúng"
    //     ],
    //     correct: 3, // D
    //     hint: "Bác có nhiều tư tưởng toàn diện về xây dựng Đảng",
    //     explanation: "Tư tưởng của Hồ Chí Minh về xây dựng Đảng rất toàn diện, bao gồm việc giữ gìn sự trong sạch, đại diện cho nhân dân và từng đảng viên phải là tấm gương."
    // },
    // {
    //     id: 9,
    //     question: "Trong tư tưởng văn hóa, Hồ Chí Minh coi trọng điều gì nhất?",
    //     options: [
    //         "A. Dân tộc tính - tính khoa học - tính đại chúng",
    //         "B. Chỉ giữ gìn truyền thống cũ",
    //         "C. Chỉ học tập văn hóa phương Tây",
    //         "D. Chỉ phát triển văn hóa mới"
    //     ],
    //     correct: 0, // A
    //     hint: "Ba tính chất cơ bản của nền văn hóa Việt Nam theo Bác Hồ",
    //     explanation: "Theo Hồ Chí Minh, văn hóa Việt Nam phải có ba tính chất: dân tộc tính (giữ bản sắc), tính khoa học (tiến bộ), tính đại chúng (phục vụ nhân dân)."
    // },
    // {
    //     id: 10,
    //     question: "Tư tưởng Hồ Chí Minh có ý nghĩa gì đối với thời đại hiện nay?",
    //     options: [
    //         "A. Chỉ có giá trị lịch sử",
    //         "B. Giá trị định hướng phát triển đất nước và con người",
    //         "C. Chỉ áp dụng cho chính trị",
    //         "D. Không còn phù hợp"
    //     ],
    //     correct: 1, // B
    //     hint: "Tư tưởng của Bác vẫn có giá trị thời đại và định hướng",
    //     explanation: "Tư tưởng Hồ Chí Minh không chỉ có giá trị lịch sử mà còn là kim chỉ nam định hướng phát triển đất nước và hoàn thiện nhân cách con người Việt Nam hiện đại."
    // },
    // {
    //     id: 11,
    //     question: "Hồ Chí Minh sinh ra ở tỉnh nào?",
    //     options: [
    //         "A. Nghệ An",
    //         "B. Hà Tĩnh",
    //         "C. Quảng Bình",
    //         "D. Thanh Hóa"
    //     ],
    //     correct: 0,
    //     hint: "Đây là quê hương của nhiều chí sĩ yêu nước.",
    //     explanation: "Hồ Chí Minh sinh ra tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An."
    // },
    // {
    //     id: 12,
    //     question: "Tên thật của Hồ Chí Minh là gì?",
    //     options: [
    //         "A. Nguyễn Tất Thành",
    //         "B. Nguyễn Sinh Cung",
    //         "C. Nguyễn Ái Quốc",
    //         "D. Nguyễn Văn Thành"
    //     ],
    //     correct: 1,
    //     hint: "Tên này được đặt khi Bác còn nhỏ.",
    //     explanation: "Tên thật của Hồ Chí Minh là Nguyễn Sinh Cung, sau này đổi thành Nguyễn Tất Thành."
    // },
    // {
    //     id: 13,
    //     question: "Hồ Chí Minh ra đi tìm đường cứu nước vào năm nào?",
    //     options: [
    //         "A. 1911",
    //         "B. 1920",
    //         "C. 1930",
    //         "D. 1945"
    //     ],
    //     correct: 0,
    //     hint: "Năm này Bác lên tàu Amiral Latouche-Tréville tại Sài Gòn.",
    //     explanation: "Năm 1911, Hồ Chí Minh ra đi tìm đường cứu nước, bắt đầu hành trình lịch sử."
    // },
    // {
    //     id: 14,
    //     question: "Tác phẩm 'Đường Kách Mệnh' ra đời năm nào?",
    //     options: [
    //         "A. 1925",
    //         "B. 1927",
    //         "C. 1930",
    //         "D. 1941"
    //     ],
    //     correct: 1,
    //     hint: "Đây là cẩm nang cho cán bộ cách mạng trước khi thành lập Đảng.",
    //     explanation: "'Đường Kách Mệnh' ra đời năm 1927, tổng kết lý luận và thực tiễn cách mạng Việt Nam."
    // },
    // {
    //     id: 15,
    //     question: "Hồ Chí Minh đọc Tuyên ngôn Độc lập tại đâu?",
    //     options: [
    //         "A. Quảng trường Ba Đình",
    //         "B. Nhà hát lớn Hà Nội",
    //         "C. Lăng Chủ tịch Hồ Chí Minh",
    //         "D. Văn Miếu Quốc Tử Giám"
    //     ],
    //     correct: 0,
    //     hint: "Đây là nơi diễn ra nhiều sự kiện lịch sử trọng đại.",
    //     explanation: "Hồ Chí Minh đọc Tuyên ngôn Độc lập tại Quảng trường Ba Đình, Hà Nội ngày 2/9/1945."
    // },
    // {
    //     id: 16,
    //     question: "Tác phẩm 'Nhật ký trong tù' được viết bằng thể loại nào?",
    //     options: [
    //         "A. Văn xuôi",
    //         "B. Thơ",
    //         "C. Kịch",
    //         "D. Truyện ngắn"
    //     ],
    //     correct: 1,
    //     hint: "Tác phẩm này gồm nhiều bài ngắn, giàu cảm xúc.",
    //     explanation: "'Nhật ký trong tù' là tập thơ gồm 133 bài, thể hiện tinh thần lạc quan và ý chí kiên cường của Hồ Chí Minh."
    // },
    // {
    //     id: 17,
    //     question: "Hồ Chí Minh từng học tại trường nào ở Huế?",
    //     options: [
    //         "A. Quốc học Huế",
    //         "B. Trường Bưởi",
    //         "C. Trường Đông Kinh Nghĩa Thục",
    //         "D. Trường Sư phạm Hà Nội"
    //     ],
    //     correct: 0,
    //     hint: "Ngôi trường nổi tiếng ở Huế, nơi nhiều chí sĩ yêu nước từng học.",
    //     explanation: "Hồ Chí Minh từng học tại trường Quốc học Huế từ năm 1907-1909."
    // },
    // {
    //     id: 18,
    //     question: "Hồ Chí Minh mất vào năm nào?",
    //     options: [
    //         "A. 1965",
    //         "B. 1967",
    //         "C. 1969",
    //         "D. 1971"
    //     ],
    //     correct: 2,
    //     hint: "Năm này cũng là năm Bác để lại Di chúc lịch sử.",
    //     explanation: "Hồ Chí Minh mất ngày 2/9/1969, để lại Di chúc lịch sử cho toàn Đảng, toàn dân."
    // },
    // {
    //     id: 19,
    //     question: "Tư tưởng Hồ Chí Minh về đại đoàn kết dân tộc nhấn mạnh điều gì?",
    //     options: [
    //         "A. Đoàn kết mọi tầng lớp nhân dân",
    //         "B. Chỉ đoàn kết công nhân",
    //         "C. Chỉ đoàn kết trí thức",
    //         "D. Chỉ đoàn kết nông dân"
    //     ],
    //     correct: 0,
    //     hint: "Bác luôn nhấn mạnh sức mạnh toàn dân tộc.",
    //     explanation: "Tư tưởng đại đoàn kết của Hồ Chí Minh nhấn mạnh đoàn kết mọi tầng lớp nhân dân, không phân biệt giai cấp, tôn giáo, dân tộc."
    // },
    // {
    //     id: 20,
    //     question: "Hồ Chí Minh từng bị giam giữ ở nước nào trong thời gian hoạt động cách mạng?",
    //     options: [
    //         "A. Trung Quốc",
    //         "B. Pháp",
    //         "C. Anh",
    //         "D. Nga"
    //     ],
    //     correct: 0,
    //     hint: "Tập thơ 'Nhật ký trong tù' ra đời trong thời gian này.",
    //     explanation: "Hồ Chí Minh từng bị giam giữ tại Trung Quốc năm 1942-1943, đây là thời gian Người viết tập thơ 'Nhật ký trong tù'."
    // }
];

// Quiz state management
let currentQuizState = {
    currentQuestion: 0,
    answers: {},
    score: 0,
    startTime: null,
    timer: null,
    hintsUsed: 0
};

// Initialize quiz system
function initializeQuiz() {
    console.log('initializeQuiz called');
    
    const questionText = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    
    if (!questionText || !optionsContainer) {
        console.log('Quiz elements not found - not on quiz page');
        return; // Not on quiz page
    }
    
    console.log('Quiz elements found - initializing quiz');
    
    currentQuizState = {
        currentQuestion: 0,
        answers: {},
        score: 0,
        startTime: Date.now(),
        timer: null,
        hintsUsed: 0
    };
    
    // Make current quiz state available globally after initialization
    window.currentQuizState = currentQuizState;
    
    // Make sure we have questions data
    if (!comprehensiveQuizData || comprehensiveQuizData.length === 0) {
        console.error('Quiz data not available');
        questionText.textContent = 'Lỗi: Không có dữ liệu câu hỏi';
        return;
    }
    
    console.log('Starting quiz with', comprehensiveQuizData.length, 'questions');
    
    // Cập nhật tổng số câu hỏi khi khởi tạo
    const totalQuestionsEl = document.getElementById('totalQuestions');
    if (totalQuestionsEl) totalQuestionsEl.textContent = comprehensiveQuizData.length;
    
    displayQuestion();
    startTimer();
    updateProgressBar();
    setupQuizEventListeners();
}

// Display current question
function displayQuestion() {
    console.log('displayQuestion called for question', currentQuizState.currentQuestion);
    
    // Validation
    if (!comprehensiveQuizData || currentQuizState.currentQuestion >= comprehensiveQuizData.length) {
        console.error('Invalid question index or no quiz data');
        return;
    }
    
    const questionData = comprehensiveQuizData[currentQuizState.currentQuestion];
    console.log('Question data:', questionData);
    
    // Update question number and text
    const questionNumberEl = document.getElementById('questionNumber');
    const totalQuestionsEl = document.getElementById('totalQuestions');
    const questionTextEl = document.getElementById('questionText');
    
    if (questionNumberEl) questionNumberEl.textContent = currentQuizState.currentQuestion + 1;
    if (totalQuestionsEl) totalQuestionsEl.textContent = comprehensiveQuizData.length;
    if (questionTextEl) questionTextEl.textContent = questionData.question;
    
    // Nếu có phần tử hiển thị dạng 'Câu hỏi x/y' thì cập nhật luôn
    const questionHeader = document.querySelector('.card-header h4');
    if (questionHeader) {
        questionHeader.innerHTML = `<i class="bi bi-question-circle me-2"></i> Câu hỏi ${currentQuizState.currentQuestion + 1}/${comprehensiveQuizData.length}`;
    }
    
    // Create options
    const optionsContainer = document.getElementById('optionsContainer');
    if (!optionsContainer) {
        console.error('Options container not found');
        return;
    }
    
    optionsContainer.innerHTML = '';
    
    questionData.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'form-check option-item mb-3';
        
        const questionName = `question_${currentQuizState.currentQuestion}`;
        const optionId = `q${currentQuizState.currentQuestion}_option${index}`;
        
        optionDiv.innerHTML = `
            <input class="form-check-input quiz-option" type="radio" name="${questionName}" value="${index}" id="${optionId}">
            <label class="form-check-label" for="${optionId}">
                ${option}
            </label>
        `;
        
        optionsContainer.appendChild(optionDiv);
    });
    
    console.log('Created', questionData.options.length, 'options');
    
    // Add event listeners to new radio buttons
    const radioButtons = optionsContainer.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                console.log('Answer selected:', this.value);
                currentQuizState.answers[currentQuizState.currentQuestion] = parseInt(this.value);
                updateQuizNavigation();
                updateScore();
                showExplanation(); // Show explanation after answering
            }
        });
    });
    
    // Update navigation buttons
    updateQuizNavigation();
    
    // Hide hint and explanation
    document.getElementById('hintContainer').classList.add('d-none');
    document.getElementById('explanationContainer').classList.add('d-none');
    
    // Restore previous answer if exists
    if (currentQuizState.answers[currentQuizState.currentQuestion] !== undefined) {
        const savedAnswer = currentQuizState.answers[currentQuizState.currentQuestion];
        const questionName = `question_${currentQuizState.currentQuestion}`;
        const savedRadio = document.querySelector(`input[name="${questionName}"][value="${savedAnswer}"]`);
        if (savedRadio) {
            savedRadio.checked = true;
            document.getElementById('nextBtn').disabled = false;
        }
    }
}

// Update navigation buttons
function updateQuizNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Previous button
    prevBtn.disabled = currentQuizState.currentQuestion === 0;
    
    // Next/Submit button
    if (currentQuizState.currentQuestion === comprehensiveQuizData.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        submitBtn.style.display = 'none';
    }
    
    // Check if answer is selected for current question
    const questionName = `question_${currentQuizState.currentQuestion}`;
    const selectedAnswer = document.querySelector(`input[name="${questionName}"]:checked`);
    nextBtn.disabled = !selectedAnswer;
}

// Setup quiz event listeners
function setupQuizEventListeners() {
    // Navigation buttons
    document.getElementById('prevBtn').addEventListener('click', previousQuestion);
    document.getElementById('nextBtn').addEventListener('click', nextQuestion);
    document.getElementById('submitBtn').addEventListener('click', submitQuiz);
    document.getElementById('skipBtn').addEventListener('click', skipQuestion);
    document.getElementById('hintBtn').addEventListener('click', showHint);
    
    // Restart button
    if (document.getElementById('restartBtn')) {
        document.getElementById('restartBtn').addEventListener('click', restartQuiz);
    }
}

// Navigate to previous question
function previousQuestion() {
    if (currentQuizState.currentQuestion > 0) {
        currentQuizState.currentQuestion--;
        displayQuestion();
        updateProgressBar();
        // Cập nhật tổng số câu hỏi khi chuyển câu
        const totalQuestionsEl = document.getElementById('totalQuestions');
        if (totalQuestionsEl) totalQuestionsEl.textContent = comprehensiveQuizData.length;
    }
}

// Navigate to next question
function nextQuestion() {
    if (currentQuizState.currentQuestion < comprehensiveQuizData.length - 1) {
        currentQuizState.currentQuestion++;
        displayQuestion();
        updateProgressBar();
        // Cập nhật tổng số câu hỏi khi chuyển câu
        const totalQuestionsEl = document.getElementById('totalQuestions');
        if (totalQuestionsEl) totalQuestionsEl.textContent = comprehensiveQuizData.length;
    }
}

// Skip current question
function skipQuestion() {
    if (currentQuizState.currentQuestion < comprehensiveQuizData.length - 1) {
        // Mark as skipped (no answer saved)
        nextQuestion();
    } else {
        // Last question, go to submit
        submitQuiz();
    }
}

// Show hint for current question
function showHint() {
    const questionData = comprehensiveQuizData[currentQuizState.currentQuestion];
    const hintContainer = document.getElementById('hintContainer');
    const hintText = document.getElementById('hintText');
    
    hintText.textContent = questionData.hint;
    hintContainer.classList.remove('d-none');
    
    currentQuizState.hintsUsed++;
}

// Show explanation after answering
function showExplanation() {
    const questionData = comprehensiveQuizData[currentQuizState.currentQuestion];
    const userAnswer = currentQuizState.answers[currentQuizState.currentQuestion];
    const correctAnswer = questionData.correct;
    
    const explanationContainer = document.getElementById('explanationContainer');
    const explanationText = document.getElementById('explanationText');
    
    // Set explanation text
    explanationText.textContent = questionData.explanation;
    
    // Change container class based on correctness
    if (userAnswer === correctAnswer) {
        explanationContainer.className = 'alert alert-success mt-3';
    } else {
        explanationContainer.className = 'alert alert-warning mt-3';
    }
    
    // Show the explanation
    explanationContainer.classList.remove('d-none');
}

// Update progress bar
function updateProgressBar() {
    const progress = ((currentQuizState.currentQuestion + 1) / comprehensiveQuizData.length) * 100;
    document.getElementById('progressBar').style.width = `${progress}%`;
}

// Update live score
function updateScore() {
    const answeredCount = Object.keys(currentQuizState.answers).length;
    let correctCount = 0;
    
    for (let questionIndex in currentQuizState.answers) {
        const userAnswer = currentQuizState.answers[questionIndex];
        const correctAnswer = comprehensiveQuizData[questionIndex].correct;
        if (userAnswer === correctAnswer) {
            correctCount++;
        }
    }
    
    document.getElementById('currentScore').textContent = correctCount;
}

// Start timer
function startTimer() {
    currentQuizState.timer = setInterval(function() {
        const elapsed = Math.floor((Date.now() - currentQuizState.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        
        document.getElementById('timeSpent').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Submit quiz and show results
function submitQuiz() {
    clearInterval(currentQuizState.timer);
    
    // Calculate final results
    const totalQuestions = comprehensiveQuizData.length;
    const answeredCount = Object.keys(currentQuizState.answers).length;
    let correctCount = 0;
    
    for (let questionIndex in currentQuizState.answers) {
        const userAnswer = currentQuizState.answers[questionIndex];
        const correctAnswer = comprehensiveQuizData[questionIndex].correct;
        if (userAnswer === correctAnswer) {
            correctCount++;
        }
    }
    
    const incorrectCount = answeredCount - correctCount;
    const skippedCount = totalQuestions - answeredCount;
    const finalScore = correctCount;
    
    // Show results
    document.querySelector('.container').style.display = 'none';
    document.getElementById('resultsSection').classList.remove('d-none');
    
    // Update result displays
    document.getElementById('finalScore').textContent = finalScore;
    document.getElementById('correctAnswers').textContent = correctCount;
    document.getElementById('incorrectAnswers').textContent = incorrectCount;
    document.getElementById('skippedAnswers').textContent = skippedCount;
    
    // Show performance message
    let message = '';
    if (finalScore >= 8) {
        message = '🎉 Xuất sắc! Bạn hiểu rất rõ về Tư tưởng Hồ Chí Minh!';
    } else if (finalScore >= 6) {
        message = '👍 Tốt! Bạn có kiến thức khá tốt về chủ đề này.';
    } else if (finalScore >= 4) {
        message = '📚 Khá! Hãy ôn tập thêm để nắm vững hơn.';
    } else {
        message = '💪 Cần cố gắng thêm! Hãy học thêm và thử lại.';
    }
    
    document.getElementById('finalMessage').textContent = message;
    
    // Scroll to results
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
}

// Restart quiz
function restartQuiz() {
    // Clear existing timer
    if (currentQuizState.timer) {
        clearInterval(currentQuizState.timer);
    }
    
    // Reset state
    currentQuizState = {
        currentQuestion: 0,
        answers: {},
        score: 0,
        startTime: Date.now(),
        timer: null,
        hintsUsed: 0
    };
    
    // Show quiz, hide results
    document.querySelector('.container').style.display = 'block';
    document.getElementById('resultsSection').classList.add('d-none');
    
    // Reset display elements
    document.getElementById('currentScore').textContent = '0';
    
    // Restart
    displayQuestion();
    startTimer();
    updateProgressBar();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Make functions globally available
window.initializeQuiz = initializeQuiz;
window.comprehensiveQuizData = comprehensiveQuizData;
window.displayQuestion = displayQuestion;
window.updateQuizNavigation = updateQuizNavigation;
window.previousQuestion = previousQuestion;
window.nextQuestion = nextQuestion;
window.skipQuestion = skipQuestion;
window.showHint = showHint;
window.showExplanation = showExplanation;
window.submitQuiz = submitQuiz;
window.restartQuiz = restartQuiz;

// Auto-initialize if we're on the quiz page
function autoInitializeQuiz() {
    if (document.getElementById('questionText')) {
        console.log('Auto-initializing quiz from script.js');
        initializeQuiz();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitializeQuiz);
} else {
    // DOM is already loaded
    setTimeout(autoInitializeQuiz, 100);
}

// Journey Following Uncle Ho functionality
const journeyData = {
    'lang-sen': {
        title: 'Làng Sen, Nghệ An (1890)',
        subtitle: 'Nơi sinh - Cái nẻo đầu đời',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Làng Sen" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Cái nôi của vị lãnh tụ</h5>
                    <p>Nguyễn Sinh Cung (tên thật của Hồ Chí Minh) sinh ngày 19 tháng 5 năm 1890 tại làng Sen, xã Kim Liên, huyện Nam Đàn, tỉnh Nghệ An.</p>
                    
                    <h6 class="text-classical mt-3">Ý nghĩa lịch sử:</h6>
                    <ul class="small">
                        <li><strong>Môi trường hình thành:</strong> Vùng đất có truyền thống yêu nước</li>
                        <li><strong>Gia đình:</strong> Cha là Nguyễn Sinh Sắc, một nho sĩ yêu nước</li>
                        <li><strong>Ảnh hưởng:</strong> Từ nhỏ đã chứng kiến nỗi khổ của nhân dân</li>
                        <li><strong>Khát vọng:</strong> Hình thành ý chí giải phóng dân tộc</li>
                    </ul>
                </div>
            </div>
            <blockquote class="blockquote text-center mt-3">
                <p class="text-classical fst-italic">"Làng Sen là cái nôi của cách mạng Việt Nam"</p>
                <footer class="blockquote-footer">Tổng Bí thư Lê Duẩn</footer>
            </blockquote>
        `,
        year: '1890',
        significance: 'Nơi sinh và hình thành nhân cách của Hồ Chí Minh'
    },
    'hue': {
        title: 'Huế (1907-1910)',
        subtitle: 'Trường Quốc học - Ươm mầm tư tưởng',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Trường Quốc học Huế" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Nơi ươm mầm tư tưởng cách mạng</h5>
                    <p>Tại trường Quốc học Huế, Nguyễn Tất Thành tiếp xúc với tư tưởng yêu nước và bắt đầu hình thành ý thức cách mạng.</p>
                    
                    <h6 class="text-classical mt-3">Những trải nghiệm quan trọng:</h6>
                    <ul class="small">
                        <li><strong>Giáo dục:</strong> Học tiếng Pháp và văn hóa phương Tây</li>
                        <li><strong>Tiếp xúc:</strong> Gặp gỡ các nhà yêu nước như Phan Bội Châu</li>
                        <li><strong>Ý thức:</strong> Nhận ra sự cần thiết phải tìm đường cứu nước</li>
                        <li><strong>Quyết tâm:</strong> Hình thành ý chí ra đi để học hỏi</li>
                    </ul>
                </div>
            </div>
            <blockquote class="blockquote text-center mt-3">
                <p class="text-classical fst-italic">"Muốn cứu nước và giải phóng dân tộc, không có con đường nào khác con đường cách mạng vô sản"</p>
                <footer class="blockquote-footer">Hồ Chí Minh</footer>
            </blockquote>
        `,
        year: '1907-1910',
        significance: 'Hình thành ý thức cách mạng và khát vọng tìm đường cứu nước'
    },
    'saigon': {
        title: 'Sài Gòn - Cảng Nhà Rồng (1911)',
        subtitle: 'Ra đi tìm đường cứu nước',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Cảng Nhà Rồng" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Chuyến đi lịch sử</h5>
                    <p>Ngày 5 tháng 6 năm 1911, Nguyễn Tất Thành lên tàu Amiral de Latouche-Tréville tại cảng Nhà Rồng, bắt đầu cuộc hành trình 30 năm tìm đường cứu nước.</p>
                    
                    <h6 class="text-classical mt-3">Ý nghĩa lịch sử:</h6>
                    <ul class="small">
                        <li><strong>Khởi đầu:</strong> Cuộc hành trình tìm đường cứu nước</li>
                        <li><strong>Tâm nguyện:</strong> "Tôi chỉ muốn hy sinh tất cả cho dân tộc"</li>
                        <li><strong>Quyết tâm:</strong> Không sợ khó khăn, gian khổ</li>
                        <li><strong>Mục tiêu:</strong> Tìm hiểu các phong trào giải phóng dân tộc</li>
                    </ul>
                </div>
            </div>
            <div class="timeline-event mt-3">
                <h6 class="text-classical">Hành trình đầu tiên:</h6>
                <p class="small">Sài Gòn → Marseille → Le Havre → London → New York</p>
            </div>
        `,
        year: '1911',
        significance: 'Bắt đầu cuộc hành trình 30 năm tìm đường cứu nước'
    },
    'paris': {
        title: 'Paris, Pháp (1917-1923)',
        subtitle: 'Hội nghị Versailles - Tiếng nói cho dân tộc',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Hội nghị Versailles" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Tiếng nói đầu tiên cho dân tộc</h5>
                    <p>Tại Paris, Nguyễn Ái Quốc gửi "Bản yêu sách của nhân dân An Nam" đến Hội nghị Versailles năm 1919, đánh dấu lần đầu tiên tiếng nói Việt Nam vang lên trong diễn đàn quốc tế.</p>
                    
                    <h6 class="text-classical mt-3">Những hoạt động quan trọng:</h6>
                    <ul class="small">
                        <li><strong>Yêu sách 8 điểm:</strong> Đòi quyền dân chủ cho nhân dân Việt Nam</li>
                        <li><strong>Hoạt động báo chí:</strong> Viết bài cho báo L'Humanité</li>
                        <li><strong>Gia nhập Đảng:</strong> Trở thành thành viên Đảng Cộng sản Pháp</li>
                        <li><strong>Nghiên cứu:</strong> Tìm hiểu về chủ nghĩa Mác - Lê-nin</li>
                    </ul>
                </div>
            </div>
            <blockquote class="blockquote text-center mt-3">
                <p class="text-classical fst-italic">"Tôi yêu cầu thay mặt cho người dân An Nam những quyền mà tất cả mọi người đều được hưởng"</p>
                <footer class="blockquote-footer">Nguyễn Ái Quốc, 1919</footer>
            </blockquote>
        `,
        year: '1917-1923',
        significance: 'Lần đầu tiên đưa vấn đề Việt Nam ra diễn đàn quốc tế'
    },
    'moscow': {
        title: 'Moscow, Nga (1924)',
        subtitle: 'Đại học Phương Đông - Học tập cách mạng',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/lenin.png" alt="Đại học Phương Đông Moscow" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Trường học cách mạng</h5>
                    <p>Tại Đại học Phương Đông ở Moscow, Nguyễn Ái Quốc học tập lý thuyết Mác-Lênin và kinh nghiệm cách mạng của Đảng Bolshevik.</p>
                    
                    <h6 class="text-classical mt-3">Những thu hoạch quan trọng:</h6>
                    <ul class="small">
                        <li><strong>Lý thuyết:</strong> Nắm vững chủ nghĩa Mác-Lênin</li>
                        <li><strong>Kinh nghiệm:</strong> Học cách tổ chức và lãnh đạo cách mạng</li>
                        <li><strong>Định hướng:</strong> Xác định con đường cách mạng cho Việt Nam</li>
                        <li><strong>Chuẩn bị:</strong> Sẵn sàng cho việc thành lập Đảng</li>
                    </ul>
                </div>
            </div>
            <div class="achievement-highlight mt-3 p-3 bg-light rounded">
                <h6 class="text-classical">Thành tựu học tập:</h6>
                <p class="small mb-0">Hoàn thành xuất sắc khóa học về lý thuyết cách mạng và được Quốc tế Cộng sản giao nhiệm vụ quan trọng.</p>
            </div>
        `,
        year: '1924',
        significance: 'Học tập lý thuyết cách mạng và chuẩn bị thành lập Đảng'
    },
    'guangzhou': {
        title: 'Quảng Châu, Trung Quốc (1925-1927)',
        subtitle: 'Thành lập Hội Việt Nam cách mạng thanh niên',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Hội Việt Nam cách mạng thanh niên" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Bước chuẩn bị quan trọng</h5>
                    <p>Tháng 6/1925, Nguyễn Ái Quốc thành lập "Hội Việt Nam cách mạng thanh niên" - tổ chức tiền thân của Đảng Cộng sản Việt Nam.</p>
                    
                    <h6 class="text-classical mt-3">Ý nghĩa lịch sử:</h6>
                    <ul class="small">
                        <li><strong>Tổ chức đầu tiên:</strong> Có cương lĩnh và chương trình rõ ràng</li>
                        <li><strong>Đào tạo cán bộ:</strong> Mở lớp huấn luyện chính trị</li>
                        <li><strong>Tuyên truyền:</strong> Xuất bản báo "Thanh niên"</li>
                        <li><strong>Chuẩn bị:</strong> Tạo tiền đề cho việc thành lập Đảng</li>
                    </ul>
                </div>
            </div>
            <blockquote class="blockquote text-center mt-3">
                <p class="text-classical fst-italic">"Đường cách mạng là đường duy nhất để giải phóng các dân tộc bị áp bức"</p>
                <footer class="blockquote-footer">Báo Thanh niên, 1925</footer>
            </blockquote>
        `,
        year: '1925-1927',
        significance: 'Thành lập tổ chức cách mạng đầu tiên của Việt Nam'
    },
    'pac-bo': {
        title: 'Pác Bó, Cao Bằng (1941)',
        subtitle: 'Trở về Tổ quốc - Lãnh đạo cách mạng',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Pác Bó" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Ngày trở về lịch sử</h5>
                    <p>Ngày 28/1/1941, sau 30 năm xa quê hương, Nguyễn Ái Quốc trở về Tổ quốc tại hang Pác Bó, Cao Bằng, bắt đầu trực tiếp lãnh đạo cách mạng Việt Nam.</p>
                    
                    <h6 class="text-classical mt-3">Những hoạt động quan trọng:</h6>
                    <ul class="small">
                        <li><strong>Hội nghị Trung ương 8:</strong> Quyết định thành lập Việt Minh</li>
                        <li><strong>Chiến lược mới:</strong> Kết hợp giải phóng dân tộc với chống phát xít</li>
                        <li><strong>Chuẩn bị khởi nghĩa:</strong> Xây dựng lực lượng vũ trang</li>
                        <li><strong>Tên tuổi mới:</strong> Đổi tên thành Hồ Chí Minh</li>
                    </ul>
                </div>
            </div>
            <div class="historical-moment mt-3 p-3 bg-warning bg-opacity-10 rounded">
                <h6 class="text-classical">Khoảnh khắc lịch sử:</h6>
                <p class="small mb-0">"Đây là lần đầu tiên trong lịch sử dân tộc ta, lãnh tụ cách mạng trở về trực tiếp chỉ đạo cuộc đấu tranh giải phóng."</p>
            </div>
        `,
        year: '1941',
        significance: 'Trở về Tổ quốc sau 30 năm tìm đường cứu nước'
    },
    'hanoi': {
        title: 'Hà Nội - Quảng trường Ba Đình (2/9/1945)',
        subtitle: 'Tuyên bố độc lập',
        content: `
            <div class="row">
                <div class="col-md-6">
                    <img src="./pic/hochiminh.png" alt="Tuyên bố độc lập" class="img-fluid rounded mb-3">
                </div>
                <div class="col-md-6">
                    <h5 class="text-classical">Ngày vĩ đại nhất</h5>
                    <p>Ngày 2 tháng 9 năm 1945, tại Quảng trường Ba Đình, Chủ tịch Hồ Chí Minh đọc Tuyên ngôn độc lập, khai sinh nước Việt Nam Dân chủ Cộng hòa.</p>
                    
                    <h6 class="text-classical mt-3">Ý nghĩa lịch sử:</h6>
                    <ul class="small">
                        <li><strong>Độc lập:</strong> Chấm dứt 80 năm đô hộ của thực dân Pháp</li>
                        <li><strong>Tự do:</strong> Giải phóng dân tộc Việt Nam</li>
                        <li><strong>Hạnh phúc:</strong> Mở ra kỷ nguyên mới cho nhân dân</li>
                        <li><strong>Quốc tế:</strong> Khẳng định vị thế của Việt Nam trên thế giới</li>
                    </ul>
                </div>
            </div>
            <blockquote class="blockquote text-center mt-3 bg-success bg-opacity-10 p-3 rounded">
                <p class="text-classical fst-italic fs-6">"Tất cả mọi người sinh ra đều có quyền bình đẳng. Tạo hóa cho họ những quyền không ai có thể xâm phạm được; trong những quyền ấy, có quyền được sống, quyền tự do và quyền mưu cầu hạnh phúc."</p>
                <footer class="blockquote-footer">Tuyên ngôn độc lập, 2/9/1945</footer>
            </blockquote>
        `,
        year: '2/9/1945',
        significance: 'Khai sinh nước Việt Nam Dân chủ Cộng hòa độc lập'
    }
};

let currentJourneyIndex = 0;
let isAutoPlaying = false;
let autoPlayInterval;

function showJourneyDetail(locationKey) {
    const data = journeyData[locationKey];
    if (!data) return;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('journeyModal');
    if (!modal) {
        modal = createJourneyModal();
        document.body.appendChild(modal);
    }
    
    // Update modal content
    document.getElementById('journeyModalLabel').innerHTML = `
        <i class="bi bi-geo-alt me-2"></i>${data.title}
    `;
    document.getElementById('journeyModalBody').innerHTML = data.content;
    
    // Show modal
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    // Update current journey index
    const journeyPoints = document.querySelectorAll('.journey-point');
    journeyPoints.forEach((point, index) => {
        if (point.querySelector('.journey-marker').classList.contains(locationKey)) {
            currentJourneyIndex = index;
            updateJourneyProgress();
        }
    });
}

function createJourneyModal() {
    const modalHTML = `
        <div class="modal fade" id="journeyModal" tabindex="-1" aria-labelledby="journeyModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                <div class="modal-content">
                    <div class="modal-header bg-classical text-white">
                        <h5 class="modal-title" id="journeyModalLabel"></h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body" id="journeyModalBody">
                        <!-- Content will be dynamically inserted -->
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x-circle me-1"></i>Đóng
                        </button>
                        <button type="button" class="btn btn-classical" onclick="nextJourneyPoint()">
                            <i class="bi bi-arrow-right me-1"></i>Tiếp theo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    return div.firstElementChild;
}

function nextJourneyPoint() {
    const journeyPoints = document.querySelectorAll('.journey-point');
    if (currentJourneyIndex < journeyPoints.length - 1) {
        currentJourneyIndex++;
        const nextMarker = journeyPoints[currentJourneyIndex].querySelector('.journey-marker');
        const locationKey = Array.from(nextMarker.classList).find(cls => 
            cls !== 'journey-marker' && Object.keys(journeyData).includes(cls)
        );
        if (locationKey) {
            showJourneyDetail(locationKey);
        }
    }
    updateJourneyProgress();
}

function previousJourneyPoint() {
    const journeyPoints = document.querySelectorAll('.journey-point');
    if (currentJourneyIndex > 0) {
        currentJourneyIndex--;
        const prevMarker = journeyPoints[currentJourneyIndex].querySelector('.journey-marker');
        const locationKey = Array.from(prevMarker.classList).find(cls => 
            cls !== 'journey-marker' && Object.keys(journeyData).includes(cls)
        );
        if (locationKey) {
            showJourneyDetail(locationKey);
        }
    }
    updateJourneyProgress();
}

function autoPlayJourney() {
    const autoPlayBtn = document.querySelector('.journey-controls .btn-warning');
    const autoPlayText = document.getElementById('autoPlayText');
    
    if (isAutoPlaying) {
        // Stop auto play
        clearInterval(autoPlayInterval);
        isAutoPlaying = false;
        autoPlayText.textContent = 'Tự động phát';
        autoPlayBtn.innerHTML = '<i class="bi bi-play-circle"></i> <span id="autoPlayText">Tự động phát</span>';
    } else {
        // Start auto play
        isAutoPlaying = true;
        autoPlayText.textContent = 'Tạm dừng';
        autoPlayBtn.innerHTML = '<i class="bi bi-pause-circle"></i> <span id="autoPlayText">Tạm dừng</span>';
        
        autoPlayInterval = setInterval(() => {
            nextJourneyPoint();
            if (currentJourneyIndex >= document.querySelectorAll('.journey-point').length - 1) {
                // Reset to beginning
                currentJourneyIndex = -1;
            }
        }, 7000); // Change every 7 seconds
    }
}

function updateJourneyProgress() {
    const totalPoints = document.querySelectorAll('.journey-point').length;
    const progressBar = document.getElementById('journeyProgressBar');
    const currentStep = document.getElementById('currentJourneyStep');
    
    if (progressBar && currentStep) {
        const progress = ((currentJourneyIndex + 1) / totalPoints) * 100;
        progressBar.style.width = progress + '%';
        currentStep.textContent = currentJourneyIndex + 1;
    }
}

// Initialize journey functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateJourneyProgress();
    
    // Add click event listeners to all journey markers
    document.querySelectorAll('.journey-marker').forEach(marker => {
        marker.addEventListener('click', function() {
            const locationKey = Array.from(this.classList).find(cls => 
                cls !== 'journey-marker' && Object.keys(journeyData).includes(cls)
            );
            if (locationKey) {
                showJourneyDetail(locationKey);
            }
        });
    });
});