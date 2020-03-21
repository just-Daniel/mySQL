const mysql = require('mysql');

db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'db',

});

db.connect();


