const tokenUtils = require('./auth/token-utils');
const commentsDac = require('../dac/comments');

app.get('/comments', (request, response) => {
  commentsDac.getAllComments();
});


app.post('/comments', (request, response) => {
  const data = request.query;

  if (data.description) {
    if (data.id) {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => commentsDac.updateComments(
              data.id, decoded.id. data.description))
          .catch((err) => response.status(err.status).send(err.message));
    } else {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => {
            commentsDac.insertComments(data.description, decoded.id);
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
          commentsDac.deleteComments(data.id, decoded.id);
        })
        .catch((err) => response.status(err.status).send(err.message));
  } else {
    response.status(400).send({status: 'not found '});
  }
});
