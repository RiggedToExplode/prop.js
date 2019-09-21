$P.mouse = { //Declare the mouse object
    left: false, //State of left mouse button
    middle: false, //State of middle mouse button
    right: false, //State of right mouse button
    pos: new $P.Coord(0, 0), //Mouse position Coord
    relPos: function(cam) { //Inefficient(?) method to get position of mouse in stage relative to cam (Camera)
        let canvasBounds = cam.canvas.el.getBoundingClientRect();

        return new $P.Coord(cam.scale.x * (this.pos.x - canvasBounds.left - cam.canvasPos.x) + cam.stagePos.x, cam.scale.y * (this.pos.y - canvasBounds.top - cam.canvasPos.y) + cam.stagePos.y);
    }
}

window.addEventListener("mousedown",
    function(e) { //Change values of left, middle, and right when mouse button is pressed
        switch (e.button) { //Test for button type
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
    function(e) { //Change values of left, middle, and right when mouse button is pressed
        switch (e.button) { //Test for button type
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
    function(e) { //Change mouse position when mouse is moved
        $P.mouse.pos.x = e.clientX;
        $P.mouse.pos.y = e.clientY;
    },
false);