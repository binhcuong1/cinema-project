import { initializeAuthModal, showLoginForm } from './auth.js';
import { initLoginEvents, checkAuthStatus } from './user.js';

document.addEventListener('DOMContentLoaded', async () => {
    initializeFooter();
    await initializeHeaderAndSidebar(); // sau đó gọi auth modal từ đây
});

async function initializeHeaderAndSidebar() {
    try {
        // Load header
        const headerResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/header.html');
        document.getElementById('header-placeholder').innerHTML = headerResponse.data;
        console.log('Header đã được tải thành công');

        // Load sidebar
        const sidebarResponse = await axios.get('http://127.0.0.1:5500/frontend/pages/shares/sidebar.html');
        document.getElementById('sidebar-placeholder').innerHTML = sidebarResponse.data;
        console.log('Sidebar đã được tải thành công');

        // Gọi auth modal từ file auth.js
        await initializeAuthModal();

        // ✅ Gắn sau khi tất cả modal + DOM đã có
        initLoginEvents();
        checkAuthStatus();
        // Gắn sự kiện sau khi modal đã tải xong
        document.querySelector('.login-btn')?.addEventListener('click', showLoginForm);

    } catch (error) {
        console.error('Lỗi khi tải layout:', error);
    }
}

function initializeFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) {
        console.error('Không tìm thấy footer-container');
        return;
    }

    axios.get('http://127.0.0.1:5500/frontend/pages/shares/footer.html')
        .then(response => {
            footerContainer.innerHTML = response.data;
            console.log('Footer đã được tải thành công');
        })
        .catch(error => console.error('Lỗi khi tải footer:', error));
}
