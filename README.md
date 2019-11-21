# prop.js
Prop.js is a lightweight framework to manage drawing on the canvas via the application of "stage", "prop", and "camera" objects. Further functionality such as basic physics or player management is added through the creation of modules which extend upon the base framework. The goal of Prop.js is to be extendable via direct modification or extension of the base classes. Check the [wiki](https://github.com/RiggedToExplode/prop.js/wiki) or `annotated` directory for documentation and explanations.

## Why?
Prop.js differs from other drawing/creation frameworks in two main ways: the analogy and the modularity. Where other frameworks provide integrated features such as a physics engine or sprite management, Prop.js provides these features as separate modules. The end user can then customize Prop.js to their specific needs, and reduce the overall size of their project. Prop.js is also named and based around the analogy of a stage for a movie or show: the "stage" contains and manages all of the "props"  that are currently in the play, while the "camera" moves separately and records the happenings of the stage. This analogy is evident in the following code:
```javascript
var stage = new $P.Stage(); //Create the stage we will be working with.
var canvas = new $P.Canvas("canvas"); //Create a canvas object with the id of the canvas in the DOM.
var cam = new $P.Camera(stage, canvas); //Create a camera that draws from Stage "stage" and draws onto Canvas "canvas".

var box = new $P.Prop(); //Create a new Prop. By default, the Prop is placed at the origin and is a 20px by 20px green box.
box.update = function(dt /* # of milliseconds since update was last called */) {
  //We are directly modifying the prop's update function in order to change how it moves.
  this.rotateDegrees($P.Prop.perSecond(180)/* static method that simply returns the input/1000 for readability */ * dt);
}

stage.addProp(box); //Add Prop "box" to Stage "stage".

$P.updateLoop(stage); //Set Stage "stage" to start updating using the updateLoop method that calculates dt for us.

window.setInterval(function () { //Use setInterval to tell Camera "cam" to draw.
  cam.draw(); //Tell Camera "cam" to draw onto the Canvas "canvas".
}, 33 /* Draw every 33 milliseconds, or about 30 fps */);
```

## Getting Started
Prop.js is meant to be used in a browser environment, but should function in any environment that uses the same Canvas API as standard browsers.

### The Wiki
Prop.js is documented using GitHub's wiki pages. [Go there](https://github.com/RiggedToExplode/prop.js/wiki) to find a list of reference pages for every class and module in the framework. Complex examples and a tutorial are coming soon.

### The Base Framework
The first step in any propject utilizing Prop.js is to download the base framework from this repository. The release versions of Prop.js are minified and commited to `prop.js` under the root directory. Download and include this file in your project (with the use of `<script>` tags, most likely), and you have all you need to get started with the base Prop.js framework!

### Modules
Prop.js is at its strongest when enhanced with modules. The base framework is not meant to be updated, and any additional functionality is rather added in the form of modules under the `modules` directory. These modules are meant to extend upon the base framework by extending its classes. Modules are installed in much  the same way as the base framework: download the respective file and include it in your project. Just be sure to import it after the base `prop.js` file, and any other modules that it depends on. Module dependencies can be found on the [wiki](https://github.com/RiggedToExplode/prop.js/wiki) page for the module in question.

## Annotated Versions
Changes are frequently commited to the `annotated` directory, in the form of indented and commented code. When enough progress has been made, any changes are minified and commited to the respective files in the root directory. Reading the annotated code can assist in understanding how the framework functions.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
