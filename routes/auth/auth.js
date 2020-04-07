const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const config = require('./token-config.js');
const tokenUtils = require('./token-utils');

app.use('*', function(request, response, next) {
  if (request.baseUrl === '/login' || request.baseUrl == '/register' ) {
    next();
  } else {
    tokenUtils.getTokenUser(request)
        .then((user) => next())
        .catch((error) => response.status(error.status).send(error.message));
  }
});

app.get('/auth', (request, response, next) => {
  db.query('SELECT * FROM users', (err, rows, fields) => {
    if (err) {
      response.status(400).send(err);
    } else {
      response.send(rows);
    }
  });
});


app.post('/register', function(req, response) {
  const data = req.query;
  const hashedPassword = crypto.createHash('md5').update(data.password).digest('hex');

  db.query(`INSERT INTO users VALUES(?, ?, ?)`,
      [null, data.name, hashedPassword], function(err, rows, fields) {
        if (err) {
          response.status(400).send({error: 'Unable to save new user'});
        } else {
          const token = jwt.sign({id: rows.insertId, password: hashedPassword},
              config.secret, {
                expiresIn: 86400, // expires in 24 hours
              });
          response.send({auth: true, token: token});
        }
      });
});

app.post('/login', function(req, response) {
  const data = req.query;
  const hashedPassword = crypto.createHash('md5').update(data.password).digest('hex');

  db.query('SELECT * FROM users where name=? AND password=?', [data.name, hashedPassword],
      function(err, rows, fields) {
        if (err) {
          response.status(400).send(err);
        } else {
          if (rows.length === 0) {
            response.status(400).send({error: 'Username or password is incorrect'});
          } else {
            const token = jwt.sign({id: rows[0].id, password: hashedPassword},
                config.secret, {
                  expiresIn: 86400, // expires in 24 hours
                });
            response.send({auth: true, token: token});
          }
        }
      });
});
