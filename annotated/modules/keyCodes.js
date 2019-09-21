$P.keyCodes = []; //Declare keyCodes array

window.addEventListener("keydown",
    function(e) {
        $P.keyCodes[e.keyCode] = true; //Add a key to the array with the value of true when that key is pressed
    },
false);

window.addEventListener('keyup',
    function(e) {
        $P.keyCodes[e.keyCode] = false; //Set a key to false when that key is released
    },
false);