const express = require('express');
const http = require('http');

var jean = require('./jean/jean-core');
var jeanApi = require('./jean/jean-api');
var jeanBot = require('./jean/jean-bot');

const app = express();

app.use('/jean', jeanApi);

app.all('/*', (req, res) => {
  res.send("hej");
});

jean.init().then(() => {
	jeanBot.init();
});

const port = 3333;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
	console.log('Server started ' + new Date());
	console.log(`Port:${port}`);
});