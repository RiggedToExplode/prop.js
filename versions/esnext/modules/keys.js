///<reference path="../declarations/glob.d.ts" />
var $P;
(function ($P) {
    $P.keyCodes = []; //Declare and initialize the keyCodes array.
})($P || ($P = {}));
window.addEventListener("keydown", function (e) {
    $P.keyCodes[e.keyCode] = true; //Add a key to the array with the value of true when that key is pressed
}, false);
window.addEventListener('keyup', function (e) {
    $P.keyCodes[e.keyCode] = false; //Set a key to false when that key is released
}, false);
