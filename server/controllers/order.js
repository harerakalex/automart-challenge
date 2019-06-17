import Joi from 'joi';
import { orderValidation, updateOrderPrice } from '../helper/validation';
import timeStamp from '../helper/timestamp';
import cars from '../models/cars';
// import orders from '../models/orders';
import pool from '../config/db';

const DateTime = timeStamp();

class Order {
 


/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async create(req, res) {
	const { error } = Joi.validate(req.body, orderValidation);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}

	const car = 'SELECT * FROM cars WHERE id = $1';
    const carId = req.body.car_id;
    const carToOrder = await pool.query(car, [carId]);

    if (!carToOrder.rows[0])
    	return res.status(404).json({status: 404,error: 'Could not find Car with a given ID'});

    if (carToOrder.rows[0].status === 'sold')
    	return res.status(404).json({status: 404,error: 'Already Sold'});

    if (req.userData.id == carToOrder.rows[0].owner)
    	return res.status(403).json({status: 403,error: 'You can not order your own car'});

    if (req.userData.is_admin)
    	return res.status(403).json({status: 403,error: 'Forbidden'});
	
    const newOrder = {
    	buyer_id: req.userData.id,
    	car_id: parseInt(req.body.car_id, 10),
    	created_on: DateTime,
    	price: parseInt(req.body.amount),
    	status: 'pending'
    };

	const insertOrder = 'INSERT INTO orders(created_on, buyer_id, car_id, amount, status) VALUES($1, $2, $3, $4, $5) RETURNING *';
    const results = await pool.query(insertOrder,
      [
        newOrder.created_on,
        newOrder.buyer_id,
        newOrder.car_id,
        newOrder.price,
        newOrder.status
      ]);
    const reponse = {
    	id: results.rows[0].id,
	    created_on: results.rows[0].created_on,
        buyer_id: results.rows[0].buyer_id,
        car_id: results.rows[0].car_id,
        price: carToOrder.rows[0].price,
        price_offered: results.rows[0].amount,
        state: results.rows[0].status
    }
    res.status(201).json({
    	status: 201,
    	message: 'Order Created successfully',
    	data: reponse
    });
}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async update(req, res) {
	const { error } = Joi.validate(req.body, updateOrderPrice);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}else {
		const paramId = parseInt(req.params.id, 36);
	 	const foundOrder = orders.find(c => c.id === paramId);
	    if (!foundOrder) 
	    	return res.status(404).json({ status: 404, error: 'Could not find Car with a given ID' });
	    // check if it is on pending stage
	    
	    const pending = foundOrder.status;
	    if (pending != 'pending')
	    	return res.status(400).json({ status: 400, error: 'You can update pending order only' });
        
        const old_price_offered = foundOrder.price_offered;
	    const newPrice = req.body.price;
	    foundOrder.price_offered = newPrice;

	    // improving reponse
	    foundOrder.new_price_offered = newPrice;
        foundOrder.old_price_offered = old_price_offered;
	    res.status(200).json({
			status: 200,
			data: foundOrder,
		});
	}
}

}

export default Order;

