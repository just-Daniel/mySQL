const jwt = require('jsonwebtoken');
const config = require('../token-config.js');

app.get('/comments', (request, response) => {
  const data = request.query;
  if (data.article_id) {
    db.query(`SELECT * FROM comments WHERE article_id = ?`,
        [data.article_id], (err, rows, fields) => {
          if (err) {
            response.status(400).send(err.message);
          } else {
            response.send(rows);
          }
        });
  } else {
    db.query(
        `SELECT * FROM comments`,
        [], (err, rows, fields) => {
          if (err) {
            response.status(400).send(err);
          } else {
            response.send(rows);
          }
        });
  }
});


app.post('/comments', (request, response) => {
  const data = request.query;

  if (data.description) {
    if (data.id) {
      const token = data.access_token;

      if (!token) {
        response.status(401).send({auth: false, message: `No token provided`});
      }

      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          return response.status(500)
              .send({auth: false, message: `Failed to authenticate token`});
        }

        db.query('SELECT * FROM comments WHERE id = ?', [data.id],
            (err, rows, fields) => {
              if (err) {
                response.status(400).send(err);
              } else {
                if (rows[0].user_id === decoded.id) {
                  db.query(
                      `UPDATE comments 
                      SET description = ?, updated_date = ? 
                      WHERE id = ?`,
                      [data.description,
                        new Date(), data.id],
                      (err, rows, fields) => {
                        if (err) {
                          response.status(404).send(err);
                        } else {
                          response.send({status: 'OK!'});
                        }
                      });
                } else {
                  response.status(400).send({
                    error:
                    `User doesn't have permissions to update this comments!`,
                  });
                }
              }
            });
      });
    } else {
      const token = data.access_token;

      if (!token) {
        response.status(401).send({auth: false, message: 'No token provided.'});
      }

      jwt.verify(token, config.secret, (err, decoded) => {
        if (err) {
          response.status(500)
              .send({auth: false, message: 'Failed to authenticate token.'});
        }

        db.query(`INSERT INTO comments VALUES (?, ?, ?, ?, ?, ?)`,
            [null, data.description, data.article_id,
              new Date(), new Date(), decoded.id],
            (err, rows, fields) => {
              if (err) {
                response.status(400)
                    .send({error: 'Unable to save new comment' + err});
              } else {
                response.send({status: 'OK'});
              }
            });
      });
    }
  } else {
    response.status(400).send({error: 'description is required'});
  }
});


app.delete('/comments', (request, response) => {
  const data = request.query;
  console.log(data.id);
  if (data.id) {
    const token = data.access_token;

    if (!token) {
      response.status(401).send({auth: false, message: 'No token provided.'});
    }

    jwt.verify(token, config.secret, (err, decoded) => {
      if (err) {
        response.status(500)
            .send({auth: false, message: 'Failed to authenticate token.'});
      }

      db.query('SELECT * FROM comments WHERE id = ?', [data.id],
          (err, rows, fields) => {
            console.log('CHECK ', data.id, rows);
            if (err) {
              response.status(400).send(err);
            } else {
              if (rows[0].user_id === decoded.id) {
                db.query(`DELETE FROM comments WHERE id = ?`,
                    [data.id], (err, rows, fields) => {
                      if (err) {
                        response.status(404)
                            .send({error: `Unable to deleted comment` + err});
                      } else {
                        response.send({status: 'OK'});
                      }
                    });
              } else {
                response.status(400).send({
                  error:
                  `User doesn't have permissions to delete this comments!`,
                });
              }
            }
          });
    });
  } else {
    response.status(400).send({status: 'not found '});
  }
});
