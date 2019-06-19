import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signupValidation, signinValidation } from '../helper/validation';
import pool from '../config/db';
import dotenv from 'dotenv';



dotenv.config();

class User {
/**
 *
 * @param {login user} req
 * @param {*token on success} res
 */


  async signup(req, res) {
    const { error } = Joi.validate(req.body, signupValidation);
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        status: 400,
        error: errorMessage,
      });
    }
    const email = req.body.email.trim();
    const emailFound = 'SELECT * FROM users WHERE email = $1';
    
    const user = await pool.query(emailFound, [email]);
    if (user.rows[0]) {
     return res.status(409).json({ status: 409, error: 'Email Exists' });
    }
    
    const newUser = {
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      password: bcrypt.hashSync(req.body.password, 10),
      is_admin: false
    };

    const insert = 'INSERT INTO users(email, first_name, last_name, password, address, is_admin) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
    const results = await pool.query(insert,
      [
      newUser.email,
      newUser.first_name,
      newUser.last_name,
      newUser.password,
      newUser.address,
      newUser.is_admin,
      ]);

    const payload = {
        id: results.rows[0].id,
        email: results.rows[0].email,
        is_admin: results.rows[0].is_admin,
      };
    jwt.sign(payload, process.env.SECRETKEY, { expiresIn: '24h' }, (err, token) => {
      
      const response = {
          id: results.rows[0].id,
          first_name: results.rows[0].first_name,
          last_name: results.rows[0].last_name,
          email: results.rows[0].email,
          address: results.rows[0].address,
          token: token
        }
      return res.status(201).json(
      {
       status: 201,
       message: 'User Created successfully',
       data: response
      },
      );
    });
      
      
    
  }

  /**
 *
 * @param {create a meetup} req
 * @param {*returns success if created} res
 */
  async login(req, res) {
    const { error } = Joi.validate(req.body, signinValidation);
    if (error) {
      const errorMessage = error.details[0].message;
      return res.status(400).json({
        status: 400,
        error: errorMessage,
      });
    }

    const userEmail = req.body.email.trim();
    const userPassword = req.body.password;
    const emailFound = 'SELECT * FROM users WHERE email = $1';
    
    const foundUser = await pool.query(emailFound, [userEmail]);

    if (!foundUser.rows[0]) {
      return res.status(401).json({ status: 401, error: 'email does not exist' });
    }

    const pass = bcrypt.compareSync(userPassword, foundUser.rows[0].password);
    if (pass) {
      // delete foundUser.password;
      const payload = {
        id: foundUser.rows[0].id,
        email: foundUser.rows[0].email,
        is_admin: foundUser.rows[0].is_admin,
      };

      jwt.sign(payload, process.env.SECRETKEY, {expiresIn: '24h'}, (err, token) => {
        
        const response = {
          id: foundUser.rows[0].id,
          first_name: foundUser.rows[0].first_name,
          last_name: foundUser.rows[0].last_name,
          email: foundUser.rows[0].email,
          address: foundUser.rows[0].address,
          token: token
        }    
        return res.status(200).json(
        {
          status: 200,
          message: 'User Logged in successfully',
          data: response
        });
      });
    }
    else{
      return res.status(401).json({
        status: 401,
        message: "invalid credential"
      })
    }  
  }

/**
 *
 * @param {*} req
 * @param {*} res
 */

  async createAdmin(req, res) {
    const { error } = Joi.validate(req.body, signupValidation);
    if (error) {
      return res.status(400).json({
        status: 400,
        error: error.details[0].message
      });
    } 

    const email = req.body.email.trim();
    const emailFound = 'SELECT * FROM users WHERE email = $1';
    
    const user = await pool.query(emailFound, [email]);
    if (user.rows[0]) {
     return res.status(409).json({ status: 409, error: 'Email Exists' });
    }
    
    const newUser = {
      email: req.body.email,
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      address: req.body.address,
      password: bcrypt.hashSync(req.body.password, 10),
      is_admin: true
    };

    const insert = 'INSERT INTO users(email, first_name, last_name, password, address, is_admin) VALUES($1, $2, $3, $4, $5, $6) RETURNING *';
    const results = await pool.query(insert,
      [
      newUser.email,
      newUser.first_name,
      newUser.last_name,
      newUser.password,
      newUser.address,
      newUser.is_admin,
      ]);

    const payloadAdmin = {
        id: results.rows[0].id,
        email: results.rows[0].email,
        is_admin: results.rows[0].is_admin,
      };
    jwt.sign(payloadAdmin, process.env.SECRETKEY, { expiresIn: '24h' }, (err, token) => {
      return res.status(201).json({
        status: 201,
        message: 'Admin Created successfully',
        data: {
          id: results.rows[0].id,
          first_name: results.rows[0].first_name,
          last_name: results.rows[0].last_name,
          email: results.rows[0].email,
          address: results.rows[0].address,
          token: token,
        }
      });
    });
  }
  /**
 *
 * @param {*} req
 * @param {*} res
 */

  async logout(req, res) {

  }
}

export default User;
