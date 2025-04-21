document.addEventListener('DOMContentLoaded', () => {
  const adminBtn = document.getElementById('adminBtn');
  const adminSidebar = document.getElementById('adminSidebar');
  const closeSidebar = document.getElementById('closeSidebar');

  // Hiển thị sidebar khi nhấn nút
  adminBtn.addEventListener('click', () => {
      adminSidebar.classList.toggle('hidden');
  });

  // Hiển thị sidebar khi di chuột vào nút
  adminBtn.addEventListener('mouseenter', () => {
      adminSidebar.classList.remove('hidden');
  });

  // Ẩn sidebar khi di chuột ra ngoài
  adminSidebar.addEventListener('mouseleave', () => {
      adminSidebar.classList.add('hidden');
  });

  // Đóng sidebar khi nhấn nút đóng
  closeSidebar.addEventListener('click', () => {
      adminSidebar.classList.add('hidden');
  });

  // Ẩn sidebar khi nhấn ngoài
  document.addEventListener('click', (e) => {
      if (!adminSidebar.contains(e.target) && e.target !== adminBtn) {
          adminSidebar.classList.add('hidden');
      }
  });
});