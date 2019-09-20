$P.mouse = { //Declare the mouse object
    left: false, //State of left mouse button
    middle: false, //State of middle mouse button
    right: false, //State of right mouse button
    pos: new $P.Coord(0, 0) //Mouse position Coord
}

window.addEventListener("mousedown",
    function(e) { //Change values of left, middle, and right when mouse button is pressed
        switch (e.button) { //Test for button type
            case 0:
                mouse.left = true;
                break;
            case 1:
                mouse.middle = true;
                break;
            case 2:
                mouse.right = true;
                break;
        }
    },
false);

window.addEventListener("mouseup",
    function(e) { //Change values of left, middle, and right when mouse button is pressed
        switch (e.button) { //Test for button type
            case 0:
                mouse.left = false;
                break;
            case 1:
                mouse.middle = false;
                break;
            case 2:
                mouse.right = false;
                break;
        }
    },
false);

window.addEventListener("mousemove",
    function(e) { //Change mouse position when mouse is moved
        mouse.pos.x = e.clientX;
        mouse.pos.y = e.clientY;
    },
false);