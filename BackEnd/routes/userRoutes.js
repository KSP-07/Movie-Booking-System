
const express = require('express');

const {signupUser ,loginUser, fetchUser , updateUser, deleteUser} = require('../controllers/userController');
const authenticate = require('../middlewares/auth');
const router = express.Router();

router.post('/signup' ,authenticate , signupUser);
router.post("/login",authenticate , loginUser);
router.get('/:userId' ,authenticate , fetchUser);
router.put('/:userId' ,authenticate , updateUser);
router.delete('/:userId' ,authenticate , deleteUser);

module.exports = router;