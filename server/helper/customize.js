import Joi from 'joi';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

class Customize{

	generateToken(id,email,is_admin) {
		const token = jwt.sign({
			id: id,
			email: email,
			is_admin: is_admin,
		},
		process.env.SECRETKEY, { expiresIn: '24h' }
		);
		return token;
	}
	validator(data, schema, res) {
		const { error } = Joi.validate(data, schema);
		if (error) {
		  const errorMessage = error.details[0].message;
		  return res.status(400).json({
		    status: 400,
		    error: errorMessage
		  });
		}
	}
}


export default new Customize();