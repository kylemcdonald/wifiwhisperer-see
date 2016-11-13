var _ = require('lodash');
var http = require('http');
var express = require('express');
var app = express();

function getDescription(url, cb) {
	var postData = JSON.stringify({
	 	'url' : url
	});

	var options = {
		hostname: 'api.projectoxford.ai',
		port: 80,
		path: '/vision/v1.0/describe',
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Ocp-Apim-Subscription-Key': process.env.OCP_API_KEY
		}
	};

	var req = http.request(options, (res) => {
		if(res.statusCode == 200) {
			res.setEncoding('utf8');
			res.on('data', (chunk) => {
				var data = JSON.parse(chunk);
				console.log(data);
				cb(data.description.captions[0].text);
			});
		} else {
			cb();
		}
	});

	req.on('error', (e) => {
		console.log(e.message);
	});

	req.write(postData);
	req.end();
}

var recent = [];

app.use('/', express.static('public'));

app.get('/', (req, res) => {
	res.redirect('/moogfest');
});

app.get('/add', (req, res) => {
	res.end();	
	var img = req.query;
	img.timestamp = new Date().getTime();
	getDescription(img.url, (description) => {
		img.text = description;
		recent.push(img);
		console.log(img);
	})
});

app.get('/recent.json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	var sorted = _.sortBy(recent, 'timestamp');
	var last = sorted[sorted.length - 1];
	res.json(last);
});

var server = app.listen(process.env.PORT || 3000, () => {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});