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
