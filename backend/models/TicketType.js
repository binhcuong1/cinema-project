const db = require('../config/db');
const table_name = 'loai_ve';

const ticketType = {
    getByID: (id, callback) => {
        db.query(`SELECT * FROM ${table_name} WHERE ma_loai = ?`, [id], (err, result) => {
            if (err)
                return callback(err, null);
            if (result.length === 0)
                return callback(null, null);
            callback(null, result[0]);
        });
    },

    getAll: (callback) => {
        db.query(`SELECT * FROM ${table_name}`, (err, result) => {
            if (err)
                return callback(err, null);
            callback(null, result);
        });
    },

    create: (data, callback) => {
        db.query(`INSERT INTO ${table_name} SET ?`, data, (err, result) => {
            if (err)
                return callback(err, null);
            callback(null, result);
        });
    },

    update: (id, data, callback) => {
        db.query(`UPDATE ${table_name} SET ? WHERE ma_loai = ?`, [data, id], (err, result) => {
            if (err)
                return callback(err, null);
            callback(null, result);
        });
    },

    delete: (id, callback) => {
        db.query(`UPDATE ${table_name} SET da_xoa = 1 WHERE ma_loai = ?`, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    }
}

module.exports = ticketType;