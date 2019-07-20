const express = require('express');
const http = require('http');

var jean = require('./server/jean/jean-core');
var jeanApi = require('./server/jean/jean-api');
var jeanBot = require('./server/jean/jean-bot');

const app = express();

app.use('/jpi', jeanApi);

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