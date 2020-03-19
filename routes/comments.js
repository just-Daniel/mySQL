app.get('/comments', (request, response) => {
    if(request.query.article_id){ 
        db.query(`SELECT * FROM comments WHERE article_id = (?)`, 
                [request.query.article_id], (err, rows, fields) => {
            if(err){
                response.status(400).send(err.message);
            }else{
                response.send(rows);
            }
        })
    }else{
        db.query(      
            `SELECT * FROM comments`, 
            [], (err, rows, fields) => {
            if(err){
                response.status(400).send(err);
            }else{
                response.send(rows);
            }
        })
    }
});



app.post('/comments', (request, response) => {
    if(request.query.description){
        if(request.query.id){
           db.query(`UPDATE comments SET description = ?, article_id = ?, updated_date = ? WHERE id = ?`, 
                   [request.query.description, request.query.article_id, new Date(), request.query.id], (err, rows, fields) => {
                    if(err){
                        response.status(404).send({error: `id: ${request.query.id}, not found!` + err});
                    }else{
                        response.send({status: "OK!"})
                    }
                })
        }else{
             db.query(`INSERT INTO comments VALUES (?, ?, ?, ?, ?)`, 
                     [null, request.query.description, request.query.article_id, new Date(), new Date()], (err, rows, fields) => {
                if (err) {
                    response.status(400).send({error: 'Unable to save new comment' + err});
                }else {
                    response.send({status: 'OK'});
                }
            })
        }
    }else{
        response.status(400).send({error: "description is required"})
    }
})



app.delete('/comments', (request, response) => {
    if(request.query.id){
        db.query(`DELETE FROM comments WHERE id = (?)`, 
                [request.query.id], (err, rows, fields) => { 
            if(err){
                response.status(404).send({status: `article_id: "${request.query.id}" deleted!`  })
            }else{
                response.send({status: "OK"})
            }
        })
    }else{
        response.status(400).send({status: "not found "})
    }
})
