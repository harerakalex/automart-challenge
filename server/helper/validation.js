import Joi from 'joi';

const signupValidation = Joi.object({
	first_name: Joi.string().alphanum().min(3).max(30).required(),
	last_name: Joi.string().alphanum().min(3).required(),
	email: Joi.string().email({ minDomainAtoms: 2 }).min(3).required(),
	address: Joi.string().min(3).max(50).required(),
	password: Joi.string().min(6).max(15).required(),
});

// Sign in validation
const signinValidation = Joi.object({
	email: Joi.string().email({ minDomainAtoms: 2 }).min(3).required(),
	password: Joi.string().min(3).required(),
});

// validating a car
const validateCar = Joi.object({
	owner: Joi.number().integer().required(),
	manufacture: Joi.string().min(3).max(50).required(),
	model: Joi.string().min(3).required(),
	price: Joi.number().precision(4).positive().min(2).required(),
	state: Joi.string().valid('new', 'used').required(),
	body_type: Joi.string().min(3).required(),
	description: Joi.string().max(150).required(),
});

// validating price for update
const updateCarPrice = {
	price: Joi.number().precision(4).positive().min(2).required()
};


// validating order
const orderValidation = Joi.object({
    car_id: Joi.number().integer().required(),
    amount: Joi.number().precision(4).positive().min(2).required(),
});

// validating price update for the order
const updateOrderPrice = {
	price: Joi.number().precision(4).positive().min(2).required()
};

// validating status update for the car
const updateCarStatus = {
	status: Joi.string().valid('sold').required()
};

const queryValidation = {
	status: Joi.string().valid('available'),
	min_price: Joi.number().precision(4).positive().min(2),
	max_price: Joi.number().precision(4).positive().min(2),
};

const fraudValidation = {
	car_id: Joi.number().integer().required(),
	reason: Joi.string().min(5).max(100).required(),
	description: Joi.string().min(10).max(300).required()
}
module.exports = { 
	signupValidation,
	signinValidation,
	validateCar,
	updateCarPrice,
	orderValidation,
	updateOrderPrice,
	updateCarStatus,
	queryValidation,
	fraudValidation,
};