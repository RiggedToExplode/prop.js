# prop.js
Prop.js is a lightweight framework to manage drawing on the canvas via the application of "stage", "prop", and "camera" objects. Further functionality such as basic physics or player management is added through the creation of modules which extend upon the base framework. The goal of Prop.js is to be extendable via direct modification or extension of the base classes. Check the wiki or `annotated` directory for documentation and explanations.

## Getting Started
Prop.js is meant to be used in a browser environment, but should function in any environment that uses the same Canvas API as standard browsers.

### The Base Framework
The first step in any propject utilizing Prop.js is to download the base framework from this repository. The release versions of Prop.js are minified and commited to `prop.js` under the root directory. Download and include this file in your project, and you have all you need to get started with the base Prop.js framework!

### Modules
Prop.js is most strong when enhanced with modules. I intend to rarely update the base framework, and rather add modules under the `modules` directory. These modules are meant to extend upon the base framework by extending its classes. Modules are installed in much  the same way as the base framework: download the respective file and include it in your project. Just be sure to include it after the base `prop.js` file, and any other modules that it depends on. Module dependencies can be found on the wiki page for the module.

## Annotated Versions
I frequently commit my changes to the `annotated` directory, in the form of indented and commented code. When I feel I have made a reasonable amount of progress, I will minify all of my changes and commit them to the respective files in the root directory. Reading the annotated code is your best bet at understanding how the framework functions, at least until I complete the wiki.

## License
This project is licensed under the MIT License - see the LICENSE.md file for details.
