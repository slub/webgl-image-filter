# webgl-image-filter

The library contains multiple image filter for usage with a webgl context. It is based on the work from Dominic Szablewski [WebGLImageFilter](https://github.com/phoboslab/WebGLImageFilter). Licence information could be found [here](https://github.com/slub/webgl-image-filter/blob/master/LICENSE).

A further interesting project for webgl image manipulation is [glfx.js](https://github.com/evanw/glfx.js) by @evanw.

## API

The API of the library is quite simple. It comprises the functions `addFilter`, `apply` and `reset`. 

- `addFilter(filterName, [opt_args])` allows to add one or multiple filter to a filterChain. With every `addFilter` call a filter is added to the filterChain.
- `apply(gl, canvas)` this applies the filterChain to the given WebGLRenderingContext and HTMLCanvasElement. The filter are applies in the order attached to the filterChain.
- `reset()` clear the intern library cache. Call this function before a new filter chain is constructed. 

Example code:

```javascript
var gl = webglContext.getGL(),
    canvas = webglContext.getCanvas();

glif.reset();
glif.addFilter('contrast', 2);
glif.apply(gl, canvas);
```

For more examples, see the example section.

