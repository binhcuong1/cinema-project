const express = require('express');
const db = require('../config/db');
const table_name = 'phim';

const movie = {
    getAll: (callback) => {
        db.query(`SELECT * FROM ${table_name}`, (err, result) => {
            if (err)
                return callback(err,null);
            callback(null, result);
        });
    },

    getByID: (id, callback) => {
        db.query(`SELECT * FROM ${table_name} WHERE ma_phim = ?`, [id], (err, result) => {
            if (err)
                return callback(err,null);
            if (result.length === 0)
                return callback(null, null);
            callback(null, result);
        });
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
        let movieID = id;
        
        db.query(`UPDATE ${table_name} SET ? WHERE ma_phim = ?`, [data, movieID], (err, result) => {
            if (err) 
                return callback(err, null);
            callback(null, result);
        });
    },

    delete: (id, callback) => {
        db.query('UPDATE phim SET da_xoa = 1 WHERE ma_phim = ?', [id], (err, results) => {
            if (err) return callback(err, null);
            callback(null, results);
        });
    },
}

module.exports = movie;