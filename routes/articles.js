const jwt = require('jsonwebtoken');
const config = require('../token-config.js');

app.get('/articles', (request, response) => {
  db.query('SELECT * FROM articles', (err, rows, fields) => {
    if (err) {
      response.status(400).send(err);
    } else {
      response.send(rows);
    }
  });
});

app.delete('/articles', (request, response) => {
  const data = request.query;
  if (data.id) {
    const token = data.access_token;

    if (!token) {
      return response.status(401)
          .send({auth: false, message: 'No token provided.'});
    }

    jwt.verify(token, config.secret, function(err, decoded) {
      if (err) {
        return response
            .status(500)
            .send({auth: false, message: 'Failed to authenticate token.'});
      }

      db.query('SELECT * FROM articles WHERE id = ?',
          [data.id], (err, rows, fields) => {
            if (err) {
              response.status(400).send(err);
            } else {
              console.log(data.id);
              if (rows[0].user_id === decoded.id) {
                db.query(`DELETE FROM articles WHERE id = ?`,
                    [data.id], (err, rows, fields) => {
                      if (err) {
                        response
                            .status(400)
                            .send({error: 'Unable to delete article ' + err});
                      } else {
                        response.send({status: 'OK'});
                      }
                    });
              } else {
                response.status(400)
                    .send({
                      error:
                      `User doesn't have permissions to delete this articles!`,
                    });
              }
            }
          });
    });
  } else {
    response.status(400).send({error: `id "${data.id}" is require!!!`});
  }
});

app.post('/articles', (request, response) => {
  const data = request.query;

  if (data.title && data.body) {
    if (data.id) {
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

        db.query('SELECT * FROM articles WHERE id = ?',
            [data.id], (err, rows, fields) =>{
              if (err) {
                response.status(400).send(err);
              } else {
                if (rows[0].user_id === decoded.id) {
                  db.query(`UPDATE articles 
                            SET title = ?, body = ?, updated_date = ? 
                            WHERE id = ?`,
                  [data.title, data.body, new Date(), data.id],
                  (err, rows, fields) => {
                    if (err) {
                      response
                          .status(400)
                          .send({error: 'Unable to update article ' + err});
                    } else {
                      if (rows.length === 0) {
                        response.status(400)
                            .send({error: `Id: "${data.id}" not found`});
                      } else {
                        console.log(data.id);

                        response.send({status: 'OK'});
                      }
                    }
                  });
                } else {
                  response.status(400)
                      .send({
                        error: `User doesn't have permissions 
                        to edit this articles!`,
                      });
                }
              }
            });
      });
    } else {
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

        db.query(`INSERT INTO articles VALUES(?, ?, ?, ?, ?, ?)`,
            [null, data.title, data.body, new Date(), new Date, decoded.id],
            (err, rows, fields) => {
              if (err) {
                response
                    .status(400)
                    .send({error: 'Unable to save new article' + err});
              } else {
                response.send({status: 'OK'});
              }
            });
      });
    }
  } else {
    response.status(400).send({error: 'title and body are required fields'});
  }
});
