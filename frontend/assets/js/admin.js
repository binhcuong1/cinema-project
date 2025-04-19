document.addEventListener('DOMContentLoaded', () => {
    const adminBtn = document.getElementById('adminBtn');
    const adminOverlay = document.getElementById('adminOverlay');
    const closeAdmin = document.getElementById('closeAdmin');
  
    adminBtn.addEventListener('click', () => {
      adminOverlay.style.display = 'flex';
    });
  
    closeAdmin.addEventListener('click', () => {
      adminOverlay.style.display = 'none';
    });
  });
  