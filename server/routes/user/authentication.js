import express from 'express';
import User from '../../controllers/user';
import auth from '../../middlewares/checkAuth';
import admin from '../../middlewares/admin';

const router = express.Router();

// create instance for the user class
const user = new User();

router.post('/signup', user.signup);

router.post('/signin', user.login);

// route for creating admin
router.post('/admin', auth, admin, user.createAdmin);

export default router;
