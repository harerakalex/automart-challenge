import express from 'express';
// import body-parser for extracting body portion
import bodyParser from 'body-parser';
// import the index routes
import routes from './routes/index';

const app = express();

app.use(bodyParser.urlencoded({ extended: false })); // for only passing strings and arrays
app.use(bodyParser.json());// accept json data

// redirect to the routes
app.use('/api/v1/', routes);

// accept static files
app.use(express.static(`${__dirname}/`));

app.use((req, res) => {
  return res.status(404).json({
    status: 404,
    message: 'URL not found',
  });
});

export default app;
