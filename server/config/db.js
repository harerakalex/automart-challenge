import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

console.log(process.env.NODE_ENV);


// Automart original db in development
if (process.env.NODE_ENV === 'development') {
	module.exports = new Pool({
		connectionString: process.env.ORIGINAL_DB_URL,
	});
}


// Test Db
if (process.env.NODE_ENV === 'test') {
	module.exports = new Pool({
		connectionString: process.env.TEST_DB_URL,
	});
}

// production db
if (process.env.NODE_ENV === 'production') {
	module.exports = new Pool({
		connectionString: process.env.DATABASE_URL,
	});
}