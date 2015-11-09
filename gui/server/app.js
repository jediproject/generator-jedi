/**
 * Main application file
 */

'use strict';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var generator = require('./controller/generator');


app.set('port', (process.env.PORT || 8080));


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/../client')); 

require('./routes')(app);

// Start server
app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});