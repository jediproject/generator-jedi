var express = require('express');
var app = express();
var generator = require('./routes/generator');
var bodyParser = require('body-parser');


app.use(bodyParser.urlencoded({ extended: true }))
// parse application/json
app.use(bodyParser.json())



app.configure(function () {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
});



app.post('/api/v1/generator/bootstrap', generator.bootstrap);
app.post('/api/v1/generator/controller', generator.controller);
app.post('/api/v1/generator/modal', generator.modal);
app.post('/api/v1/generator/module', generator.module);
app.post('/api/v1/generator/feature', generator.feature);


app.listen(4000);
console.log('Listening on port 4000...');