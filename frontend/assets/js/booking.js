// Logic cho phần chọn ghế
const seats = [
    { id: 'A1', status: 'available' }, { id: 'A2', status: 'available' }, { id: 'A3', status: 'sold' }, { id: 'A4', status: 'available' }, { id: 'A5', status: 'available' }, { id: 'A6', status: 'available' }, { id: 'A7', status: 'sold' }, { id: 'A8', status: 'available' }, { id: 'A9', status: 'available' }, { id: 'A10', status: 'sold' }, { id: 'A11', status: 'available' }, { id: 'A12', status: 'available' }, { id: 'A13', status: 'available' }, { id: 'A14', status: 'sold' }, { id: 'A15', status: 'available' }, { id: 'A16', status: 'available' },
    { id: 'B1', status: 'available' }, { id: 'B2', status: 'available' }, { id: 'B3', status: 'available' }, { id: 'B4', status: 'sold' }, { id: 'B5', status: 'available' }, { id: 'B6', status: 'available' }, { id: 'B7', status: 'available' }, { id: 'B8', status: 'sold' }, { id: 'B9', status: 'available' }, { id: 'B10', status: 'available' }, { id: 'B11', status: 'sold' }, { id: 'B12', status: 'available' }, { id: 'B13', status: 'available' }, { id: 'B14', status: 'available' }, { id: 'B15', status: 'sold' }, { id: 'B16', status: 'available' },
    { id: 'C1', status: 'sold' }, { id: 'C2', status: 'available' }, { id: 'C3', status: 'available' }, { id: 'C4', status: 'available' }, { id: 'C5', status: 'available' }, { id: 'C6', status: 'sold' }, { id: 'C7', status: 'available' }, { id: 'C8', status: 'available' }, { id: 'C9', status: 'sold' }, { id: 'C10', status: 'available' }, { id: 'C11', status: 'available' }, { id: 'C12', status: 'available' }, { id: 'C13', status: 'sold' }, { id: 'C14', status: 'available' }, { id: 'C15', status: 'available' }, { id: 'C16', status: 'available' },
    { id: 'D1', status: 'available' }, { id: 'D2', status: 'available' }, { id: 'D3', status: 'sold' }, { id: 'D4', status: 'available' }, { id: 'D5', status: 'available' }, { id: 'D6', status: 'available' }, { id: 'D7', status: 'sold' }, { id: 'D8', status: 'available' }, { id: 'D9', status: 'available' }, { id: 'D10', status: 'sold' }, { id: 'D11', status: 'available' }, { id: 'D12', status: 'available' }, { id: 'D13', status: 'available' }, { id: 'D14', status: 'sold' }, { id: 'D15', status: 'available' }, { id: 'D16', status: 'available' },
];

function renderSeats() {
    const seatGrid = document.getElementById('seat-grid');
    seatGrid.innerHTML = ''; // Xóa nội dung cũ
    const rows = ['A', 'B', 'C', 'D']; // Các hàng ghế

    rows.forEach(row => {
        const rowSeats = seats.filter(seat => seat.id.startsWith(row)); // Lọc ghế theo hàng
        const rowElement = document.createElement('div');
        rowElement.classList.add('seat-row'); // Thêm class cho hàng

        const labelElement = document.createElement('div');
        labelElement.classList.add('row-label');
        labelElement.textContent = row; // Gắn nhãn hàng (A, B, C, D)
        rowElement.appendChild(labelElement);

        rowSeats.forEach(seat => {
            const seatElement = document.createElement('div');
            seatElement.classList.add('seat', seat.status); // Thêm class tương ứng với trạng thái
            seatElement.textContent = seat.id; // Hiển thị mã ghế
            seatElement.addEventListener('click', () => selectSeat(seat.id)); // Thêm sự kiện click
            rowElement.appendChild(seatElement);
        });

        seatGrid.appendChild(rowElement);
    });
}

function selectSeat(seatId) {
    const seat = seats.find(s => s.id === seatId);
    if (seat.status === 'sold') return;
    seat.status = seat.status === 'available' ? 'selected' : 'available';
    renderSeats();
    updateSummaryBarVisibility();
}

window.onload = () => {
    renderSeats();
}
