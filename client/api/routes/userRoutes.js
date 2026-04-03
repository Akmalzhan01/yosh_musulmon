const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', userController.registerUser);
router.get('/', userController.getUsers);
router.post('/admin/login', userController.adminLogin);
router.post('/admin/migrate-ids', userController.migrateIds);
router.put('/:id', userController.updateUser);
router.put('/:id/arrive', userController.toggleArrived);
router.put('/:id/scores', userController.updateScore);
router.delete('/:id/scores/:etap', userController.deleteScore);
router.delete('/:id', userController.deleteUser);

module.exports = router;
