const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.get('/me', userController.getCurrentUser);
router.post('/logout', userController.logout);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/register', userController.register);
router.post('/update-profile', userController.updateProfile);
router.post('/change-password', userController.changePassword);
router.get('/', userController.getAllUsers);
router.put('/:id/role', userController.updateRole);


module.exports = router;
