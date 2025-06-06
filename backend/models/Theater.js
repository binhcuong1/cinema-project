const express = require('express');
const db = require('../config/db');
const table_name = 'rap';

const theater = {
    getAll: (callback) => {
        const query = `
            SELECT t.*, 
                   (SELECT COUNT(*) 
                    FROM phong_chieu p 
                    WHERE p.ma_rap = t.ma_rap AND p.da_xoa = 0) AS room_count
            FROM rap t
            WHERE t.da_xoa = 0      
        `;

        db.query(query, (err, result) => {
            if (err) 
                return callback(err, null);
            callback(null, result);
        });
    },

    getByID: (id, callback) => {
        const query = `
            SELECT t.*, 
                   (SELECT COUNT(*) 
                    FROM phong_chieu p 
                    WHERE p.ma_rap = t.ma_rap AND p.da_xoa = 0) AS room_count
            FROM rap t
            WHERE t.ma_rap = ? AND t.da_xoa = 0
        `;

        db.query(query, [id], (err, result) => {
            if (err)
                return callback(err,null);
            if (result.length === 0) 
                return callback(null, null);
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
        const fields = Object.keys(data).map(key => `${key} = ?`).join(", ");
        const values = Object.values(data);

        values.push(id);

        const query = `UPDATE ${table_name} SET ${fields} WHERE ma_rap = ?`;
        db.query(query, values, (err, result) => {
            if (err) return callback(err, null);
            callback(null, result);
        });
    },

    delete: (id, callback) => {
        db.query(`UPDATE ${table_name} SET da_xoa = 1 WHERE ma_rap = ?`, [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
          });
    },
}

module.exports = theater;