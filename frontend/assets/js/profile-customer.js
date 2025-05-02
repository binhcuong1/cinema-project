/**
 * Uploads the user's avatar to the server.
 * @param {File} file - The image file to upload.
 */
function uploadAvatarToServer(file) {
    if (!file) {
        showNotification('Vui lòng chọn một tệp ảnh.', 'error');
        return;
    }

    // Show loading notification
    showNotification('Đang tải ảnh lên...', 'info');

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append('avatar', file);

    // Use axios to upload the file
    axios
        .post('/api/customer/upload-avatar', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
        .then(response => {
            if (response.data && response.data.success) {
                showNotification('Ảnh đại diện đã được cập nhật thành công!', 'success');
            } else {
                showNotification((response.data && response.data.message) || 'Có lỗi xảy ra.', 'error');
            }
        })
        .catch(error => {
            console.error('Error uploading avatar:', error);
            showNotification('Có lỗi xảy ra khi tải ảnh lên.', 'error');
        });
}

/**
 * Sets up navigation for the profile menu.
 */
function setupProfileMenuNavigation() {
    const menuItems = document.querySelectorAll('.profile-menu li');
    const sections = document.querySelectorAll('.profile-content section');
    const mainTitle = document.querySelector('.profile-content h2');
    const profileUserSection = document.querySelector('.profile-user-section');

    if (!menuItems || !sections || !mainTitle || !profileUserSection) {
        console.error('One or more required DOM elements are missing.');
        return;
    }

    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const itemText = this.textContent.trim().replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');

            if (itemText.includes('Đăng xuất')) {
                // Handle logout
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    window.location.href = '/logout';
                }
            } else {
                // Remove 'active' class from all menu items
                menuItems.forEach(mi => mi.classList.remove('active'));

                // Add 'active' class to clicked item
                this.classList.add('active');

                // Remove 'active' class from all sections in profile-content
                sections.forEach(section => section.classList.remove('active'));

                // Handle display in profile-content
                const sectionId = this.getAttribute('data-section');
                const targetSection = document.getElementById(`${sectionId}-section`);

                if (targetSection) {
                    // Show the target section in profile-content
                    targetSection.classList.add('active');
                    // Update main title
                    mainTitle.textContent = itemText;
                    // Ensure user info and menu are visible in sidebar
                    profileUserSection.classList.add('active');
                }

                showNotification(`Đang chuyển đến: ${itemText}`, 'info');
            }
        });
    });
}

/**
 * Sets up navigation for the header "Thông tin cá nhân" button.
 */
function setupHeaderNavigation() {
    const personalInfoHeaderBtn = document.getElementById('personal-info-header-btn');
    const sections = document.querySelectorAll('.profile-content section');
    const mainTitle = document.querySelector('.profile-content h2');
    const profileUserSection = document.querySelector('.profile-user-section');
    const menuItems = document.querySelectorAll('.profile-menu li');

    if (!personalInfoHeaderBtn || !sections || !mainTitle || !profileUserSection || !menuItems) {
        console.error('One or more required DOM elements for header navigation are missing.');
        return;
    }

    personalInfoHeaderBtn.addEventListener('click', function() {
        // Remove 'active' class from all menu items
        menuItems.forEach(mi => mi.classList.remove('active'));

        // Add 'active' class to the "Thông tin khách hàng" menu item
        const personalInfoMenuItem = Array.from(menuItems).find(item => item.getAttribute('data-section') === 'personal-info');
        if (personalInfoMenuItem) {
            personalInfoMenuItem.classList.add('active');
        }

        // Remove 'active' class from all sections in profile-content
        sections.forEach(section => section.classList.remove('active'));

        // Show the personal-info section
        const personalInfoSection = document.getElementById('personal-info-section');
        if (personalInfoSection) {
            personalInfoSection.classList.add('active');
            mainTitle.textContent = 'Thông tin khách hàng';
            profileUserSection.classList.add('active');
        }

        showNotification('Đang chuyển đến: Thông tin khách hàng', 'info');
    });
}

/**
 * Validates email format.
 * @param {string} email - The email to validate.
 * @returns {boolean} - True if email is valid, false otherwise.
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Saves the user's personal information.
 * @param {string} email - The updated email.
 */
