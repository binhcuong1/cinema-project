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

-- Thêm thuộc tính trang_thai cho bảng phim
alter table phim
add column trang_thai enum('dang-chieu', 'sap-chieu', 'khong-chieu') default 'sap-chieu';

CREATE TABLE khuyen_mai (
    ma_khuyen_mai INT AUTO_INCREMENT PRIMARY KEY,
    ten_khuyen_mai VARCHAR(255) NOT NULL,
    mo_ta VARCHAR(255),
    dieu_kien VARCHAR(255),
    luu_y TEXT,
    trang_thai ENUM('dang_hoat_dong', 'het_han', 'chua_kich_hoat') DEFAULT 'chua_kich_hoat',
    image VARCHAR(255),
    da_xoa TINYINT(1) DEFAULT 0,
    -- gia_2d INT, -- Giá 2D khuyến mãi
    -- gia_3d INT, -- Giá 3D khuyến mãi
    gio_bat_dau TIME,
    gio_ket_thuc TIME,
    ngay_trong_tuan VARCHAR(10),
    doi_tuong VARCHAR(100) -- Đối tượng áp dụng
);

-- Thêm bảng giới hạn độ tuổi
CREATE TABLE gioi_han_do_tuoi (
    ma_gioi_han VARCHAR(10) PRIMARY KEY,
    mo_ta VARCHAR(255),
    tuoi_toi_thieu INT NOT NULL
);

INSERT INTO my_cinema.gioi_han_do_tuoi (ma_gioi_han, mo_ta, tuoi_toi_thieu) VALUES
    ('P', 'Phim dành cho mọi lứa tuổi', 0),
    ('K', 'Phim dành cho trẻ em dưới 13 tuổi, cần có sự đồng hành của cha mẹ hoặc người giám hộ', 0),
    ('T13', 'Phim dành cho khán giả từ 13 tuổi trở lên', 13),
    ('T16', 'Phim dành cho khán giả từ 16 tuổi trở lên', 16),
    ('T18', 'Phim dành cho khán giả từ 18 tuổi trở lên', 18);

-- Xóa cột gioi_han_tuoi cũ
ALTER TABLE phim DROP COLUMN gioi_han_tuoi;

-- Thêm cột gioi_han_tuoi mới với kiểu VARCHAR và liên kết khóa ngoại
ALTER TABLE phim
ADD COLUMN gioi_han_tuoi VARCHAR(10),
ADD CONSTRAINT fk_gioi_han_tuoi
FOREIGN KEY (gioi_han_tuoi) REFERENCES gioi_han_do_tuoi(ma_gioi_han);

CREATE TABLE trang_thai_ghe_suat_chieu (
    ma_lich_chieu INT,
    ma_ghe INT,
    trang_thai enum('chua-dat', 'dang-dat', 'da-dat') DEFAULT 'chua-dat',
    ma_dat_ve INT,
    PRIMARY KEY (ma_lich_chieu, ma_ghe),
    FOREIGN KEY (ma_lich_chieu) REFERENCES lich_chieu(ma_lich_chieu),
    FOREIGN KEY (ma_ghe) REFERENCES ghe(ma_ghe),
    FOREIGN KEY (ma_dat_ve) REFERENCES dat_ve(ma_dat_ve)
);
-- them bang banner
CREATE TABLE banner (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ten VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    ngay_bat_dau DATE NOT NULL,
    ngay_ket_thuc DATE NOT NULL,
    da_xoa TINYINT(1) DEFAULT 0
);
-- Thêm cột trailer vào bảng phim
ALTER TABLE phim
ADD COLUMN trailer VARCHAR(255) AFTER image;