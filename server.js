var express = require('express');
var path = require('path');

var app = express();
app.use(express.static(path.join(__dirname, '')));

app.listen(8080);
console.log('server start at: 127.0.0.1:8080');

app.get('*', function(req, res){
  res.sendFile('index.html', { root: path.join(__dirname, '') });
})
