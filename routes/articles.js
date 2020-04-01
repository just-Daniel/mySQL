const tokenUtils = require('./auth/token-utils');

app.get('/articles', (request, response) => {
  db.query('SELECT * FROM articles', (err, rows, fields) => {
    if (err) {
      response.status(400).send(err);
    } else {
      response.send(rows);
    }
  });
});

app.post('/articles', (request, response) => {
  const data = request.query;

  if (data.title && data.body) {
    if (data.id) {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => {
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
                          response.status(400)
                              .send({error: 'Unable to update article ' + err});
                        } else {
                          if (rows.length === 0) {
                            response.status(400)
                                .send({error: `Id: "${data.id}" not found`});
                          } else {
                            response.send({status: 'OK'});
                          }
                        }
                      });
                    } else {
                      response.status(400).send({
                        error: `User doesn't have permissions to edit this articles!`,
                      });
                    }
                  }
                });
          })
          .catch((err) => response.status(err.status).send(err.message));
    } else {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => {
            db.query(`INSERT INTO articles VALUES(?, ?, ?, ?, ?, ?)`,
                [null, data.title, data.body, new Date(), new Date, decoded.id],
                (err, rows, fields) => {
                  if (err) {
                    response.status(400)
                        .send({error: 'Unable to save new article' + err});
                  } else {
                    response.send({status: 'OK'});
                  }
                });
          })
          .catch((err) => response.status(err.status).send(err.message));
    }
  } else {
    response.status(400).send({error: 'title and body are required fields'});
  }
});


app.delete('/articles', (request, response) => {
  const data = request.query;
  if (data.id) {
    tokenUtils.getDecodedToken(request)
        .then((decoded) => {
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
                            response.status(400)
                                .send({error: 'Unable to delete article ' + err});
                          } else {
                            response.send({status: 'OK'});
                          }
                        });
                  } else {
                    response.status(400).send({
                      error: `User doesn't have permissions to delete this articles!`,
                    });
                  }
                }
              });
        })
        .catch((error) => response.status(error.status).send(error.message));
  } else {
    response.status(400).send({error: `id "${data.id}" is require!!!`});
  }
});
