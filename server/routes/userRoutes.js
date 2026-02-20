const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.get('/', userController.getUsers);
router.put('/:id', userController.updateUser);
router.put('/:id/arrive', userController.toggleArrived);
router.delete('/:id', userController.deleteUser);
router.post('/admin/login', userController.adminLogin);

module.exports = router;
