$P.Camera = class extends $P.Base {
  constructor(stage, canvas, stagePos = new $P.Coord(0, 0), canvasPos = new $P.Coord(0, 0), dimensions = new $P.Coord(200, 100), scale = new $P.Coord(1, 1), clip = true) {
    super(); //Invoke inheritance constructor

    this._canvas = canvas;
    this._ctx = this._canvas.el.getContext("2d");
    this._stage = stage;

    this._stagePos = stagePos; //Set position of camera on stage
    this._canvasPos = canvasPos; //Set position of camera on canvas
    this._dimensions = dimensions; //Set camera dimensions
    this._scale = scale; //Set scale of camera
    this._clip = clip; //Set whether or not camera clips to its dimensions.
    this._back = "black"; //Camera background color
    this._stroke = ""; //Camera stroke color
    this._lineWidth = 1;
  }


  //A lot of setters and getters. Most importantly, they just break up the Coord objects into single values for readability etc.
  set canvas(canvas) {
    this._canvas = canvas;
    this._ctx = this._canvas.el.getContext("2d");
  }

  set stage(stage) {
    this._stage = stage;
  }

  set stagePos(pos) {
    this._stagePos = pos;
  }

  set canvasPos(pos) {
    this.canvasPos = pos;
  }

  set width(width) {
    this._dimensions.x = width;
  }

  set height(height) {
    this._dimensions.y = height;
  }

  set dimensions(dimensions) {
    this._dimensions = dimensions;
  }

  set scale(scale) {
    this._scale = scale;
  }

  set clip(clip) {
    this._clip = clip;
  }

  set back(back) {
    this._back = back;
  }

  set stroke(stroke) {
    this._stroke = stroke;
  }

  set lineWidth(width) {
    this._lineWidth = width;
  }

  get canvas() {
    return this._canvas;
  }

  get stage() {
    return this._stage;
  }

  get stagePos() {
    return this._stagePos;
  }

  get canvasPos() {
    return this._canvasPos;
  }

  get width() {
    return this._dimensions.x;
  }

  get height() {
    return this._dimensions.y;
  }

  get dimensions() {
    return this._dimensions;
  }

  get scale() {
    return this._scale;
  }

  get clip() {
    return this._clip;
  }

  get back() {
    return this._back;
  }

  get stroke() {
    return this._stroke;
  }

  get lineWidth() {
    return this._lineWidth;
  }

  center(coord) { //Center the Camera on a given stage position
    this._stagePos.x = coord.x - this._dimensions.x / 2; //Center the x position
    this._stagePos.y = coord.y - this._dimensions.y / 2; //Center the y position
    return this._stagePos; //Return the new position
  }

  draw() {
    this._ctx.save(); //Save the context because we will probably be scaling it.

    this._ctx.beginPath(); //Begin path for cleanliness

    if (this._back) { //Fill a background if the camera has a background color
      this._ctx.fillStyle = this._back;
      this._ctx.fillRect(this._canvasPos.x, this._canvasPos.y, this._dimensions.x, this._dimensions.y);
    }

    if (this._stroke) { //Outline the camera if the camera has an outline color
      this._ctx.strokeStyle = this._back;
      this._ctx.lineWidth = this._lineWidth;
      this._ctx.strokeRect(this._canvasPos.x, this._canvasPos.y, this._dimensions.x, this._dimensions.y);
    }

    if (this._clip) { //If camera has clip enabled, clip the canvas.
      this._ctx.rect(this._canvasPos.x, this._canvasPos.y, this._dimensions.x, this._dimensions.y);
      this._ctx.clip();
    }

    this._ctx.scale(this._scale.x, this._scale.y); //Scale the context using this camera's scale value

    for (var i in this._stage.props) {
      this._ctx.strokeStyle = "black"; //Default fill and stroke color for any props drawn
      this._ctx.fillStyle = "green";

      let prop = this._stage.props[i]; //Store the current prop for easy access
      let rel = $P.Coord.addCoords(prop.pos, $P.Coord.multCoord(this._stagePos, -1)); //Set rel equal to the difference between the camera position and the current prop position
      rel = $P.Coord.addCoords(rel, $P.Coord.divCoords(this._canvasPos, this._scale)); //Manipulate rel.y to be relative to the canvas
      
      prop.draw(this._ctx, rel, this._scale);
    }

    this._ctx.closePath(); //Close the path
    this._ctx.restore(); //Restore the context
  }
}
