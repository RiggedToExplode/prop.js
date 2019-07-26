$P = {
  Base: class { //Base class that everything will inherit from
    //Stolen UUID function
    static uuidGen(a) { return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, $P.Base.uuidGen) };


    constructor() {
      this._uuid = $P.Base.uuidGen(); //Generate a UUID
    }


    get uuid() {
      return this._uuid; //Get the private UUID
    }
  },
  Coord: class { //Basic class to store two coordinates
    static addCoords(coord1, coord2) { //Static method to add two coord objects
      return new $P.Coord(coord1.x + coord2.x, coord1.y + coord2.y);
    }

    static multCoord(coord, factor) { //Static method to multiply a coord object by a number
      return new $P.Coord(coord.x * factor, coord.y * factor);
    }

    static multCoords(coord1, coord2) { //Static method to multiply two coord objects together
      return new $P.Coord(coord1.x * coord2.x, coord1.y * coord2.y);
    }

    static divCoords(coord1, coord2) { //Static method to divide two coord objects
      return new $P.Coord(coord1.x / coord2.x, coord1.y / coord2.y);
    }

    static dist(coord1, coord2) {
      return Math.sqrt(Math.pow(coord2.x - coord1.x, 2) + Math.pow(coord2.y - coord1.y, 2));
    }


    constructor(x, y) {
      this._x = x;
      this._y = y;
    }

    
    set x(x) {
      this._x = x;
    }

    set y(y) {
      this._y = y;
    }

    get x() {
      return this._x;
    }

    get y() {
      return this._y;
    }


    toArr() { //Method to return Coord object in array
      return [this._x, this._y];
    }
  },
  Canvas: class { //Class to deal with canvasses
    constructor(id, width = 200, height = 100) {
      this._id = id; //Save id
      this._el = document.getElementById(id); //Store HTML element
      this._width = width; //Save our width
      this._height = height; //Save our height

      this._el.width = width; //Set element width to match ours
      this._el.height = height; //Set element height to match ours
    }


    set width(width) {
      this._width = width;
      this._el.width = width;
    }

    set height(height) {
      this._height = height;
      this._el.height = height;
    }

    get width() {
      return this._width;
    }

    get height() {
      return this._height;
    }

    get el() {
      return this._el;
    }
  },
  updateLoop: function(stage, interval = 8) { //Function to initiate an update loop.
    var lastUpdate = Date.now(); //Set the last update.

    window.setInterval(function() {
      let now = Date.now() //Get time now
      let dt = now - lastUpdate; //Find deltaTime
      lastUpdate = now; //Reset last update time

      stage.update(dt); //Update stage.
    }, interval);
  }
}