function savePersonalInfo(email) {
    // Show loading indicator
    showNotification('Đang lưu thông tin...', 'info');

    // Get all form data
    const fullnameInput = document.getElementById('fullname');
    const birthdateInput = document.getElementById('birthdate');
    const phoneInput = document.getElementById('phone');

    if (!fullnameInput || !birthdateInput || !phoneInput) {
        showNotification('Không tìm thấy các trường dữ liệu cần thiết.', 'error');
        return;
    }

    const fullname = fullnameInput.value;
    const birthdate = birthdateInput.value;
    const phone = phoneInput.value;

    // Make AJAX call to server using axios
    axios
        .post('/api/customer/update-profile', {
            fullname: fullname,
            birthdate: birthdate,
            phone: phone,
            email: email
        })
        .then(response => {
            if (response.data && response.data.success) {
                showNotification('Thông tin cá nhân đã được cập nhật thành công!', 'success');
                // Update the original email reference after successful save
                window.originalEmail = email;
                // Update any UI elements that display the email
                updateEmailDisplay(email);
            } else {
                showNotification((response.data && response.data.message) || 'Có lỗi xảy ra.', 'error');
            }
        })
        .catch(error => {
            console.error('Error saving personal info:', error);
            showNotification('Có lỗi xảy ra khi cập nhật thông tin.', 'error');
        });
}

/**
 * Updates UI elements that display the user's email.
 * @param {string} email - The email to display.
 */
function updateEmailDisplay(email) {
    const emailDisplayElements = document.querySelectorAll('.user-email-display');
    emailDisplayElements.forEach(element => {
        element.textContent = email;
    });
}

/**
 * Shows a notification message to the user.
 * @param {string} message - The message to display.
 * @param {string} type - The type of notification ('success', 'error', 'info').
 */
function showNotification(message, type) {
    const notificationToast = document.getElementById('notification-toast');
    const notificationMessage = document.getElementById('notification-message');

    if (!notificationToast || !notificationMessage) {
        console.error('Notification elements are missing.');
        return;
    }

    // Set the message
    notificationMessage.textContent = message;

    // Update the icon and colors based on type
    const iconElement = notificationToast.querySelector('i');

    // Reset classes
    iconElement.className = '';

    // Add appropriate icon and color based on message type
    if (type === 'success') {
        iconElement.className = 'fas fa-check-circle';
        notificationToast.style.backgroundColor = '#4CAF50';
    } else if (type === 'error') {
        iconElement.className = 'fas fa-exclamation-circle';
        notificationToast.style.backgroundColor = '#F44336';
    } else if (type === 'info') {
        iconElement.className = 'fas fa-info-circle';
        notificationToast.style.backgroundColor = '#2196F3';
    }

    // Show the notification
    notificationToast.classList.add('show');

    // Auto-hide after 5 seconds for success and info messages
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            notificationToast.classList.remove('show');
        }, 5000);
    }
}

/**
 * Sets up the avatar upload functionality.
 */
function setupAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    const userAvatar = document.querySelector('.user-avatar');

    if (!avatarUpload || !userAvatar) {
        console.error('Avatar upload elements are missing.');
        return;
    }

    avatarUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];

        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Vui lòng chọn tệp hình ảnh hợp lệ.', 'error');
                return;
            }

            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showNotification('Kích thước ảnh không được vượt quá 2MB.', 'error');
                return;
            }

            // Create a FileReader to read and display the image
            const reader = new FileReader();
            reader.onload = function(e) {
                // Update preview
                userAvatar.src = e.target.result;

                // Upload avatar to server
                uploadAvatarToServer(file);
            };
            reader.readAsDataURL(file);
        }
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get form elements
    const personalInfoForm = document.getElementById('personal-info-form');
    const emailInput = document.getElementById('email');
    window.originalEmail = emailInput ? emailInput.value : ''; // Store the original email value globally

    // Personal Info Form submit handler
    if (personalInfoForm) {
        personalInfoForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // Get the current email value (which may have been changed by the user)
            const updatedEmail = emailInput.value;

            // Validate email format
            if (!isValidEmail(updatedEmail)) {
                showNotification('Email không hợp lệ. Vui lòng kiểm tra lại.', 'error');
                return;
            }

            // Check if email has been changed
            if (updatedEmail !== window.originalEmail) {
                // Confirm with user if they want to change their login email
                if (confirm('Bạn đang thay đổi email đăng nhập. Tiếp tục?')) {
                    // If confirmed, proceed with saving the profile with the new email
                    savePersonalInfo(updatedEmail);
                } else {
                    // If not confirmed, revert to original email
                    emailInput.value = window.originalEmail;
                    return;
                }
            } else {
                // If email wasn't changed, just save the profile
                savePersonalInfo(updatedEmail);
            }
        });
    }

    // Setup avatar upload
    setupAvatarUpload();

    // Setup profile menu navigation
    setupProfileMenuNavigation();

    // Setup header navigation
    setupHeaderNavigation();
});