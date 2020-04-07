const ResponseError = require('../routes/auth/response-error');

const getAllComments = () => {
  const promise = new Promise((resolve, reject) => {
    db.query( `SELECT * FROM comments`, [], (err, rows, fields) => {
      if (err) {
        reject(new ResponseError(err, 400));
      } else {
        resolve(rows);
      }
    });
  });
  return promise;
};

const updateComments = (id, decodedId, description) => {
  const promise = new Promise((resolve, reject) => {
    db.query('SELECT * FROM comments WHERE id = ?', [id], (err, rows, fields) => {
      if (err) {
        reject(new ResponseError(err, 400));
      } else {
        if (rows[0].user_id === decodedId) {
          db.query(
              `UPDATE comments SET description = ?, updated_date = ? WHERE id = ?`,
              [description, new Date(), id], (err, rows, fields) => {
                if (err) {
                  reject(new ResponseError('Unable to update ' + err, 404));
                } else {
                  resolve({status: 'OK!'});
                }
              });
        } else {
          reject(new ResponseError(
              'User doesn\'t have permissions to update this comments! '+ err, 400,
          ));
        }
      }
    });
  });
  return promise;
};

const insertComments = (description, article_id, decodedId) => {
  const promise = new Promise((resolve, reject) => {
    db.query(`INSERT INTO comments VALUES (?, ?, ?, ?, ?, ?)`,
        [null, description, article_id, new Date(), new Date(), decodedId],
        (err, rows, fields) => {
          if (err) {
            reject(new ResponseError('Unable to save new comment ' + err, 400));
          } else {
            resolve({status: 'OK'});
          }
        });
  });
  return promise;
};

const deleteComments = (id, decodedId) => {
  const promise = new Promise((resolve, reject) => {
    db.query('SELECT * FROM comments WHERE id = ?', [id],
        (err, rows, fields) => {
          if (err) {
            reject(new ResponseError(err, 400));
          } else {
            if (rows[0].user_id === decodedId) {
              db.query(`DELETE FROM comments WHERE id = ?`,
                  [id], (err, rows, fields) => {
                    if (err) {
                      reject(new ResponseError(`Unable to deleted comment ` + err, 404));
                    } else {
                      resolve({status: 'OK'});
                    }
                  });
            } else {
              reject(new ResponseError(
                  `User doesn't have permissions to delete this comments! ` + err, 400));
            }
          }
        });
  });
  return promise;
};


module.exports.getAllComments = getAllComments;
module.exports.updateComments = updateComments;
module.exports.insertComments = insertComments;
module.exports.deleteComments = deleteComments;
