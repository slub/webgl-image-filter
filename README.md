# webgl-image-filter

The library contains multiple image filter for usage with a webgl context. It is based on the work from Dominic Szablewski [WebGLImageFilter](https://github.com/phoboslab/WebGLImageFilter). Licence information could be found [here](https://github.com/slub/webgl-image-filter/blob/master/LICENSE).

A further interesting project for webgl image manipulation is [glfx.js](https://github.com/evanw/glfx.js) by @evanw.

## API

The API of the library is quite simple. It comprises the functions `addFilter`, `apply` and `reset`. 

- `addFilter(filterName, [opt_args])` allows to add one or multiple filter to a filter chain. With every `addFilter` call a filter is added to the internal filter chain.
- `apply(gl, canvas)` this applies the filterChain to the given WebGLRenderingContext and HTMLCanvasElement. The filter are applied in the order attached to the filter chain.
- `reset()` clears the internal library cache. This function should be called before a new filter chain is constructed.

Example code:

```javascript
var gl = webglContext.getGL(),
    canvas = webglContext.getCanvas();

glif.reset();
glif.addFilter('contrast', 2);
glif.apply(gl, canvas);
```

More [examples](https://github.com/slub/webgl-image-filter/tree/master/examples) could be found in the example section. Also there is a [demo](http://jacmendt.github.io/openlayers/2015/11/04/ol3-image-filter.html).

### Filter
- `blur( opt_size=1 )` blur with size in pixels
- `brownie()` vintage colors
- `brightness( opt_brightness=1 )` change brightness. `1` increases the it two fold, `-1` halfes it. 
- `contrast( opt_contrast=1 )` change contrast. `1` increases the it two fold, `-1` halfes it
- `convolution( matrix )` apply a 3x3 convolution matrix (`Array[9]`)
- `colorMatrix( matrix )` apply a the 5x5 color matrix (`Array[20]`), similar to Flash's ColorMatrixFilter
- `desaturateLuminance()` desaturate the image taking the natural luminace of each channel into acocunt
- `detectEdges()` detect edges
- `emboss( opt_size=0 )` emboss effect with size in pixels
- `hue( opt_hue=0 )` rotate the hue, values are `0-360`
- `kodachrome()` vintage colors
- `negative()` invert colors
- `polaroid()` polaroid camera effect
- `saturation( opt_saturation=0 )` change saturation. `1` increases the it two fold, `-1` halfes it
- `sepia()` sepia colors
- `sharpen( opt_amount=1 )` sharpen
- `shiftToBGR()` shift colors from RGB to BGR
- `sobelX()` detect edges using a horizontal sobel operator
- `sobelY()` detect edges using a vertical sobel operator
- `technicolor()` vintage colors
- `vintagePinhole()` vintage colors

## Install

For updating the closure dependencies run:

```
python lib/closure-library/closure/bin/build/depswriter.py --root_with_prefix="src ../../../../src" > src/glif-deps.js
```

For building the library run:

```
node_modules\gulp\bin\gulp.js
```