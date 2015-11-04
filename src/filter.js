/**
 * Created by jacmendt on 03.11.15.
 *
 * Licence: https://github.com/slub/webgl-image-filter/blob/master/LICENSE
 */
goog.provide('glif.filter');

goog.require('glif.shader');

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_size
 * @expose
 */
glif.filter.blur = function(gl, canvas, lastInChain, opt_size) {
    var size = opt_size !== undefined ? opt_size : 1,
        blurSizeX = (size/7) / canvas.width,
        blurSizeY = (size/7) / canvas.height,
        shaderKey = 'BLUR';

    var program = glif.getProgram_(gl, shaderKey);

    // use actual program
    glif.useProgram_(gl, program);

    // Vertical
    gl.uniform2f(program['uniform']['px'], 0, blurSizeY);
    glif.draw_(gl, canvas, program, false, true);

    // Horizontal
    gl.uniform2f(program['uniform']['px'], blurSizeX, 0);
    glif.draw_(gl, canvas, program, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * Suggestive value range 0 - 2 (Default: 1)
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_brightness
 * @expose
 */
glif.filter.brightness = function(gl, canvas, lastInChain, opt_brightness) {
    var b = opt_brightness !== undefined ? opt_brightness : 1;
    glif.filter.colorMatrix.call(this, [
        b, 0, 0, 0, 0,
        0, b, 0, 0, 0,
        0, 0, b, 0, 0,
        0, 0, 0, 1, 0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.brownie = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        0.5997023498159715,0.34553243048391263,-0.2708298674538042,0,47.43192855600873,
        -0.037703249837783157,0.8609577587992641,0.15059552388459913,0,-36.96841498319127,
        0.24113635128153335,-0.07441037908422492,0.44972182064877153,0,-7.562075277591283,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {Array.<number>} matrix
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
*/
glif.filter.colorMatrix = function(matrix, gl, canvas, lastInChain) {
    // Create a Float32 Array and normalize the offset component to 0-1
    var m = new Float32Array(matrix);
    m[4] /= 255;
    m[9] /= 255;
    m[14] /= 255;
    m[19] /= 255;

    // Can we ignore the alpha value? Makes things a bit faster.
    var shaderKey = (1==m[18]&&0==m[3]&&0==m[8]&&0==m[13]&&0==m[15]&&0==m[16]&&0==m[17]&&0==m[19])
        ? 'COLOR_WITHOUT_ALPHA' : 'COLOR_WITH_ALPHA',
        program = glif.getProgram_(gl, shaderKey);

    // use actual program
    glif.useProgram_(gl, program);
    gl.uniform1fv(program['uniform']['m'], m);

    glif.draw_(gl, canvas, program, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * Suggestive value range 0 - 2 (Default: 1)
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_contrast
 * @expose
 */
glif.filter.contrast = function(gl, canvas, lastInChain, opt_contrast) {
    var v = opt_contrast !== undefined ? opt_contrast : 1,
        o = -128 * (v-1);

    glif.filter.colorMatrix.call(this, [
        v, 0, 0, 0, o,
        0, v, 0, 0, o,
        0, 0, v, 0, o,
        0, 0, 0, 1, 0
    ], gl, canvas, lastInChain);
};

/**
 * A convolution kernel (3x3). It is a 3x3 matrix where each entry in the matrix represents how much to multiply
 * the 8 pixels around the pixel we are rendering. The result is then divided by the weight of the kernel (sum of
 * values in the kernel or 1.0).
 *
 * See also: http://docs.gimp.org/en/plug-in-convmatrix.html
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {Array.<number>} matrix
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.convolution = function(matrix, gl, canvas, lastInChain) {
    var m = new Float32Array(matrix),
        pixelSizeX = 1 / canvas.width,
        pixelSizeY = 1 / canvas.height,
        shaderKey = 'CONVOLUTION';

    var program = glif.getProgram_(gl, shaderKey);

    // use actual program
    glif.useProgram_(gl, program);

    gl.uniform1fv(program['uniform']['m'], m);
    gl.uniform2f(program['uniform']['px'], pixelSizeX, pixelSizeY);

    glif.draw_(gl, canvas, program, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.desaturateLuminance = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        0.2764723, 0.9297080, 0.0938197, 0, -37.1,
        0.2764723, 0.9297080, 0.0938197, 0, -37.1,
        0.2764723, 0.9297080, 0.0938197, 0, -37.1,
        0, 0, 0, 1, 0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.detectEdges = function(gl, canvas, lastInChain) {
    glif.filter.convolution.call(this, [
        0, 1, 0,
        1 -4, 1,
        0, 1, 0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_size
 * @expose
 */
glif.filter.emboss = function(gl, canvas, lastInChain, opt_size) {
    var s = opt_size !== undefined ? opt_size : 1;
    glif.filter.convolution.call(this, [
        -2*s, -1*s, 0,
        -1*s, 1, 1*s,
        0, 1*s, 2*s
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * Suggestive value range -180 - 180 (Default: 0)
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_hue
 * @expose
 */
glif.filter.hue = function(gl, canvas, lastInChain, opt_hue) {
    var hue = opt_hue !== undefined ? opt_hue : 0,
        rotation = hue/180 * Math.PI,
        cos = Math.cos(rotation),
        sin = Math.sin(rotation),
        lumR = 0.213,
        lumG = 0.715,
        lumB = 0.072;

    glif.filter.colorMatrix.call(this, [
        lumR+cos*(1-lumR)+sin*(-lumR),lumG+cos*(-lumG)+sin*(-lumG),lumB+cos*(-lumB)+sin*(1-lumB),0,0,
        lumR+cos*(-lumR)+sin*(0.143),lumG+cos*(1-lumG)+sin*(0.140),lumB+cos*(-lumB)+sin*(-0.283),0,0,
        lumR+cos*(-lumR)+sin*(-(1-lumR)),lumG+cos*(-lumG)+sin*(lumG),lumB+cos*(1-lumB)+sin*(lumB),0,0,
        0, 0, 0, 1, 0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.kodachrome = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        1.1285582396593525,-0.3967382283601348,-0.03992559172921793,0,63.72958762196502,
        -0.16404339962244616,1.0835251566291304,-0.05498805115633132,0,24.732407896706203,
        -0.16786010706155763,-0.5603416277695248,1.6014850761964943,0,35.62982807460946,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.negative = function(gl, canvas, lastInChain) {
    glif.filter.contrast(gl, canvas, lastInChain, -2);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.polaroid = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        1.438,-0.062,-0.062,0,0,
        -0.122,1.378,-0.122,0,0,
        -0.016,-0.016,1.483,0,0,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * Suggestive value range -1 - 1 (Default: 0)
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_saturation
 * @expose
 */
glif.filter.saturation = function(gl, canvas, lastInChain, opt_saturation) {
    var s = opt_saturation !== undefined ? opt_saturation : 0,
        x = s * 2/ 3 + 1,
        y = ((x-1) * -0.5);
    glif.filter.colorMatrix.call(this, [
        x, y, y, 0, 0,
        y, x, y, 0, 0,
        y, y, x, 0, 0,
        0, 0, 0, 1, 0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.sepia = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        0.393, 0.7689999, 0.18899999, 0, 0,
        0.349, 0.6859999, 0.16799999, 0, 0,
        0.272, 0.5339999, 0.13099999, 0, 0,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @param {number} opt_amount
 * @expose
 */
glif.filter.sharpen = function(gl, canvas, lastInChain, opt_amount) {
    var a = opt_amount !== undefined ? opt_amount : 1;
    glif.filter.convolution.call(this, [
        0, -1*a, 0,
        -1*a, 1 + 4*a, -1*a,
        0, -1*a, 0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.shiftToBGR = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        0,0,1,0,0,
        0,1,0,0,0,
        1,0,0,0,0,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.sobelX = function(gl, canvas, lastInChain) {
    glif.filter.convolution.call(this, [
        -1, 0, 1,
        -2, 0, 2,
        -1, 0, 1
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.sobelY = function(gl, canvas, lastInChain) {
    glif.filter.convolution.call(this, [
        -1, -2, -1,
        0,  0,  0,
        1,  2,  1
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.technicolor = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        1.9125277891456083,-0.8545344976951645,-0.09155508482755585,0,11.793603434377337,
        -0.3087833385928097,1.7658908555458428,-0.10601743074722245,0,-70.35205161461398,
        -0.231103377548616,-0.7501899197440212,1.847597816108189,0,30.950940869491138,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {boolean} lastInChain
 * @expose
 */
glif.filter.vintagePinhole = function(gl, canvas, lastInChain) {
    glif.filter.colorMatrix.call(this, [
        0.6279345635605994,0.3202183420819367,-0.03965408211312453,0,9.651285835294123,
        0.02578397704808868,0.6441188644374771,0.03259127616149294,0,7.462829176470591,
        0.0466055556782719,-0.0851232987247891,0.5241648018700465,0,5.159190588235296,
        0,0,0,1,0
    ], gl, canvas, lastInChain);
};