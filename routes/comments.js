const tokenUtils = require('./auth/token-utils');
const commentsDac = require('../dac/comments');

app.get('/comments', (request, response) => {
  tokenUtils.getDecodedToken(request)
      .then((decoded) => commentsDac.getAllComments()
          .then((commentsStatus) => response.send(commentsStatus)))
      .catch((err) => response.status(err.status).send(err.message));
});


app.post('/comments', (request, response) => {
  const data = request.query;

  if (data.description && data.article_id) {
    if (data.id) {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => commentsDac.updateComments(
              data.id, decoded.id, data.description)
              .then((commentsStatus) => response.send(commentsStatus)))
          .catch((err) => response.status(err.status).send(err.message));
    } else {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => commentsDac.insertComments(
              data.description, data.article_id, decoded.id)
              .then((commentsStatus) => response.send(commentsStatus)))
          .catch((err) => response.status(err.status).send(err.message));
    }
  } else {
    response.status(400).send({error: 'description and article_id are required fields'});
  }
});


app.delete('/comments', (request, response) => {
  const data = request.query;
  if (data.id) {
    tokenUtils.getDecodedToken(request)
        .then((decoded) => commentsDac.deleteComments(data.id, decoded.id)
            .then((commentsStatus) => response.send(commentsStatus)))
        .catch((err) => response.status(err.status).send(err.message));
  } else {
    response.status(400).send({status: 'not found '});
  }
});
