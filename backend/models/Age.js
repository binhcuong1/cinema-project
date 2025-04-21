const db = require('../config/db');
const table_name = 'gioi_han_do_tuoi';

const age = {
    getAll: (callback) => {
        db.query(`SELECT * FROM ${table_name}`, (err, result) => {
            if (err)
                return callback(err,null);
            callback(null, result);
        });
    },
}

module.exports = age;