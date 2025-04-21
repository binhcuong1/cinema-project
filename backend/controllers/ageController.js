const age = require('../models/Age');

exports.getAges = (req, res) => {
    age.getAll((err, result) => {
        if (err)
            return res.status(500).json({ error: err });
        res.json({ success: 'true', data: result });
    });
}