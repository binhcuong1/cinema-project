// Định nghĩa base URL cho axios
axios.defaults.baseURL = 'http://127.0.0.1:3000';

//#region === Khu vực Biến Toàn Cục ===

// Lưu trữ các biểu đồ để hủy khi cần
let timeChart = null;
let movieChart = null;
let theaterChart = null;

//#endregion

//#region === Khu vực Hàm Chung ===

/**
 * Gửi yêu cầu API và xử lý phản hồi
 * @param {string} endpoint - Đường dẫn endpoint API
 * @param {Object} params - Tham số truy vấn
 * @param {string} method - Phương thức HTTP (mặc định: 'get')
 * @param {Object} data - Dữ liệu gửi đi (cho POST/PUT)
 * @returns {Promise} - Kết quả từ API
 */
async function fetchData(endpoint, params = {}, method = 'get', data = {}) {
    console.log('Sending request to:', `${axios.defaults.baseURL}${endpoint}`, 'with params:', params);
    try {
        const response = await axios({ method, url: endpoint, params, data, withCredentials: true });
        if (!response.data.success) throw new Error(response.data.message || 'Dữ liệu không hợp lệ');
        console.log('Response data:', response.data);
        return response.data.data;
    } catch (error) {
        console.error('Lỗi khi gọi', endpoint, ':', error.response ? error.response.data : error.message);
        alert(`Lỗi: ${error.response ? error.response.data.message : error.message}`);
        throw error;
    }
}

/**
 * Khởi tạo và render biểu đồ theo thời gian
 */
async function renderTimeChart() {
    const spinner = document.getElementById('time-loading');
    if (!spinner) {
        console.error('Spinner element not found for time chart');
        return;
    }
    spinner.classList.remove('hidden'); // Hiển thị spinner

    // Tự động ẩn spinner sau 10 giây nếu có lỗi bất ngờ
    const timeout = setTimeout(() => {
        spinner.classList.add('hidden');
        console.log('Spinner auto-hidden after timeout for time chart');
    }, 10000);

    const ctx = document.getElementById('timeRevenueChart')?.getContext('2d');
    if (!ctx) {
        console.error('Canvas timeRevenueChart not found');
        spinner.classList.add('hidden');
        clearTimeout(timeout);
        return;
    }
    if (timeChart) timeChart.destroy();

    try {
        const range = document.getElementById('time-range').value;
        console.log('Fetching data with range:', range);
        const data = await fetchData(`/api/revenue/revenue/`, { range });
        console.log('Data received for time chart:', data);

        // Kiểm tra dữ liệu trước khi map
        if (!Array.isArray(data)) {
            throw new Error('Dữ liệu không phải là mảng');
        }

        const labels = data.map(item => range === 'day' ? item.ngay : `${item.thang}/${item.nam}`);
        const values = data.map(item => item.tong_doanh_thu || 0);

        timeChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Tổng doanh thu (VNĐ)',
                    data: values,
                    borderColor: '#FF6200',
                    backgroundColor: 'rgba(255, 98, 0, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: { color: '#fff', callback: value => value.toLocaleString('vi-VN') + ' VNĐ' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#FFFFFF' } },
                    title: { display: true, text: 'Xu hướng doanh thu', color: '#fff', font: { size: 16 } }
                }
            }
        });
    } catch (error) {
        console.error('Error in renderTimeChart:', error);
        alert('Không thể tải biểu đồ doanh thu theo thời gian. Vui lòng thử lại.');
    } finally {
        spinner.classList.add('hidden');
        clearTimeout(timeout);
        console.log('Spinner hidden for time chart');
    }
}

/**
 * Khởi tạo và render biểu đồ theo phim
 */
