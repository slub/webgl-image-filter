/**
 * Created by jacmendt on 03.11.15.
 *
 * Licence: https://github.com/slub/webgl-image-filter/blob/master/LICENSE
 */
goog.provide('glif');

goog.require('glif.filter');
goog.require('glif.shader');

/**
 * @type {Array.<Object>}
 */
glif.filterChain_ = [];

/**
 * @type {number}
 */
glif.drawCount_ = 0;

/**
 * @type {number}
 */
glif.currentFramebufferIndex_ = 0;

/**
 * @type {Array<Object>}
 */
glif.framebuffers_ = [ null, null];

/**
 * Adds a filter to the filterchain
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {string} name
 * @export
 */
glif.addFilter = function(name){
    var args = Array.prototype.slice.call(arguments, 1),
        filter = glif.filter[name];
        //filter = window['glif']['filter'][name];

    glif.filterChain_.push({func: filter, args: args});
};

/**
 * Applies the actual programmed filter chain to the given webgl context
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @export
 */
glif.apply = function(gl, canvas) {

    // reset draw count because a new drawing is applied
    glif.drawCount_ = 0;

   if (glif.filterChain_.length == 0) {
        // no filters are registered
        return;
    }

    // reset framebuffers for preventing the production of artefacts
    glif.framebuffers_ = [null, null];

    glif.createClipspace_(gl);
    // Note sure if this is a good idea; at least it makes texture loading
    // in Ejecta instant.
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.viewport(0, 0, canvas.width, canvas.height);

    //glif.filter.emboss(gl, canvas, true);
    for (var i = 0; i < glif.filterChain_.length; i++) {
        var lastInChain = (i === glif.filterChain_.length - 1),
            filter = glif.filterChain_[i];

        // apply filter
        filter.func.apply(this, [gl, canvas, lastInChain].concat(filter.args || []));
    }
};

/**
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 */
glif.createClipspace_ = function(gl) {
    // Create the clipspace if we don't have it yet
    // Create the vertex buffer for the two triangles [x, y, u, v] * 6
    var vertices = new Float32Array([
        -1, -1, 0, 1,  1, -1, 1, 1,  -1, 1, 0, 0,
        -1, 1, 0, 0,  1, -1, 1, 1,  1, 1, 1, 0
    ]);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
};

/**
 * Create a framebuffer
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 */
glif.createFramebuffer_ = function(gl, canvas) {
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    var renderbuffer = gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);

    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    return {fbo: fbo, texture: texture};
};

/**
 * Draws and image with a filter to a buffer.
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {WebGLProgram} program
 * @param {boolean} lastInChain
 * @param {boolean=} opt_intermediateDraw Force to draw to a normal buffer
 */
glif.draw_ = function(gl, canvas, program, lastInChain, opt_intermediateDraw) {
    var source = null,
        target = null,
        flipY = null;

    // in case drawCount is 0 get source from gl texture if not from framebuffer
    source = glif.drawCount_ == 0 ? glif.getTexture_(gl, canvas) :
        glif.getFramebuffer_(gl, canvas, glif.currentFramebufferIndex_).texture;

    glif.drawCount_++;

    if (lastInChain && !(opt_intermediateDraw & true)) {
        // Last filter in the chain shoud draw directly back to WebGL Canvas.
        // We may also have to flip the image vertically now
        target = null;
        flipY = glif.drawCount_ % 2 == 0;
    } else {
        // Intermediate draw call shoud draw to the buffer
        glif.currentFramebufferIndex_ = (glif.currentFramebufferIndex_ + 1) % 2;
        target = glif.getFramebuffer_(gl, canvas, glif.currentFramebufferIndex_).fbo;
    }

    // bind the source and target and draw to triangles
    gl.bindTexture(gl.TEXTURE_2D, source);
    gl.bindFramebuffer(gl.FRAMEBUFFER, target);

    gl.uniform1f(program['uniform']['flipY'], (flipY ? -1 : 1) );
    gl.drawArrays(gl.TRIANGLES, 0, 6);
};

/**
 *
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @param {number} index
 * @return {?}
 */
glif.getFramebuffer_ = function(gl, canvas, index) {
    glif.framebuffers_[index] = glif.framebuffers_[index] || glif.createFramebuffer_(gl, canvas);
    return glif.framebuffers_[index];
};

/**
 * Checks the cache of a program is available for that shader key and if not create one.
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} shaderKey
 * @return {WebGLProgram}
 */
glif.getProgram_ = function(gl, shaderKey) {
    var key = shaderKey.toUpperCase(),
        program = glif.shader.CACHE_[key] !== undefined ? glif.shader.CACHE_[key] :
            glif.shader.compileFragmentShader(gl, glif.shader[key]);

    if (!glif.shader.CACHE_.hasOwnProperty(key)) {
        // save program in cache
        glif.shader.CACHE_[key] = program;
    }

    return program;
};

/**
 * @param {WebGLRenderingContext} gl
 * @param {HTMLCanvasElement} canvas
 * @return {WebGLTexture}
 */
glif.getTexture_ = function(gl, canvas) {
    var texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set the parameters so we can render any size image
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);

    return texture;
};

/**
 * @export
 */
glif.reset = function() {
    // clear filter chain
    glif.filterChain_ = [];

    // clear shader cache_
    for (var shader in glif.shader.CACHE_) delete glif.shader.CACHE_[shader];
};

/**
 * Wraps the gl.useProgram methode and adds some basic parameter for the library
 *
 * @param {WebGLRenderingContext} gl
 * @param {WebGLProgram} program
 */
glif.useProgram_ = function(gl, program) {
    gl.useProgram(program);

    var floatSize = Float32Array.BYTES_PER_ELEMENT;
    var vertSize = 4 * floatSize;
    gl.enableVertexAttribArray(program['attribute']['pos']);
    gl.vertexAttribPointer(program['attribute']['pos'], 2, gl.FLOAT, false, vertSize , 0 * floatSize);
    gl.enableVertexAttribArray(program['attribute']['uv']);
    gl.vertexAttribPointer(program['attribute']['uv'], 2, gl.FLOAT, false, vertSize, 2 * floatSize);
};