var minLoopDelay = 250;
var maxLoopDelay = 1500;
var wordDelay = 85;
var characterDelay = 50;

var maxOldImages = 40;
var maxNewImages = 40; // this should be smaller

var running = false;

var oldImages = [];
var newImages = [];

$.getJSON('data/cache.json', (data) => {
	newImages = newImages.concat(data);
})

$(document).keypress(function(e) {
  if(e.key == "0") {
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

function loop() {
    var loopDelay = _.random(minLoopDelay, maxLoopDelay);
	// $.getJSON('../recent.json', (data) => {
	// console.log(data);
	if(running) {
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
        var text = "I see " + cur.text + ".";
		animateText('#cur-text', text);
		whisper(text, () => {
			setTimeout(loop, loopDelay);
		});
	} else {
        setTimeout(loop, loopDelay);
    }
	// });
}

// still possible for this to be called twice (race condition)
setTimeout(function () {
	if(!running) {
		running = true;
		loop();
	}
}, 1000);
