const config = require('../token-config.js');
const jwt = require('jsonwebtoken');

app.get('/articles', (request, response) => {

  db.query('SELECT * FROM articles', (err, rows, fields) => {
    if (err) {
      response.status(400).send(err);
    }else{
      response.send(rows);
    }
  });
});

app.delete('/articles', (request, response) => {
 const data = request.query;
  if (data.id){
    db.query(`DELETE FROM articles WHERE id = ? AND user_id = ?`, 
            [data.id, data.user_id], (err, rows, fields) => {
      if (err) {
        response.status(400).send({error: 'Unable to delete article ' + err});
      }else {
        response.send({status: 'OK'});
      }
    });
  }else{
    response.status(400).send({error: `id "${data.id}" is require!!!`})
  }
});

app.post('/articles', (request, response) => {
 const data = request.query;
  if (data.title && data.body){
    console.log(data.id);
    
    if (data.id){
      db.query(`UPDATE articles SET title = ?, body = ?, updated_date = ? WHERE id = ? AND user_id = ?`,  
              [data.title, data.body, new Date(), data.id, data.user_id ], (err, rows, fields) => {  
                console.log(data.id);
        if (err) {
          response.status(400).send({error: 'Unable to update article ' + err});
        }else {
          if(rows.length === 0){
            response.status(400).send({ error: `Id: "${data.id}" not found` })
          }else{ 
            response.send({ status: 'OK' });
          }
        }
      });
    }else{
      db.query(`INSERT INTO articles VALUES(?, ?, ?, ?, ?, ?)`, 
              [null, data.title, data.body, new Date(), new Date, data.user_id], (err, rows, fields) => {
        if (err) {
          response.status(400).send({error: 'Unable to save new article' + err});
        }else {
          response.send({status: 'OK'});
        }
      });
    }
  }else{
    response.status(400).send({error: 'title and body are required fields'});
  }
});

