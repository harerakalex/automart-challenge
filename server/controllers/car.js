import Joi from 'joi';
import { validateCar, updateCarPrice, updateCarStatus, queryValidation, fraudValidation } from '../helper/validation';
import timeStamp from '../helper/timestamp';
import cloudinary from 'cloudinary';
import cloudinaryConfig from '../helper/cloudinaryConfig';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

const DateTime = timeStamp();

class Car {
 

 
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async fetch(req, res) {
	const { error } = Joi.validate(req.query, queryValidation);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}
	const queryParameter = req.query;
	const carStatus = queryParameter.status;
	const minPrice = parseInt(queryParameter.min_price, 10);
	const maxPrice = parseInt(queryParameter.max_price, 10);
	// to detect the size of the query object
	const keys = Object.keys(queryParameter);

	if (keys.length === 1) {
		const findCar = 'SELECT * FROM cars WHERE status = $1';
    	const foundAvailableCar = await pool.query(findCar, [carStatus]);

    	if (!foundAvailableCar.rows[0]) {
    		return res.status(404).json({
    			status: 404,
    			error: 'No search Data found for that query'
    		}); 
    	}
    	res.status(200).json({
    		status: 200,
    		message: 'Successfully retrieved',
    		data: foundAvailableCar.rows
    	});
	} else if (keys.length === 3) {
		const findPrice = 'SELECT * FROM cars WHERE status = $1 AND price >= $2 AND price <= $3';
    	const valuesCompare = [carStatus, minPrice, maxPrice];

    	const rangeFound = await pool.query(findPrice, valuesCompare);
    	if (!rangeFound.rows[0]) {
    		return res.status(404).json({
    			status: 404,
    			error: 'No search Data found for that query'
    		}); 
    	}
    	res.status(200).json({
    		status: 200,
    		message: 'Successfully retrieved',
    		data: rangeFound.rows
    	});
	} else {
		const token = req.headers.authorization;
		if (token) {
			try {
				const decode = jwt.verify(token, process.env.SECRETKEY);

				if (decode.is_admin) {
					const findCars = 'SELECT * FROM cars';
    				const listAllCar = await pool.query(findCars);

    				if (!listAllCar.rows[0]) {
    					return res.status(404).json({
    						status: 404,
    						error: 'No car found yet'
    					}); 
    				}
    				res.status(200).json({
    					status: 200,
    					message: 'Successfully retrieved',
    					data: listAllCar.rows
    				});
				}
				else  
					return res.status(403).json({ status: 403, error: 'Unathorized access.' });
			} catch {
				return res.status(401).json({ status: 401, error: 'Invalid token' });
			}
		} else {
			return res.status(401).json({ status: 401, error: 'No token provided' });
		}

	}
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async fetchId(req, res) {
	const findCar = 'SELECT * FROM cars WHERE id = $1';
    const id = parseInt(req.params.id, 10);
    const foundCar = await pool.query(findCar, [id]);

    if (!foundCar.rows[0]) {
     	return res.status(404).json({
			status: 404,
			error: 'Could not find Car with a given ID'
		}); 
    } else {
      res.status(200).json({
        status: 200,
        message: 'Successfully retrieved',
        data: foundCar.rows[0],
      });
    }  
}



/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async create(req, res) {
	const { error } = Joi.validate(req.body, validateCar);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}
	if (!req.files.picture){
		return res.status(400).json({
			status: 400,
			error: 'Image is required',
		});
	}
	const filename = req.files.picture.path;
	cloudinary.v2.uploader.upload(filename,{tags:'Automart Images'},async function(err,image){
		if (err){ return res.status(404).json({status: 404,error: 'Invalid File'});}
		else{
			const imageUrl = image.secure_url;
			const userId = parseInt(req.body.owner, 10);
			const newCar = {
				owner: userId,
				created_on: DateTime,
				state: req.body.state,
				status: 'available',
				price: req.body.price,
				manufacture: req.body.manufacture,
				model: req.body.model,
				body_type: req.body.body_type,
				description: req.body.description,
				image: imageUrl
			};
			const insertCar = 'INSERT INTO cars(created_on, owner, manufacture, model, price, state, status, body_type, description, picture) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *';
		    const results = await pool.query(insertCar,
		      [
		        newCar.created_on,
		        newCar.owner,
		        newCar.manufacture,
		        newCar.model,
		        newCar.price,
		        newCar.state,
		        newCar.status,
		        newCar.body_type,
		        newCar.description,
		        newCar.image
		      ]);

		    const response = {
		    	id: results.rows[0].id,
		        created_on: results.rows[0].created_on,
		        owner: results.rows[0].owner,
		        manufacturer: results.rows[0].manufacture,
		        model: results.rows[0].model,
		        price: results.rows[0].price,
		        state: results.rows[0].state,
		        status: results.rows[0].status,
		        image: results.rows[0].picture
		    }
		    return res.status(201).json({
		    	status: 201,
		    	message: 'Car Created successfully',
		    	data: response
		    });
		}
	});
	

}
/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async updatePrice(req, res) {
	const { error } = Joi.validate(req.body, updateCarPrice);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}

	const id = parseInt(req.params.id, 10);
	const updatePriceOfcar = 'SELECT * FROM cars WHERE id = $1';
    const carId = parseInt(req.params.id, 10);
    const carToUpdate = await pool.query(updatePriceOfcar, [carId]);

    if (!carToUpdate.rows[0])
    	return res.status(404).json({status: 404,error: 'Could not find Car with a given ID',});

    if (req.userData.id != carToUpdate.rows[0].owner)
    	return res.status(403).json({status: 403,error: 'Forbidden'});

    const updateCar = 'UPDATE cars SET price = $1  WHERE id = $2';
    const values = [req.body.price, carId];

    await pool.query(updateCar, values);

    const updatedCar = {
      id: carToUpdate.rows[0].id,
      owner: carToUpdate.rows[0].owner,
      manufacturer: carToUpdate.rows[0].manufacture,
      createdOn: carToUpdate.rows[0].created_on,
      state: carToUpdate.rows[0].state,
      status: carToUpdate.rows[0].status,
      price: req.body.price,
      model: carToUpdate.rows[0].model,
      body_type: carToUpdate.rows[0].body_type
    };

    return res.status(200).json({
    	status: 200,
    	message: 'Price updated',
    	data: updatedCar
    });
	
	
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async updateStatus(req, res) {
  	const { error } = Joi.validate(req.body, updateCarStatus);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}

	const updateStatusOfcar = 'SELECT * FROM cars WHERE id = $1';
    const carId = parseInt(req.params.id, 10);
    const markAsSold = await pool.query(updateStatusOfcar, [carId]);

    if (!markAsSold.rows[0])
    	return res.status(404).json({status: 404,error: 'Could not find Car with a given ID',});

    if (req.userData.id != markAsSold.rows[0].owner)
    	return res.status(403).json({status: 403,error: 'Forbidden'});

    const mark = 'UPDATE cars SET status = $1  WHERE id = $2';
    const values = [req.body.status, carId];

    await pool.query(mark, values);

    const updatedStatusCar = {
      id: markAsSold.rows[0].id,
      owner: markAsSold.rows[0].owner,
      manufacturer: markAsSold.rows[0].manufacture,
      createdOn: markAsSold.rows[0].created_on,
      state: markAsSold.rows[0].state,
      price: markAsSold.rows[0].price,
      status: req.body.status,
      model: markAsSold.rows[0].model,
      body_type: markAsSold.rows[0].body_type
    };

    return res.status(200).json({
    	status: 200,
    	message: 'Status updated',
    	data: updatedStatusCar
    });		  
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async delete(req, res) {
	const carSql = 'SELECT * FROM cars WHERE id = $1';
    const idOfCar = parseInt(req.params.id, 10);
    const carToDelete = await pool.query(carSql, [idOfCar]);

    if (!carToDelete.rows[0]) {
      res.status(404).json({
        status: 404,
        error: 'Car Ad not found',
      });
      return;
    }
    const deleteCar = 'DELETE FROM cars WHERE id = $1';
    await pool.query(deleteCar, [idOfCar]);

    res.status(200).json({
		status: 200,
		data: "Car Ad successfully Deleted"
	});     
}

