let express = require('express');
let app = express();
let cookieParser = require('cookie-parser');
let apiController = require('./controllers/apiController');
let port =  process.env.PORT || 4040;

app.use('/', express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

apiController(app);

app.listen(port);
console.log('Server is running at ' + port + '...');
