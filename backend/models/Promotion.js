const db = require('../config/db');
const table_name = 'khuyen_mai';

const promotion = {
    getAll: (callback) => {
        db.query(`SELECT * FROM ${table_name}`, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    getByID: (id, callback) => {
        db.query(`SELECT * FROM ${table_name} WHERE ma_khuyen_mai = ? AND da_xoa = 0`, [id], (err, result) => {
            if (err) return callback(err, null);
            if (result.length === 0) return callback(null, null);
            callback(null, result);
        });
    },

    create: (data, callback) => {
        db.query(`INSERT INTO ${table_name} SET ?`, data, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    update: (id, data, callback) => {
        db.query(`UPDATE ${table_name} SET ? WHERE ma_khuyen_mai = ? AND da_xoa = 0`, [data, id], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    delete: (id, callback) => {
        db.query(`UPDATE ${table_name} SET da_xoa = 1 WHERE ma_khuyen_mai = ?`, [id], (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    }
};

module.exports = promotion;
