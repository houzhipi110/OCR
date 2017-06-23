var express = require('express');
var app = express();
var fs = require("fs");
var url = require("url");
var path = require("path");

app.get('/blocks', function (req, res) {
  fs.readFile(__dirname + "/" + templatename, 'utf8', function (err, data) {
    console.log(data);
    res.end(data);
  });
})

var line = {
  "line3": {
    "topleft": "90,200",
    "lowerright": "1200,800",
    "cellwidth": 80,
    "cellheight": 80,
    "id": 3
  }
}

app.get('/addblock', function (req, res) {
  // read existing lines.
  fs.readFile(__dirname + "/" + templatename, 'utf8', function (err, data) {
    data = JSON.parse(data);
    data["block3"] = line["block3"];
    console.log(data);
    res.end(JSON.stringify(data));
  });
})

app.get('/:id', function (req, res) {
  // read existing lines.
  fs.readFile(__dirname + "/" + templatename, 'utf8', function (err, data) {
    data = JSON.parse(data);
    var user = data["block" + req.params.id];
    console.log(user);
    res.end(JSON.stringify(user));
  });
})

app.get('/deleteblock', function (req, res) {
  // First read existing users.
  fs.readFile(__dirname + "/" + templatename, 'utf8', function (err, data) {
    var id = req.params.id;
    data = JSON.parse(data);
    delete data["block" + id];
    console.log(data);
    res.end(JSON.stringify(data));
  });
})

function getMatchedTempalte(imgname) {
  var basename = path.basename(imgname);
  var extendname = path.extname(imgname);
  return path.basename(imgname, extendname) + ".json";
}


function startTemplateREST(imgname) {
  var templatename = getMatchedTempalte(imgname);
  var server = app.listen(8081, function () {
    var host = server.address().address;
    var port = server.address().port;
    var para = server.address().family;
    console.log("address http://%s:%s", host, port)
  })
}