async function renderMovieChart() {
    const spinner = document.getElementById('movie-loading');
    if (!spinner) {
        console.error('Spinner element not found for movie chart');
        return;
    }
    spinner.classList.remove('hidden'); // Hiển thị spinner

    // Tự động ẩn spinner sau 10 giây nếu có lỗi bất ngờ
    const timeout = setTimeout(() => {
        spinner.classList.add('hidden');
        console.log('Spinner auto-hidden after timeout for movie chart');
    }, 10000);

    const ctx = document.getElementById('movieRevenueChart')?.getContext('2d');
    if (!ctx) {
        console.error('Canvas movieRevenueChart not found');
        spinner.classList.add('hidden');
        clearTimeout(timeout);
        return;
    }
    if (movieChart) movieChart.destroy();

    try {
        const data = await fetchData('/api/revenue/movie-revenue');
        console.log('Data received for movie chart:', data);

        // Kiểm tra dữ liệu trước khi map
        if (!Array.isArray(data)) {
            throw new Error('Dữ liệu không phải là mảng');
        }

        const labels = data.map(item => item.ten_phim);
        const values = data.map(item => item.tong_doanh_thu || 0);

        movieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Doanh thu (VNĐ)',
                    data: values,
                    backgroundColor: ['#FF6200', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'],
                    borderColor: '#FFFFFF',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: { color: '#FFFFFF' }
                    },
                    title: {
                        display: true,
                        text: 'Tỷ lệ doanh thu theo phim',
                        color: '#fff',
                        font: { size: 16 }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) label += ': ';
                                return label + context.raw.toLocaleString('vi-VN') + ' VNĐ';
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in renderMovieChart:', error);
        alert('Không thể tải biểu đồ doanh thu theo phim. Vui lòng thử lại.');
    } finally {
        spinner.classList.add('hidden');
        clearTimeout(timeout);
        console.log('Spinner hidden for movie chart');
    }
}

/**
 * Khởi tạo và render biểu đồ theo rạp
 */
async function renderTheaterChart() {
    const spinner = document.getElementById('theater-loading');
    if (!spinner) {
        console.error('Spinner element not found for theater chart');
        return;
    }
    spinner.classList.remove('hidden'); // Hiển thị spinner

    // Tự động ẩn spinner sau 10 giây nếu có lỗi bất ngờ
    const timeout = setTimeout(() => {
        spinner.classList.add('hidden');
        console.log('Spinner auto-hidden after timeout for theater chart');
    }, 10000);

    const ctx = document.getElementById('theaterRevenueChart')?.getContext('2d');
    if (!ctx) {
        console.error('Canvas theaterRevenueChart not found');
        spinner.classList.add('hidden');
        clearTimeout(timeout);
        return;
    }
    if (theaterChart) theaterChart.destroy();

    try {
        const data = await fetchData('/api/revenue/theater-revenue');
        console.log('Data received for theater chart:', data);

        // Kiểm tra dữ liệu trước khi map
        if (!Array.isArray(data)) {
            throw new Error('Dữ liệu không phải là mảng');
        }

        const labels = data.map(item => item.ten_rap);
        const values = data.map(item => item.tong_doanh_thu || 0);

        theaterChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Tổng doanh thu (VNĐ)',
                    data: values,
                    backgroundColor: '#FF6200',
                    borderColor: '#FFFFFF',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: '#fff',
                            callback: function(value) {
                                return value.toLocaleString('vi-VN') + ' VNĐ';
                            }
                        },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    x: {
                        ticks: { color: '#fff' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                },
                plugins: {
                    legend: { labels: { color: '#FFFFFF' } },
                    title: {
                        display: true,
                        text: 'Doanh thu theo rạp',
                        color: '#fff',
                        font: { size: 16 }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error in renderTheaterChart:', error);
        alert('Không thể tải biểu đồ doanh thu theo rạp. Vui lòng thử lại.');
    } finally {
        spinner.classList.add('hidden');
        clearTimeout(timeout);
        console.log('Spinner hidden for theater chart');
    }
}

//#endregion

//#region === Khu vực Khởi Tạo ===

/**
 * Khởi tạo sự kiện cho các tab và render biểu đồ
 */
function initializeStats() {
    document.querySelectorAll('.stats-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.stats-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const tabId = tab.getAttribute('data-tab');
            document.querySelectorAll('.chart-container').forEach(container => {
                container.style.display = 'none';
            });
            document.getElementById(`${tabId}-chart`).style.display = 'block';
            if (tabId === 'time') renderTimeChart();
            else if (tabId === 'movie') renderMovieChart();
            else if (tabId === 'theater') renderTheaterChart();
        });
    });

    // Thêm sự kiện thay đổi range cho biểu đồ thời gian
    document.getElementById('time-range').addEventListener('change', renderTimeChart);
    renderTimeChart(); // Render mặc định
}

// Khởi tạo khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === 'stats') {
        initializeStats();
    }
});

//#endregion