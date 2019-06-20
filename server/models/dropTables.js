import pool from '../config/db';


const dropTables = `
    DROP TABLE IF EXISTS cars CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
    DROP TABLE IF EXISTS orders CASCADE;
    DROP TABLE IF EXISTS flags CASCADE;
 `;
pool.query(dropTables).then(() => {
  pool.end();
}).catch((err) => {
  process.exit(0);
});