const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('../token-config.js');

app.get('/auth', (request, response) => {
  db.query(`SELECT * FROM users`, [], (err, rows, fields) =>{
    if (err) {
      response.status(400).send(err);
    } else {
      response.send(rows);
    }
  });
});

app.use('*', function(request, response, next) {
  if (request.baseUrl === '/register' || request.baseUrl === '/login') {
    next();
  } else {
    const data = request.query;
    const token = data.access_token;
    if (!token) {
      return response
          .status(401)
          .send({auth: false, message: 'No token provided.'});
    }


    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return response
            .status(500)
            .send({auth: false, message: 'Failed to authenticate token.'});
      }

      db.query('SELECT * FROM users WHERE id=? AND password=?',
          [decoded.id, decoded.password], (err, rows, fields) => {
            if (err) {
              response.status(400).send(err);
            } else {
              next();
            }
          });
    });
  }
});


app.post('/register', (request, response) => {
  const data = request.query;
  const hashedPassword = crypto
      .createHash('md5')
      .update(data.password)
      .digest('hex');

  if (data.name && data.password) {
    db.query(`INSERT INTO users VALUES(?, ?, ?)`,
        [null, data.name, hashedPassword], (err, rows, fields) => {
          if (err) {
            response.status(400).send({error: 'Unable to save new user' + err});
          } else {
            const token = jwt
                .sign({id: rows.insertId, password: hashedPassword},
                    config.secret,
                    {
                      expiresIn: 86400, // expires in 24 hours
                    });
            response.send({auth: true, token: token});
          }
        });
  } else {
    response
        .status(400)
        .send({error: 'name and password are requared fields' + err});
  }
});

app.post('/login', (req, response) => {
  const data = req.query;
  const hashedPassword = crypto
      .createHash('md5')
      .update(data.password)
      .digest('hex');

  db.query('SELECT * FROM users WHERE name= ? AND password= ?',
      [data.name, hashedPassword], (err, rows, fields) => {
        if (err) {
          response.status(400).send(err);
        } else {
          if (rows.length === 0) {
            response.status(400).send({error: 'Incorrect name or password'});
          } else {
            const token = jwt
                .sign({id: rows.id, password: hashedPassword},
                    config.secret,
                    {
                      expiresIn: 86400, // expires in 24 hours
                    });
            response.send({auth: true, token: token});
          }
        }
      });
});
