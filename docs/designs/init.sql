-- Tạo bảng rap (Rạp chiếu phim)
CREATE TABLE rap (
    ma_rap INT PRIMARY KEY AUTO_INCREMENT,
    ten_rap VARCHAR(255),
    dia_chi VARCHAR(255),
    sdt VARCHAR(20),
    image VARCHAR(255),
    da_xoa TINYINT(1) DEFAULT 0
);

-- Tạo bảng phong_chieu (Phòng chiếu)
CREATE TABLE phong_chieu (
    ma_phong INT PRIMARY KEY AUTO_INCREMENT,
    ma_rap INT,
    ten_phong VARCHAR(255),
    so_luong_ghe INT,
    da_xoa TINYINT(1) DEFAULT 0,
    FOREIGN KEY (ma_rap) REFERENCES rap(ma_rap)
);

-- Tạo bảng phim (Phim)
CREATE TABLE phim (
    ma_phim INT PRIMARY KEY AUTO_INCREMENT,
    ten_phim VARCHAR(255),
    mo_ta TEXT,
    ngay_phat_hanh DATE,
    thoi_luong_phut INT,
    noi_dung_phim TEXT,
    gioi_han_tuoi INT,
    image VARCHAR(255),
    da_xoa TINYINT(1) DEFAULT 0
);

-- Tạo bảng lich_chieu (Lịch chiếu)
CREATE TABLE lich_chieu (
    ma_lich_chieu INT PRIMARY KEY AUTO_INCREMENT,
    ma_phim INT,
    ma_phong INT,
    thoi_gian_bat_dau DATETIME,
    thoi_gian_ket_thuc DATETIME,
    FOREIGN KEY (ma_phim) REFERENCES phim(ma_phim),
    FOREIGN KEY (ma_phong) REFERENCES phong_chieu(ma_phong)
);

-- Tạo bảng ghe (Ghế)
CREATE TABLE ghe (
    ma_ghe INT PRIMARY KEY AUTO_INCREMENT,
    ma_phong INT,
    hang_ghe VARCHAR(10),
    so_ghe INT,
    da_xoa TINYINT(1) DEFAULT 0,
    FOREIGN KEY (ma_phong) REFERENCES phong_chieu(ma_phong)
);

-- Tạo bảng loai_ve (Loại vé)
CREATE TABLE loai_ve (
    ma_loai INT PRIMARY KEY AUTO_INCREMENT,
    ten_loai VARCHAR(255),
    don_gia DECIMAL(10,2)
);

-- Tạo bảng role (Vai trò)
CREATE TABLE role (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50)
);

-- Tạo bảng tai_khoan (Tài khoản)
CREATE TABLE tai_khoan (
    ma_tai_khoan INT PRIMARY KEY AUTO_INCREMENT,
    ten_dang_nhap VARCHAR(255),
    ho_va_ten VARCHAR(255),
    mat_khau VARCHAR(255),
    sdt VARCHAR(20),
    diachi VARCHAR(255),
    role_id INT,
    FOREIGN KEY (role_id) REFERENCES role(role_id)
);

-- Tạo bảng hinh_thuc_thanh_toan (Hình thức thanh toán)
CREATE TABLE hinh_thuc_thanh_toan (
    ma_hinh_thuc INT PRIMARY KEY AUTO_INCREMENT,
    ten_hinh_thuc VARCHAR(255)
);

-- Tạo bảng dat_ve (Đặt vé)
CREATE TABLE dat_ve (
    ma_dat_ve INT PRIMARY KEY AUTO_INCREMENT,
    ma_lich_chieu INT,
    ma_hinh_thuc INT,
    ma_tai_khoan INT,
    ten_dang_nhap VARCHAR(255),
    thoi_gian_dat DATETIME,
    so_luong_ghe INT,
    tong_tien DECIMAL(10,2),
    FOREIGN KEY (ma_lich_chieu) REFERENCES lich_chieu(ma_lich_chieu),
    FOREIGN KEY (ma_hinh_thuc) REFERENCES hinh_thuc_thanh_toan(ma_hinh_thuc),
    FOREIGN KEY (ma_tai_khoan) REFERENCES tai_khoan(ma_tai_khoan)
);

