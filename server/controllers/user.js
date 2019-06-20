import Joi from 'joi';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { signupValidation, signinValidation, resetValidation } from '../helper/validation';
import pool from '../config/db';
import dotenv from 'dotenv';
import Customize from '../helper/customize';



dotenv.config();

class User {
/**
 *
 * @param {login user} req
 * @param {*token on success} res
 */


  async signup(req, res) {
    const error = Customize.validator(req.body, signupValidation,res);
    if (error) return;

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
    const {rows} = await pool.query(insert,
      [newUser.email,newUser.first_name,newUser.last_name,newUser.password,newUser.address,newUser.is_admin,]);

    const token = Customize.generateToken(rows[0].id, rows[0].email, rows[0].is_admin);

    return res.status(201).json(
    {
     status: 201,
     message: 'User Created successfully',
     data: {
        id: rows[0].id,
        first_name: rows[0].first_name,
        last_name: rows[0].last_name,
        email: rows[0].email,
        address: rows[0].address,
        token: token
      }
    },
    );
   
  }

  /**
 *
 * @param {create a meetup} req
 * @param {*returns success if created} res
 */
  async login(req, res) {
    const error = Customize.validator(req.body, signinValidation, res);
    if (error) return;

    const userEmail = req.body.email.trim();
    const userPassword = req.body.password;
    const emailFound = 'SELECT * FROM users WHERE email = $1';
    
    const foundUser = await pool.query(emailFound, [userEmail]);

    if (!foundUser.rows[0]) {
      return res.status(401).json({ status: 401, error: 'email does not exist' });
    }

    const pass = bcrypt.compareSync(userPassword, foundUser.rows[0].password);
    if (pass) {
      const token = Customize.generateToken(foundUser.rows[0].id, foundUser.rows[0].email, foundUser.rows[0].is_admin); 
      return res.status(200).json(
      {
        status: 200,
        message: 'User Logged in successfully',
        data: {
          id: foundUser.rows[0].id,
          first_name: foundUser.rows[0].first_name,
          last_name: foundUser.rows[0].last_name,
          email: foundUser.rows[0].email,
          address: foundUser.rows[0].address,
          token: token
        }
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
    const error = Customize.validator(req.body, signupValidation,res);
    if (error) return;

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
    const token = Customize.generateToken(results.rows[0].id, results.rows[0].email, results.rows[0].is_admin);
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
  }

  /**
 *
 * @param {*} req
 * @param {*} res
 */

  async resetPassword(req, res) {
    const error = Customize.validator(req.body, resetValidation, res);
    if (error) return;

    const query = 'SELECT * FROM users WHERE email = $1';
    const email = req.params.email;
    const findUser = await pool.query(query, [email]);

    if (!findUser.rows[0])
      return res.status(404).json({status: 404,error: `Could not find user with ${req.params.email} as email`});

    if (req.userData.email != req.params.email)
      return res.status(403).json({status: 403,error: 'Forbidden, Make sure it is your account'});

    const newPassword = bcrypt.hashSync(req.body.password, 10);
    const newValue = [newPassword, req.params.email];

    const reset = 'UPDATE users SET password=$1 WHERE email=$2';
    await pool.query(reset, newValue);

    return res.status(200).send({
      status: 200,
      message: `User password with ${req.params.email} email is successfully reset`
    });
  }

}

export default User;
