var loopDelay = 1000;
var wordDelay = 85;
var characterDelay = 50;

var running = false;
var whisperVoice;

window.speechSynthesis.onvoiceschanged = () => {
	var voices = window.speechSynthesis.getVoices();
	whisperVoice = _.find(voices, _.matchesProperty('name', 'Whisper'));
}

function whisper(text, cb) {
	text = "I see " + text;
	var msg = new SpeechSynthesisUtterance(text);
	msg.voice = whisperVoice;
	if (cb) {
		msg.onend = cb;
	}
	window.speechSynthesis.speak(msg);
}

function togglePlay() {
	if(running) {
		running = false;
	} else {
		running = true;
		loop();
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

function loop() {
	// this will need to be changed from .. to .
	$.getJSON('../recent.json', (data) => {
		if(running) {
			console.log(data);
			$('#cur-url').attr('src', data.url);
			animateText('#cur-text', data.text);
			whisper(data.text, () => {
				setTimeout(loop, loopDelay);
			});
		}
	});
}