const tokenUtils = require('./auth/token-utils');

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
      tokenUtils.getDecodedToken(request)
          .then((decoded) => {
            db.query('SELECT * FROM comments WHERE id = ?', [data.id],
                (err, rows, fields) => {
                  if (err) {
                    response.status(400).send(err);
                  } else {
                    if (rows[0].user_id === decoded.id) {
                      db.query(
                          `UPDATE comments SET description = ?, updated_date = ? 
                           WHERE id = ?`,
                          [data.description, new Date(), data.id],
                          (err, rows, fields) => {
                            if (err) {
                              response.status(404).send(err);
                            } else {
                              response.send({status: 'OK!'});
                            }
                          });
                    } else {
                      response.status(400).send({
                        error: `User doesn't have permissions to update this comments!`,
                      });
                    }
                  }
                });
          })
          .catch((err) => response.status(err.status).send(err.message));
    } else {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => {
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
          })
          .catch((err) => response.status(err.status).send(err.message));
    }
  } else {
    response.status(400).send({error: 'description is required'});
  }
});


app.delete('/comments', (request, response) => {
  const data = request.query;
  if (data.id) {
    tokenUtils.getDecodedToken(request)
        .then((decoded) => {
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
        })
        .catch((err) => response.status(err.status).send(err.message));
  } else {
    response.status(400).send({status: 'not found '});
  }
});
