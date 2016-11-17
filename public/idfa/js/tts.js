function once(func) {
    var run = false;
    return function() {
        if(!run) {
            run = true;
            func();
        }
    }
}

var Speech = (function() {
	var voices;
	var speaking = false;
	return {
		speak: function(settings) {
			if(settings.text == undefined) {
				return;
			}
			// bug: sometimes speechSynthesis gets stuck speaking
			// if you call cancel(), you can restart it
			if(speechSynthesis.speaking) {
				speechSynthesis.cancel();
			}
			var msg = new SpeechSynthesisUtterance(settings.text);
			msg.onstart = function() {
				// console.log('onstart');
				if(settings.onstart) {
					settings.onstart();
				}
			}
			var endOnce = once(function() {
				// console.log('onend');
				if(settings.onend) {
					// bug: if you try to talk right after speaking,
					// the tts engine isn't ready yet. timeout fixes it.
					setTimeout(settings.onend, 0);
				}
			});
			msg.onend = endOnce;
			var speakOnce = once(function() {
				// console.log('speak');
				// wait to assign the voice until it's ready
				if(settings.voice) {
					msg.voice = _.find(voices, {name: settings.voice});
				}
				speechSynthesis.speak(msg);
			});
			// bug: if you try to talk before onvoiceschanged
			// the tts engine can crash
			speechSynthesis.onvoiceschanged = function() {
				// console.log('onvoiceschanged');
				voices = speechSynthesis.getVoices();
				setTimeout(speakOnce, 0);
			}
			// bug: voices don't load themselves
			speechSynthesis.getVoices();
			if(voices) {
				speakOnce();
			}
			// bug: tts engine doesn't always report that it has ended
			// this puts a max time of 10s on any tts
			var maxLength = settings.maxLength || 10000;
			setTimeout(function() {
				endOnce();
			}, maxLength);
		},
		cancel: function() {
			speechSynthesis.cancel();
		}
	}
})();

function whisper(text, cb) {
	Speech.speak({
		text: text,
		voice: "Whisper",
		onend: cb
	})
}