-- Tạo bảng ct_loai_ve (Chi tiết loại vé)
CREATE TABLE ct_loai_ve (
    ma_dat_ve INT,
    ma_loai INT,
    so_luong INT,
    PRIMARY KEY (ma_dat_ve, ma_loai),
    FOREIGN KEY (ma_dat_ve) REFERENCES dat_ve(ma_dat_ve),
    FOREIGN KEY (ma_loai) REFERENCES loai_ve(ma_loai)
);

-- Tạo bảng ct_dat_ghe (Chi tiết đặt ghế)
CREATE TABLE ct_dat_ghe (
    ma_dat_ve INT,
    ma_ghe INT,
    PRIMARY KEY (ma_dat_ve, ma_ghe),
    FOREIGN KEY (ma_dat_ve) REFERENCES dat_ve(ma_dat_ve),
    FOREIGN KEY (ma_ghe) REFERENCES ghe(ma_ghe)
);

-- Tạo bảng loai_bap_nuoc (Loại bắp nước)
CREATE TABLE loai_bap_nuoc (
    ma_loai INT PRIMARY KEY AUTO_INCREMENT,
    ten_loai VARCHAR(255),
    da_xoa TINYINT(1) DEFAULT 0
);

-- Tạo bảng bap_nuoc (Bắp nước)
CREATE TABLE bap_nuoc (
    ma_bap_nuoc INT PRIMARY KEY AUTO_INCREMENT,
    ma_loai INT,
    ten_bap_nuoc VARCHAR(255),
    don_gia DECIMAL(10,2),
    da_xoa TINYINT(1) DEFAULT 0,
    FOREIGN KEY (ma_loai) REFERENCES loai_bap_nuoc(ma_loai)
);

-- Tạo bảng ct_bap_nuoc (Chi tiết bắp nước)
CREATE TABLE ct_bap_nuoc (
    ma_bap_nuoc INT,
    ma_dat_ve INT,
    so_luong INT,
    PRIMARY KEY (ma_bap_nuoc, ma_dat_ve),
    FOREIGN KEY (ma_bap_nuoc) REFERENCES bap_nuoc(ma_bap_nuoc),
    FOREIGN KEY (ma_dat_ve) REFERENCES dat_ve(ma_dat_ve)
);

-- Tạo bảng log (Nhật ký)
CREATE TABLE log (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    timestamp DATETIME,
    event_type VARCHAR(50),
    description TEXT,
    user_id INT,
    FOREIGN KEY (user_id) REFERENCES tai_khoan(ma_tai_khoan)
);

INSERT INTO phim (ten_phim, mo_ta, ngay_phat_hanh, thoi_luong_phut, noi_dung_phim, gioi_han_tuoi, da_xoa) VALUES
('Avengers: Endgame', 'Bộ phim kết thúc của loạt Avengers', '2019-04-26', 181, 'Các siêu anh hùng chiến đấu với Thanos để cứu vũ trụ.', 13, 0),
('The Lion King', 'Bộ phim hoạt hình về vua sư tử', '2019-07-19', 118, 'Simba trở thành vua của Pride Lands.', 0, 0),
('Joker', 'Bộ phim tâm lý về nhân vật Joker', '2019-10-04', 122, 'Hành trình trở thành Joker của Arthur Fleck.', 18, 0);

-- TẠO THÊM BẢNG KHUYẾN MÃI VÀ THÊM DỮ LIỆU

CREATE TABLE khuyen_mai (
    ma_khuyen_mai INT PRIMARY KEY AUTO_INCREMENT,
    ten_khuyen_mai VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    dieu_kieu VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    luu_y VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
    image VARCHAR(255),
    da_xoa TINYINT(1) DEFAULT 0
);

INSERT INTO khuyen_mai (ten_khuyen_mai, dieu_kieu, luu_y, image, da_xoa) VALUES
('Giảm 20% vé thường', 'Đặt ít nhất 2 vé thường', 'Chỉ áp dụng cho vé thường, không áp dụng cho vé VIP', '/images/khuyenmai1.jpg', 0),
('Mua 1 tặng 1 combo nhỏ', 'Mua combo nhỏ trong ngày thứ 4', 'Áp dụng vào thứ 4 hàng tuần', '/images/khuyenmai2.jpg', 0),
('Giảm 10% cho khách hàng mới', 'Áp dụng cho khách hàng lần đầu đặt vé', 'Chỉ áp dụng cho đơn đầu tiên', '/images/khuyenmai3.jpg', 0);