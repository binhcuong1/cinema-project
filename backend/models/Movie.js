const db = require('../config/db');
const table_name = 'phim';

const movie = {
    getByID: (id, callback) => {
        db.query(`SELECT * FROM ${table_name} WHERE ma_phim = ?`, [id], (err, result) => {
            if (err)
                return callback(err,null);
            if (result.length === 0)
                return callback(null, null);
            callback(null, result);
        });
    },

    getAll: (callback) => {
        db.query(`SELECT * FROM ${table_name}`, (err, result) => {
            if (err)
                return callback(err,null);
            callback(null, result);
        });
    },

    getNowShowing: (limit, callback) => {
        db.query(
            `SELECT * FROM ${table_name} WHERE trang_thai = 'dang-chieu' AND da_xoa = 0 LIMIT ?`,
            [limit],
            (err, result) => {
                if (err) return callback(err, null);
                callback(null, result);
            }
        );
    },

    getComingSoon: (limit, callback) => {
        db.query(
            `SELECT * FROM ${table_name} WHERE trang_thai = 'sap-chieu' AND da_xoa = 0 LIMIT ?`,
            [limit],
            (err, result) => {
                if (err) return callback(err, null);
                callback(null, result);
            }
        );
    },

    getByTheater: (theaterID, callback) => {
        db.query(`
            SELECT *
            FROM ${table_name} p
            JOIN lich_chieu lc ON p.ma_phim = lc.ma_phim
            JOIN phong_chieu pc ON pc.ma_phong = lc.ma_phong AND
                                    pc.ma_rap = ? 
        `, theaterID, (err, result) => {
            if (err)
                return callback(err, null);
            callback(null, result);
        });
    },

    create: (data, callback) => {
        db.query(`INSERT INTO ${table_name} SET ?`, data, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result); // 
        });
    },

    update: (id, data, callback) => {
        const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
        const values = Object.values(data);
        values.push(id);
        const query = `UPDATE ${table_name} SET ${fields} WHERE ma_phim = ?`;
        db.query(query, values, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    delete: (id, callback) => {
        db.query('UPDATE phim SET da_xoa = 1 WHERE ma_phim = ?', [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },
    
    search: (keyword, callback) => {
        const query = `SELECT * FROM ${table_name} WHERE ten_phim LIKE ? AND da_xoa = 0`;
        const searchTerm = `%${keyword}%`;
        
        db.query(query, [searchTerm], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },
}

module.exports = movie;