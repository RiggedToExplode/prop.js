///<reference path="../declarations/glob.d.ts" />
var $P;
(function ($P) {
    $P.Mouse = {
        left: false,
        middle: false,
        right: false,
        pos: undefined,
        relPos: function (cam) {
            let canvasBounds = cam.canvas.el.getBoundingClientRect();
            return new $P.Coord(cam.scale.x * (this.pos.x - canvasBounds.left - cam.canvasPos.x) + cam.stagePos.x, cam.scale.y * (this.pos.y - canvasBounds.top - cam.canvasPos.y) + cam.stagePos.y);
        },
        relX: function (cam) {
            let canvasBounds = cam.canvas.el.getBoundingClientRect();
            return cam.scale.x * (this.pos.x - canvasBounds.left - cam.canvasPos.x) + cam.stagePos.x;
        },
        relY: function (cam) {
            let canvasBounds = cam.canvas.el.getBoundingClientRect();
            return cam.scale.y * (this.pos.y - canvasBounds.top - cam.canvasPos.y) + cam.stagePos.y;
        },
        init: function () {
            this.pos = new $P.Coord(0, 0);
            window.addEventListener("mousedown", function (e) {
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
            }, false);
            window.addEventListener("mouseup", function (e) {
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
            }, false);
            window.addEventListener("mousemove", function (e) {
                $P.Mouse.pos.x = e.clientX;
                $P.Mouse.pos.y = e.clientY;
            }, false);
        }
    };
})($P || ($P = {}));
