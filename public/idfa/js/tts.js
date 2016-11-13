var whisperVoice;

window.speechSynthesis.onvoiceschanged = function() {
	var voices = window.speechSynthesis.getVoices();
	whisperVoice = _.find(voices, _.matchesProperty('name', 'Whisper'));
}

function whisper(text, cb) {
	var msg = new SpeechSynthesisUtterance(text);
	msg.voice = whisperVoice;
	if (cb) {
		msg.onend = cb;
	}
	window.speechSynthesis.speak(msg);
}

function speak() {
	whisper('A man in a suit and tie.', function () {
		console.log('done');
	});
}