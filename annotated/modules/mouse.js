$P.mouse = {
    left: false,
    middle: false,
    right: false,
    pos: new $P.Coord(0, 0)
}

window.addEventListener("mousedown",
    function(e) {
        switch (e.button) {
            case 0:
                $P.mouse.left = true;
                break;
            case 1:
                $P.mouse.middle = true;
                break;
            case 2:
                $P.mouse.right = true;
                break;
        }
    },
false);

window.addEventListener("mouseup",
    function(e) {
        switch (e.button) {
            case 0:
                $P.mouse.left = false;
                break;
            case 1:
                $P.mouse.middle = false;
                break;
            case 2:
                $P.mouse.right = false;
                break;
        }
    },
false);

window.addEventListener("mousemove",
    function(e) {
        $P.mouse.pos.x = e.clientX;
        $P.mouse.pos.y = e.clientY;
    },
false);