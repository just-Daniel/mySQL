const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../token-config.js');

app.get('/auth', (request, response) => {
  db.query(`SELECT * FROM users`, [], (err, rows, fields) =>{
    if(err){
      response.status(400).send(err);
    }else{
      response.send(rows);
    }
  });
});



app.post('/register', (request, response) => {
  const data = request.query;
  const hashedPassword = crypto.createHash('md5').update(data.password).digest('hex');

  if(data.name && data.password){
    db.query(`INSERT INTO users VALUES(?, ?, ?)`, 
            [null, data.name, hashedPassword], (err, rows, fields) => {
      if (err) {
        response.status(400).send({ error: 'Unable to save new user' + err });
      }else {
        const token = jwt.sign({ id: rows.insertId,  password: hashedPassword }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        response.send({ auth: true, token: token });
      }
    });
  }else{
    response.status(400).send({ error: "name and password are requared fields" + err });
  }
});

app.post('/login', (req, response) => {
  const data = req.query;
  const hashedPassword = crypto.createHash('md5').update(data.password).digest('hex');

  db.query('SELECT * FROM users WHERE name= ? AND password= ?', [ data.name, hashedPassword ], (err, rows, fields) => {
    if (err) {
      response.status(400).send(err);
    }else{
      if(rows.length === 0) {
        response.status(400).send({ error: "Incorrect name or password" });
      }else{ 
        const token = jwt.sign({ id: rows.id,  password: hashedPassword }, config.secret, {
          expiresIn: 86400 // expires in 24 hours
        });
        response.send({ auth: true, token: token });
      } 
    }
  });
});
