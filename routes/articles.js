const tokenUtils = require('./auth/token-utils');
const articlesDac = require('../dac/articles');

app.get('/articles', (request, response) => {
  tokenUtils.getDecodedToken(request)
      .then((decoded) => articlesDac.getAllArticles()
          .then((articlesStatus) => response.send(articlesStatus)))
      .catch((err) => response.status(err.status).send(err.message));
});

app.post('/articles', (request, response) => {
  const data = request.query;

  if (data.title && data.body) {
    if (data.id) {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => articlesDac.updateArticles(
              data.id, data.title, data.body, decoded.id)
              .then((articlesStatus) => response.send(articlesStatus)))
          .catch((err) => response.status(err.status).send(err.message));
    } else {
      tokenUtils.getDecodedToken(request)
          .then((decoded) => articlesDac.insertArticles(
              data.title, data.body, decoded.id)
              .then((articlesStatus) => response.send(articlesStatus)))
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
        .then((decoded) => articlesDac.deleteArticles(data.id, decoded.id)
            .then((deleteStatus) => response.send(deleteStatus)))
        .catch((error) => response.status(error.status).send(error.message));
  } else {
    response.status(400).send({error: `id "${data.id}" is require!!!`});
  }
});

