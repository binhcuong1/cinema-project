const express = require('express');
const db = require('../config/db');
const table_name = 'rap';

const theater = {
    getAll: (callback) => {
        db.query(`SELECT * FROM ${table_name}`, (err, result) => {
            if (err) 
                return callback(err, null);
            callback(null, result);
        });
    },

    getByID: (id, callback) => {
        db.query(`SELECT * FROM ${table_name} WHERE ma_rap = ?`, [id], (err, result) => {
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
        let theaterID = id;
        
        db.query(`UPDATE ${table_name} SET ? WHERE ma_rap = ?`, [data, theaterID], (err, result) => {
            if (err) 
                return callback(err, null);
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