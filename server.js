const express = require('express');
const app = express();

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');

app.get('/', (request, response) => {
	response.render('index');
});

const sheetId = "1mS2IErB6iTd7ZGCKKJHh-bEO0r9H3AaJpMnNcVYWkGE";
const gsheetsReader = require('g-sheets-api');
app.get('/gsheets', (request, response) => {
	gsheetsReader({ sheetId: sheetId }, results => {
		response.send(results)
	}, error => {
		console.log(error);
		response.send([]);
	});
});

app.listen(4000, () => {
	console.log('Started node app server: http://localhost:4000');
})
