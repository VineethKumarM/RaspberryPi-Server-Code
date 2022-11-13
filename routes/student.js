const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student');
const studentRequireLogin = require('../middlewares/studentRequireLogin');

router.post('/studentsignup', studentController.userRegister);
router.post('/studentsignin', studentController.userLogin);
router.get('/studentmylabs', studentRequireLogin, studentController.myLabs);
router.post('/joinlab', studentRequireLogin, studentController.joinLab);
router.post('/showNotification' , studentRequireLogin , studentController.showNotifications);

module.exports = router;