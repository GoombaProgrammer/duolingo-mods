// ==UserScript==
// @name Duolingo voor Quallees (Qualleish)
// @namespace duoqualleish
// @description Een script dat Duolingo Engels naar Quallees vertaalt, zo dat je duolingo kan gebruiken om Quallees te leren.
// @version 1
// @grant none
// @match https://*.duolingo.com/*
// ==/UserScript==

// VERY BAD CODE AHEAD, I DON'T SPEAK JAVASCRIPT
// I use a bad API to translate the words, it uses a nmt model in the backend, if it errors it just puts the english word back
// so if you get the english sentence back, it's because my server errors :smile:

function disableAudio() {
    window.Audio.prototype.play = function() {
        return;
    };
}

var spans = [];
function joinSpans() {
    // Select all single letter spans
    var singleLetterSpans = document.querySelectorAll('span');
    spans = singleLetterSpans;

    // Initialize variables to store the current span and its text
    var currentSpan = null;
    var currentText = '';

    // Loop through each span
    for (var i = 0; i < singleLetterSpans.length; i++) {
        var span = singleLetterSpans[i];

        // Check if the span contains a single letter
        if (span.innerText.length === 1) {
            // If it's the first single letter span encountered or it's consecutive to the previous one
            if (!currentSpan || span.previousElementSibling === currentSpan) {
                currentSpan = span;
                currentText += span.innerText;
            } else {
                // If it's not consecutive, create a new span with the accumulated text
                var newSpan = document.createElement('span');
                newSpan.innerText = currentText;
                currentSpan.parentNode.insertBefore(newSpan, currentSpan);

                // Remove the old individual single letter spans
                currentSpan.remove();

                // Reset variables for the next sequence of single letter spans
                currentSpan = span;
                currentText = span.innerText;
            }
        } else {
            // If the span contains more than one letter, create a new span for it
            if (currentSpan) {
                var newSpan = document.createElement('span');
                newSpan.innerText = currentText;
                currentSpan.parentNode.insertBefore(newSpan, currentSpan);
                currentSpan.remove();
                currentSpan = null;
                currentText = '';
            }
        }
    }
    // If there's a remaining single letter span at the end, create a new span for it
    if (currentSpan) {
        var newSpan = document.createElement('span');
        newSpan.innerText = currentText;
        currentSpan.parentNode.insertBefore(newSpan, currentSpan);
        currentSpan.remove();
    }
    // Remove the original single letter spans
    for (var i = 0; i < singleLetterSpans.length; i++) {
        if (singleLetterSpans[i].innerText.length === 1) {
            singleLetterSpans[i].remove();
        }
    }
}

// Join single letter spans in parent span with lang="en"
function joinSpansInParentLangEn() {
     // Select the parent span with lang="en"
     var parentSpan = document.querySelector('span[lang="en"]');

     if (parentSpan) {
         // Select all single letter spans within the parent span
         var singleLetterSpans = parentSpan.querySelectorAll('span');

         // Initialize variables to store the current span and its text
         var currentSpan = null;
         var currentText = '';

         // Loop through each span within the parent span
         for (var i = 0; i < singleLetterSpans.length; i++) {
             var span = singleLetterSpans[i];

             // Check if the span contains a single letter
             if (span.innerText.length === 1) {
                 // If it's the first single letter span encountered or it's consecutive to the previous one
                 if (!currentSpan || span.previousElementSibling === currentSpan) {
                     currentSpan = span;
                     currentText += span.innerText;
                 } else {
                     // If it's not consecutive, create a new span with the accumulated text
                     var newSpan = document.createElement('span');
                     newSpan.innerText = currentText;
                     currentSpan.parentNode.insertBefore(newSpan, currentSpan);

                     // Remove the old individual single letter spans
                     currentSpan.remove();

                     // Reset variables for the next sequence of single letter spans
                     currentSpan = span;
                     currentText = span.innerText;
                 }
             } else {
                 // If the span contains more than one letter, create a new span for it
                 if (currentSpan) {
                     var newSpan = document.createElement('span');
                     newSpan.innerText = currentText;
                     currentSpan.parentNode.insertBefore(newSpan, currentSpan);
                     currentSpan.remove();
                     currentSpan = null;
                     currentText = '';
                 }
             }
         }
         // If there's a remaining single letter span at the end, create a new span for it
         if (currentSpan) {
             var newSpan = document.createElement('span');
             newSpan.innerText = currentText;
             currentSpan.parentNode.insertBefore(newSpan, currentSpan);
             currentSpan.remove();
         }
     }
}

