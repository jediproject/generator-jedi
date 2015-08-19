var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var generator = require('./server/controller/generator');


app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())



app.configure(function () {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});


app.use(express.static(__dirname + '/client')); 

app.post('/api/v1/generator/bootstrap', generator.bootstrap);
app.post('/api/v1/generator/controller', generator.controller);
app.post('/api/v1/generator/modal', generator.modal);
app.post('/api/v1/generator/module', generator.module);
app.post('/api/v1/generator/feature', generator.feature);


app.listen(8080);
console.log('Listening on port 8080...');