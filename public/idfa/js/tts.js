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

function load() {
	// this will need to be changed from .. to .
	$.getJSON('../recent.json', (data) => {
		console.log(data);
		$('#cur-url').attr('src', data.url);
		$('#cur-text').text(data.text);
		whisper(data.text, () => {
			console.log('done speaking');
		});
	});
}