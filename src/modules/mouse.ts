/// <reference path="../prop.ts" />

namespace $P {
    export var Mouse = { //Declare the mouse object
        left: false, //State of left mouse button
        middle: false, //State of middle mouse button
        right: false, //State of right mouse button
        pos: new $P.Coord(0, 0), //Mouse position Coord
        relPos: function(cam): $P.Coord { //Inefficient(?) method to get position of mouse in stage relative to cam (Camera)
            let canvasBounds = cam.canvas.el.getBoundingClientRect();
            
            return new $P.Coord(cam.scale.x * (this.pos.x - canvasBounds.left - cam.canvasPos.x) + cam.stagePos.x, cam.scale.y * (this.pos.y - canvasBounds.top - cam.canvasPos.y) + cam.stagePos.y);
        },
        relX: function(cam): number {
            let canvasBounds = cam.canvas.el.getBoundingClientRect();

            return cam.scale.x * (this.pos.x - canvasBounds.left - cam.canvasPos.x) + cam.stagePos.x;
        },
        relY: function(cam): number {
            let canvasBounds = cam.canvas.el.getBoundingClientRect();

            return cam.scale.y * (this.pos.y - canvasBounds.top - cam.canvasPos.y) + cam.stagePos.y;
        }
    }
}

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