function translate_to_qualleish(sentence) {
    // blocking requests to the server
    var url = "http://localhost/?q=" + sentence; // change this to the qualleish api
    var xhr = new XMLHttpRequest();
    xhr.open("GET", url, false);
    xhr.send();
    return xhr.responseText;
}

oldHref = '';
spanCount = 0;

(function() {
    'use strict';
    setInterval(function() {
    if (window.location.href === oldHref) {
        return;
    }
    // Check if the number of <span> elements has changed
    spanCount = spans.length;
    oldHref = window.location.href;
    disableAudio(); // This is because I am too lazy to translate the audio files (I don't know how to do it either lmao)
    // Zijn we op de juiste pagina?
    if (window.location.href.indexOf("/welcome") != -1) {
        joinSpans();
        setInterval(function() {
            // for each span element that has a single letter, join them together if they are next to each other
            // like: <span>a</span><span>b</span><span>c</span> -> <span>abc</span>

            // Replace spans with "Engels" with "Quallees"
            var spans = document.querySelectorAll('span');
            for (var i = 0; i < spans.length; i++) {
                spans[i].innerText = spans[i].innerText.replace("Engels", "Quallees");
            }
        }, 1000);
    }

    // learn page
    if (window.location.href.indexOf("/lesson") != -1) {
        setInterval(function() {
            if (window.location.href.indexOf("/lesson") != -1) {
                joinSpans();
            }
        }, 5);
        // Check for words in a image-select exercise (<span style="font-size: 17px;">word</span>)
        setInterval(function() {
            if (window.location.href.indexOf("/lesson") != -1) {
                for (var i = 0; i < spans.length; i++) {
                    if ((spans[i].style.fontSize === '17px' || spans[i].attributes['data-test'] &&
                        (spans[i].attributes['data-test'].value === 'challenge-judge-text')) &&
                        spans[i].style.fontSize !== '18px') {
                        // Translate the word to Qualleish
                        spans[i].innerText = translate_to_qualleish(spans[i].innerText);

                        // Increase the font size to make the Qualleish text more readable
                        spans[i].style.fontSize = '18px';
                    }
                }
                // questionSpan is the first child in class hSdm1
                var questionSpan = document.querySelector('.hSdm1 span');
                if (questionSpan && !questionSpan.attributes['translated']) {
                    // Translate the question to Qualleish
                    questionSpan.innerText = translate_to_qualleish(questionSpan.innerText);
                    questionSpan.attributes['translated'] = true;
                }
                // Find "Schrijf dit in het Engels" span and translate it to "Schrijf dit in het Qualleish"
                var found = false;
                for (var i = 0; i < spans.length; i++) {
                    if (spans[i].innerText === 'Schrijf dit in het Engels' || spans[i].innerText === 'Schrijf dit in het Qualleish') {
                        spans[i].innerText = 'Schrijf dit in het Qualleish';
                        found = true;
                    }
                }

                // If the translation was found, translate data-test="challenge-tap-token-text"
                if (found) {
                    for (var i = 0; i < spans.length; i++) {
                        if (spans[i].attributes['data-test'] && spans[i].attributes['data-test'].value === 'challenge-tap-token-text' && !spans[i].attributes['translated']) {
                            spans[i].innerText = translate_to_qualleish(spans[i].innerText);
                            spans[i].attributes['translated'] = true;
                        }
                    }
                }
            }
        }, 10);
    }
    }, 1000);
}
)();
