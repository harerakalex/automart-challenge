import fs from 'fs';
import jwt from 'jsonwebtoken';
import chai from 'chai';
import chaiHttp from 'chai-http';
import server from '../server';
import { describe, it } from 'mocha';
import dotenv from 'dotenv';

dotenv.config();
chai.use(chaiHttp);
chai.should();


// test app for routes that do not exist
describe('Routes do not exist', () => {
  it('Should get message of URL not found', (done) => {
    chai.request(server)
      .get('/api/v2/')
      .end((err, res) => {
        res.should.have.status(404);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(404);
        res.body.should.have.property('message');
        done();
      });
  });
});

// Testing index page
describe('Welcome message', () => {
  it('Should return welcome message to the app', (done) => {
    chai.request(server)
      .get('/')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('message');
        done();
      });
  });
});


/* --------------------------------------
   User
   -------------------------------------- */
const user = {
      first_name: 'Harera',
      last_name: 'kalex',
      email: 'hareraloston@gmail.com',
      password: 'butare',
      address: 'Rwanda',
      is_admin: true
    };

describe('signup', () => {
  it('User should be created successfully', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signup')
      .send(user)
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(201);
        res.body.should.have.property('data');
        done();
      });
  });
});

const userCredential = {
  email: 'hareraloston@gmail.com',
  password: 'butare',
};

describe('signIn', () => {
  it('User should sign in successfully', (done) => {
    chai.request(server)
      .post('/api/v1/auth/signin')
      .send(userCredential)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});


/* --------------------------------------
   Car
   -------------------------------------- */
const userTologin = {
      email: 'hareraloston@gmail.com',
      admin: true
    };
const token = jwt.sign(userTologin, process.env.SECRETKEY, { expiresIn: '24hrs' });

// if all field not completed will not post a car.
const newCar = {
      owner: 2,
      manufacture: 'toyota',
      model: 'Corolla',
      price: 2000.01,
      state: 'new',
      body_type: 'Pick up',
      description: 'brand new car 2019'
    };
describe('Post Ads', () => {
  it('New car it should be created successfully', (done) => {
    chai.request(server)
      .post('/api/v1/car')
      .set('Authorization', token)
      .field(newCar)
      .attach('picture', fs.readFileSync('UI/assets/images/car.jpg'), 'car.jpg')
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(201);
        res.body.should.have.property('data');
        done();
      });
  });
  it('New car it should not be created successfully if Authorization fails', (done) => {
    chai.request(server)
      .post('/api/v1/car')
      .send(newCar)
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(401);
        res.body.should.have.property('error');
        done();
      });
  });
  it('New car it should not be created successfully if token is invalid', (done) => {
    chai.request(server)
      .post('/api/v1/car')
      .set('Authorization', 'thisisfaketoken')
      .send(newCar)
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(401);
        res.body.should.have.property('error');
        done();
      });
  });
});

// unit test for updating price
const newPrice = {
  price: 1300.99
}

describe('Update the Price of Posted Ads', () => {
  it('New price  successfully', (done) => {
    chai.request(server)
      .patch('/api/v1/car/1/price')
      .set('Authorization', token)
      .send(newPrice)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});

// test for Available all car
describe('Get a list of Available Cars', () => {
  it('Should return a list of all available cars', (done) => {
    chai.request(server)
      .get('/api/v1/car?status=available')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});


// test for getting all car of specific price range
describe('Get a list of the cars within specific range', () => {
  it('Should return a list of the car within a specific range', (done) => {
    chai.request(server)
      .get('/api/v1/car?status=available&min_price=1200&max_price=1500')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});

// unit test for updating status
const newStatus = {
  status: 'sold'
}

describe('Mark car as sold', () => {
  it('Status should be updated successfully', (done) => {
    chai.request(server)
      .patch('/api/v1/car/1/status')
      .set('Authorization', token)
      .send(newStatus)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});

// test for getting a specific car
describe('Mark car as sold', () => {
  it('Status should be updated successfully', (done) => {
    chai.request(server)
      .get('/api/v1/car/1')
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});



// Report a car test
const fraud = {
  car_id: 1,
  reason: 'stolen',
  description: 'this car was mine'
}

describe('User can report a car as fraud', () => {
  it('Report a car', (done) => {
    chai.request(server)
      .post('/api/v1/car/flag')
      .set('Authorization', token)
      .send(fraud)
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(201);
        res.body.should.have.property('data');
        done();
      });
  });
});


/* --------------------------------------
   Order
   -------------------------------------- */
const order = {
      buyer_id: 1,
      car_id:  1,
      amount: 1300.33,
    };


describe('Make an order', () => {
  it('Order should be created successfully', (done) => {
    chai.request(server)
      .post('/api/v1/order')
      .set('Authorization', token)
      .send(order)
      .end((err, res) => {
        res.should.have.status(201);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(201);
        res.body.should.have.property('data');
        done();
      });
  });
  it('Order should not be created successfully if Authorization fails', (done) => {
    chai.request(server)
      .post('/api/v1/order')
      .send(order)
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(401);
        res.body.should.have.property('error');
        done();
      });
  });
  it('Order should not be created successfully if token is invalid', (done) => {
    chai.request(server)
      .post('/api/v1/order')
      .set('Authorization', 'thisisfaketoken')
      .send(order)
      .end((err, res) => {
        res.should.have.status(401);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(401);
        res.body.should.have.property('error');
        done();
      });
  });
});

// unit test for updating price

describe('Update the Price of Pending order', () => {
  it('The price updated successfully', (done) => {
    chai.request(server)
      .patch('/api/v1/order/1/price')
      .set('Authorization', token)
      .send(newPrice)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});




/* --------------------------------------
   Admin
   -------------------------------------- */

// test for getting all car
describe('Get a list of the Cars', () => {
  it('Get all car', (done) => {
    chai.request(server)
      .get('/api/v1/car')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});

// Delete a car test
describe('Admin delete a car', () => {
  it('Delete a car', (done) => {
    chai.request(server)
      .delete('/api/v1/car/1')
      .set('Authorization', token)
      .end((err, res) => {
        res.should.have.status(200);
        res.should.be.an('object');
        res.body.should.have.property('status').eql(200);
        res.body.should.have.property('data');
        done();
      });
  });
});