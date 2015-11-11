/**
 * Main application routes
 */

'use strict';

var generator = require('./controller/generator');

module.exports = function(app) {

// Insert routes below
app.post('/api/v1/generator/bootstrap', generator.bootstrap);
app.post('/api/v1/generator/controller', generator.controller);
app.post('/api/v1/generator/modal', generator.modal);
app.post('/api/v1/generator/module', generator.module);
app.post('/api/v1/generator/feature', generator.feature);
app.post('/api/v1/generator/commandline', generator.commandline);

};
