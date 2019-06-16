$P.keys = [];

window.addEventListener("keydown",
    function(e){
        $P.keys[e.keyCode] = true;
    },
false);

window.addEventListener('keyup',
    function(e){
        $P.keys[e.keyCode] = false;
    },
false);