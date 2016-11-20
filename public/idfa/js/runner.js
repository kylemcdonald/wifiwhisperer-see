var minLoopDelay = 250;
var maxLoopDelay = 1500;
var wordDelay = 85;
var characterDelay = 50;

var maxOldImages = 100;
var maxNewImages = 40;

var running = false;

var oldImages = [];
var newImages = [];

$.getJSON('../all.json?limit=' + maxOldImages, (data) => {
	oldImages = oldImages.concat(data);
})

$(document).keypress(function(e) {
  if(e.key == 'q') {
    toggleCredits();
  }
});

function toggleCredits() {
	if(running) {
		running = false;
        $('#credits').fadeIn();
	} else {
		running = true;
        $('#credits').fadeOut();
	}
}

function animateText(element, text) {
	var tokens = text.split(' ');
	var complete = '';
	var length = 0;
	$('#cur-text').text('');
	tokens.forEach(function (token) {
		setTimeout(function () {
			complete += token + ' ';
			$('#cur-text').text(complete);		
		}, length+0);
		length += wordDelay + characterDelay * token.length;
	})
}

function limit(arr, n) {
	if(arr.length > n) {
		return arr.slice(arr.length - n);
	} else {
		return arr;
	}
}

function step() {
	var cur;
	// if new images are available
	if(newImages.length > 0) {
		// sort them by their timestamp
		newImages = _.sortBy(newImages, 'timestamp');
		// and pick the most recent, removing it from new images
		cur = newImages.pop();
		// and adding it to old images
		oldImages.push(cur);
	} else {
		// otherwise pick an old image at random
		cur = _.sample(oldImages);
	}
	newImages = limit(newImages, maxNewImages);
	oldImages = limit(oldImages, maxOldImages);

	$('#img-container').css('background-image', 'url(' + cur.url + ')');
    var text = 'I see ' + cur.text + '.';
	animateText('#cur-text', text);
	whisper(text, () => {
		// succesfully spoke text, go to next loop
	    var loopDelay = _.random(minLoopDelay, maxLoopDelay);
		setTimeout(loop, loopDelay);
	});
}

function loop() {
	$.getJSON('../recent.json', (data) => {
		data = _.sortBy(data, 'timestamp');

		var allImages = oldImages.concat(newImages);
		data.forEach((cur) => {
			if(!_.find(allImages, {'url': cur.url, 'timestamp': cur.timestamp})) {
				// console.log('Adding to newImages: ' + cur.url + ' at ' + cur.timestamp);
				newImages.push(cur);
			}
		});

		var opacity = 0;
		var total = 10;
		var carousel = data.reverse().slice(0, total).reverse().map(cur => {
			opacity += (1. / total);
			var html = '<div style="opacity: ' + opacity + ';background-image:url(\'' + cur.url + '\')"></div>';
			return html;
		}).join('');
		$('#header-recent').html(carousel);
		if(running) {
			step();
		} else {
			// not running right now, go to next loop
	        setTimeout(loop, minLoopDelay);
	    }
	}).fail(() => {
		// error getting data, do a step anyway
		step();
	});
}

// still possible for this to be called twice (race condition)
setTimeout(function () {
	if(!running) {
		running = true;
		loop();
	}
}, 1000);
