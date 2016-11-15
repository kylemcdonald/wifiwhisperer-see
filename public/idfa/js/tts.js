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
	console.log("toggle play");
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

// function once(func) {
//     var run = false;
//     return function() {
//         if(!run) {
//             run = true;
//             func();
//         }
//     }
// }

// var Speech = (function() {
//   var voices;
//   var speaking = false;
//   return {
//     speak: function(settings) {
//       if(settings.text == undefined) {
//         return;
//       }
//       if(/[\u0370-\u03FF]{2}/.test(settings.text)) {
//         settings.voice = "Melina"; // use a greek voice for greek text
//       }
//       // bug: sometimes speechSynthesis gets stuck speaking
//       // if you call cancel(), you can restart it
//       if(speechSynthesis.speaking) {
//         speechSynthesis.cancel();
//       }
//       var msg = new SpeechSynthesisUtterance(settings.text);
//       msg.onstart = function() {
//         // console.log('onstart');
//         if(settings.onstart) {
//           settings.onstart();
//         }
//       }
//       var endOnce = once(function() {
//         // console.log('onend');
//         if(settings.onend) {
//           // bug: if you try to talk right after speaking,
//           // the tts engine isn't ready yet. timeout fixes it.
//           setTimeout(settings.onend, 0);
//         }
//       });
//       msg.onend = endOnce;
//       var speakOnce = once(function() {
//         // console.log('speak');
//         // wait to assign the voice until it's ready
//         if(settings.voice) {
//           msg.voice = _.findWhere(voices, {name: settings.voice});
//         }
//         speechSynthesis.speak(msg);
//       });
//       // bug: if you try to talk before onvoiceschanged
//       // the tts engine can crash
//       speechSynthesis.onvoiceschanged = function() {
//         // console.log('onvoiceschanged');
//         voices = speechSynthesis.getVoices();
//         setTimeout(speakOnce, 0);
//       }
//       // bug: voices don't load themselves
//       speechSynthesis.getVoices();
//       if(voices) {
//         speakOnce();
//       }
//       // bug: tts engine doesn't always report that it has ended
//       // this puts a max time of 10s on any tts
//       var maxLength = settings.maxLength || 10000;
//       setTimeout(function() {
//         endOnce();
//       }, maxLength);
//     },
//     cancel: function() {
//       speechSynthesis.cancel();
//     }
//   }
// })();