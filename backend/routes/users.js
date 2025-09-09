const express = require('express');
const router = express.Router();

const {
    getUsers,
    getUser,
    updateUser,
    deleteUser,
    getUserStats,
    getDashboard,
    createAdmin,
    toggleUserStatus
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');
const {
    validateRegister,
    validateObjectId,
    validatePagination
} = require('../middleware/validation');

// All user management routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

// User management routes
router.get('/', validatePagination, getUsers);
router.get('/stats', getUserStats);
router.get('/dashboard', getDashboard);
router.post('/create-admin', validateRegister, createAdmin);
router.get('/:id', validateObjectId, getUser);
router.put('/:id', validateObjectId, updateUser);
router.put('/:id/toggle-status', validateObjectId, toggleUserStatus);
router.delete('/:id', validateObjectId, deleteUser);

module.exports = router;