/**
 * 
 * @param {*} req 
 * @param {*} res 
 */
async report(req, res) {
	const { error } = Joi.validate(req.body, fraudValidation);
	if (error) {
		const errorMessage = error.details[0].message;
		return res.status(400).json({
        status: 400,
        error: errorMessage
      });
	}
	const selectCar = 'SELECT * FROM cars WHERE id = $1';
    const carId = req.body.car_id;
    const carToReport = await pool.query(selectCar, [carId]);

    if (!carToReport.rows[0])
    	return res.status(404).json({status: 404,error: 'Could not find Car with a given ID',});

    if (req.userData.id == carToReport.rows[0].owner)
    	return res.status(403).json({status: 403,error: 'You can not report your car'});

	const newFraud = {
		created_on: DateTime,
		car_id: req.body.car_id,
		reason: req.body.reason,
		description: req.body.description
	}

	const insertFlag = 'INSERT INTO flags(created_on, car_id, reason, description) VALUES($1, $2, $3, $4) RETURNING *';
    const results = await pool.query(insertFlag,
      [
        newFraud.created_on,
        newFraud.car_id,
        newFraud.reason,
        newFraud.description
      ]);
    const response = {
    	id: results.rows[0].id,
	    created_on: results.rows[0].created_on,
        car_id: results.rows[0].car_id,
        reason: results.rows[0].reason,
        description: results.rows[0].description
    }
	res.status(201).json({
		status: 201,
		message: 'New fraud Created successfully',
		data: response
	});    
}

}

export default Car;

