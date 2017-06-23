var express = require('express');
var app = express();
var url = require("url");
var path = require("path");
var logger = require('./lib/bunyanLogger.js').logger();
var router = require('./router')(logger);
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

app.use('/', router);

var server = app.listen(process.env.PORT || 3456, function () {
    var host = server.address().address;
    var port = server.address().port;
    var para = server.address().family;
    console.log("address http://%s:%s", host, port)
})
