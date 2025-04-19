function initializeFooter() {
    const footerContainer = document.getElementById('footer-container');
    if (!footerContainer) {
        console.error('Không tìm thấy footer-container trong trang');
        return;
    }

    axios.get('/frontend/pages/shares/footer.html')
    .then(response => {
        footerContainer.innerHTML = response.data;
    })
    .catch(error => console.error('Lỗi khi tải footer:', error));
}

// Gắn vào sự kiện DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initializeFooter();
});