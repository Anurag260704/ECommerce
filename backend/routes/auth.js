const express = require('express');
const router = express.Router();

const {
    register,
    login,
    logout,
    getMe,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail
} = require('../controllers/authController');

const { protect, authorize } = require('../middleware/auth');
const {
    validateRegister,
    validateLogin,
    validateChangePassword,
    validateResetPassword,
    validateProfileUpdate
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resettoken', validateResetPassword, resetPassword);
router.get('/verify-email/:token', verifyEmail);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.get('/me', getMe);
router.get('/logout', logout);
router.put('/profile', validateProfileUpdate, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);

module.exports = router;
