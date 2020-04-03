const express = require('express');
const cors = require('cors');
// cors - дає можливість підключатись іншим серверам до мене.Т
// обто до моєї ІР адреси, під моєю адресою мається на увазі
// мій locsalhost тобто порт, під яким запускається сервер.
// Він допомагає об'єднати бек і фронт разом. React and JS.
// Бо по суті ми їх запускаємо на різних серверах.

//  Щоб підключити список залежностей ми пишемо: npm install exspress.
// It add exspress in list dependencies package.json

app = express();
app.use(cors());
app.use(express.json());

require('./db/db');

require('./routes/auth/auth');
require('./routes/articles');
require('./routes/comments');


app.listen(3000, '127.0.0.1', function() {
  console.log('Server started on host: localhost, port: 3000');
});
