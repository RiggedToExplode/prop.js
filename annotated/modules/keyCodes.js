$P.keyCodes = [];

window.addEventListener("keydown",
    function(e) {
        $P.keyCodes[e.keyCode] = true;
    },
false);

window.addEventListener('keyup',
    function(e) {
        $P.keyCodes[e.keyCode] = false;
    },
false);