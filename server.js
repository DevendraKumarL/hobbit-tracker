const express = require('express');
const app = express();
require('dotenv').config();

app.use(express.static(__dirname + '/public'));
app.use('/clrui', express.static(__dirname + '/node_modules/@clr/ui'));
app.use('/clricons', express.static(__dirname + '/node_modules/@clr/icons'));
app.use('/webcomponents', express.static(__dirname + '/node_modules/@webcomponents/custom-elements'));
app.use('/chartjs', express.static(__dirname + '/node_modules/chart.js/dist'));
app.use('/chartjsplugin', express.static(__dirname + '/node_modules/chartjs-plugin-datalabels/dist'));

app.set('view engine', 'ejs');

app.get('/', (request, response) => {
	response.render('index');
});

const sheetID = process.env.SHEET_ID;
const gsheetsReader = require('g-sheets-api');
app.get('/gsheets/:sheetNum', (request, response) => {
	gsheetsReader({ sheetId: sheetID, sheetNumber: request.params.sheetNum }, results => {
		response.send(results);
	}, error => {
		console.log(error);
		throw error;
	});
});

app.get('/noofsheets', (request, response) => {
	response.send({noOfSheets: process.env.NO_OF_SHEETS});
});

app.listen(4000, () => {
	console.log('Started node app server: http://localhost:4000');
})
