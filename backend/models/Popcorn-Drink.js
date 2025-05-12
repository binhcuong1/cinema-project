const db = require('../config/db');

const PopcornDrink = {
  getAll: (callback) => {
    const query = `
      SELECT bn.*, lbn.ten_loai
      FROM bap_nuoc bn
      JOIN loai_bap_nuoc lbn ON bn.ma_loai = lbn.ma_loai
      WHERE bn.da_xoa = 0 AND lbn.da_xoa = 0
    `;
    db.query(query, callback);
  },

  getAllLoai: (callback) => {
    db.query('SELECT * FROM loai_bap_nuoc WHERE da_xoa = 0', callback);
  },

  getById: (id, callback) => {
    const query = `
      SELECT bn.*, lbn.ten_loai
      FROM bap_nuoc bn
      JOIN loai_bap_nuoc lbn ON bn.ma_loai = lbn.ma_loai
      WHERE bn.ma_bap_nuoc = ? AND bn.da_xoa = 0
    `;
    db.query(query, [id], callback);
  },

  create: (data, callback) => {
    db.query('INSERT INTO bap_nuoc SET ?', data, callback);
  },

  update: (id, data, callback) => {
    db.query('UPDATE bap_nuoc SET ? WHERE ma_bap_nuoc = ?', [data, id], callback);
  },

  delete: (id, callback) => {
    db.query('UPDATE bap_nuoc SET da_xoa = 1 WHERE ma_bap_nuoc = ?', [id], callback);
  }
};

module.exports = PopcornDrink;
