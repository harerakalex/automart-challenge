import express from 'express';
import Car from '../../controllers/car';
import auth from '../../middlewares/checkAuth';
import admin from '../../middlewares/admin';
import multipart from 'connect-multiparty';
const multipartMiddleware = multipart();



const router = express.Router();

const car = new Car();

router.post('/', multipartMiddleware, auth, car.create);

router.patch('/:id/price', auth, car.updatePrice);

router.patch('/:id/status', auth, car.updateStatus);

router.get('/:id', car.fetchId);

router.get('/', car.fetch);

router.delete('/:id', [auth, admin], car.delete);

router.post('/flag', auth, car.report);

export default router;
