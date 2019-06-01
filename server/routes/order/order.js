import express from 'express';
import Order from '../../controllers/order';

const router = express.Router();

// create instance for the order class 
const order = new Order();

// route for creating order
router.post('/', order.create);



export default router;