var _ = require('lodash');
var fs = require('fs');
var http = require('http');
var requestIp = require('request-ip');
var express = require('express');
var app = express();

var maxTimeSinceDup = 10000; // ms

var block = [
	'10.10.121.254'
];

var precaption = [];
var postcaption = [];

var rawdb = fs.readFileSync(process.env.DB_FILE, 'utf8');
rawdb.split(/\r?\n/).forEach((line) => {
	line = line.replace(/\r?\n/, '');
	if(line.length > 0) {
		try {
			var cur = JSON.parse(line);
			precaption.push(cur);
			postcaption.push(cur);
		} catch (e) {
			console.log("Error in database: " + line);
		}
	}
})
console.log("Loaded " + postcaption.length + " records.");

function getDescription(url, cb, err) {
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
				var caption = data.description.captions[0].text;
				if(typeof caption !== "undefined") {
					cb(caption);
				} else {
					console.log("Caption is undefined.");
				}
			});
		} else {
			err(res.statusCode);
		}
	});

	req.on('error', (e) => {
		err(e.message);
	});

	req.write(postData);
	req.end();
}

app.use(requestIp.mw());
app.use('/', express.static('public'));

app.get('/', (req, res) => {
	var idfaIp = '145.102.246.253';
	if(req.clientIp.indexOf(idfaIp) != -1) {
		res.redirect('/idfa');
	} else {
		res.redirect('/moogfest');
	}
});

app.get('/add', (req, res) => {
	res.end();

	var i = req.url.indexOf('?');
	var query = req.url.substr(i+1);
	var parts = query.split('|');
	var channel = parts[0];
	var url = parts.slice(1).join('|');

	console.log(query);
	var img = {
		timestamp: new Date().getTime(),
		channel: parseInt(channel),
		url: url
	}

	for(var i = 0; i < block.length; i++) {
		var curBlock = block[i];
		if(url.indexOf(curBlock) > -1) {
			console.log('Blocked: ' + curBlock);
			return;
		}
	}

	// need to check if the url is already present
	var dup;
	if(dup = _.findLast(precaption, {'url': url})) {
		var timeSinceDup = img.timestamp - dup.timestamp;
		if(timeSinceDup < maxTimeSinceDup) {
			console.log('Ignoring duplicate sniff ' + timeSinceDup + 'ms ago.');
		} else {
			console.log('Using caption from duplicate sniff ' + timeSinceDup + 'ms ago.');	
			img.text = dup.text;
			// add duplicate to the current state, but don't save to the log
			postcaption.push(img);
		}
		return;
	}
	precaption.push(img);
	
	getDescription(img.url, (description) => {
		img.text = description;
		postcaption.push(img);
		fs.appendFileSync(process.env.DB_FILE, JSON.stringify(img) + '\n');
		console.log(img);
	}, (err) => {
		console.log('Error: ' + err);
	});
});

app.get('/all.json', (req, res) => {
	res.setHeader('Content-Type', 'application/json');
	res.json(postcaption);
});

app.get('/recent.json', (req, res) => {
	var limit = req.query.limit || 10;

	res.setHeader('Content-Type', 'application/json');
	if(postcaption.length < 1) {
		res.json({});
		return;
	}
	var sorted = _.sortBy(postcaption, 'timestamp');
	var last = sorted.slice(-limit); // send 10 most recent
	res.json(last);
});

var server = app.listen(process.env.PORT || 3000, () => {
	var host = server.address().address;
	var port = server.address().port;
	console.log('Example app listening at http://%s:%s', host, port);
});