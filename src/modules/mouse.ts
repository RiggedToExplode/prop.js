///<reference path="../declarations/glob.d.ts" />

namespace $P {
    export var Mouse: {
        left: boolean,
        middle: boolean,
        right: boolean,
        pos: Coord,
        relPos(cam: Camera): Pair,
        relX(cam: Camera): number,
        relY(cam: Camera): number,
        init: Function
    } = { //Declare the mouse object
        left: false, //State of left mouse button
        middle: false, //State of middle mouse button
        right: false, //State of right mouse button
        pos: undefined, //Mouse position Coord
        relX: function(cam: Camera): number { //Get mouse X position in Stage as drawn by cam
            let canvasBounds = cam.canvas.el.getBoundingClientRect();

            return (this.pos.x - canvasBounds.left - cam.canvasPos.x - cam.dimensions.x / 2) / cam.scale.x + cam.stagePos.x;
        },
        relY: function(cam: Camera): number { //Get mouse Y position in Stage as drawn by cam
            let canvasBounds = cam.canvas.el.getBoundingClientRect();

            return -(this.pos.y - canvasBounds.top - (cam.canvas.height - cam.canvasPos.y - cam.dimensions.y) - cam.dimensions.y / 2) / cam.scale.y + cam.stagePos.y;
        },
        relPos: function(cam: Camera): Pair {
            return new Pair(this.relX(cam), this.relY(cam));
        },
        init: function() {
            this.pos = new Coord(0, 0);

            window.addEventListener("mousedown",
                function(e) { //Change values of left, middle, and right when mouse button is pressed
                    switch (e.button) { //Test for button type
                        case 0:
                            $P.Mouse.left = true;
                            break;
                        case 1:
                            $P.Mouse.middle = true;
                            break;
                        case 2:
                            $P.Mouse.right = true;
                            break;
                    }
                },
            false);

            window.addEventListener("mouseup",
                function(e) { //Change values of left, middle, and right when mouse button is pressed
                    switch (e.button) { //Test for button type
                        case 0:
                            $P.Mouse.left = false;
                            break;
                        case 1:
                            $P.Mouse.middle = false;
                            break;
                        case 2:
                            $P.Mouse.right = false;
                            break;
                    }
                },
            false);

            window.addEventListener("mousemove",
                function(e) { //Change mouse position when mouse is moved
                    $P.Mouse.pos.x = e.clientX;
                    $P.Mouse.pos.y = e.clientY;
                },
            false);
        }
    }
}