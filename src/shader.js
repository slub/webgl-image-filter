/**
 * Created by jacmendt on 03.11.15.
 *
 * Licence: https://github.com/slub/webgl-image-filter/blob/master/LICENSE
 */
goog.provide('glif.shader');

/**
 * Cache object for internal use and saving of already created shader programs.
 *
 * @type {Object}
 */
glif.shader.CACHE_ = {};

/**
 * Compiles a given shader source
 *
 * @param {WebGLRenderingContext} gl
 * @param {number} shaderType
 * @param {string} shaderSource
 */
glif.shader.compile = function(gl, shaderType, shaderSource) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS) ) {
        console.log(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
};

/**
 * Compiles a given fragment shader source and returns a program.
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @param {WebGLRenderingContext} gl
 * @param {string} fragmentShaderSource
 * @return {WebGLProgram}
 */
glif.shader.compileFragmentShader = function(gl, fragmentShaderSource) {

    var _collect = function( source, prefix, collection ) {
        var r = new RegExp('\\b' + prefix + ' \\w+ (\\w+)', 'ig');
        source.replace(r, function(match, name) {
            collection[name] = 0;
            return;
        });
    };

    var program = gl.createProgram();

    // create the shader
    var vertexShader = glif.shader.compile(gl, gl.VERTEX_SHADER, glif.shader.VERTEX_IDENTITY),
        fragmentShader = glif.shader.compile(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    program['uniform'] = {};
    program['attribute'] = {};

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if( !gl.getProgramParameter(program, gl.LINK_STATUS) ) {
        console.log(gl.getProgramInfoLog(program));
    }

    _collect(glif.shader.VERTEX_IDENTITY, 'attribute', program['attribute']);
    for (var a in program['attribute']) {
        program['attribute'][a] = gl.getAttribLocation(program, a);
    }

    // Collect uniforms
    _collect(glif.shader.VERTEX_IDENTITY, 'uniform', program['uniform'])
    _collect(fragmentShaderSource, 'uniform', program['uniform']);
    for( var u in program['uniform'] ) {
        program['uniform'][u] = gl.getUniformLocation(program, u);
    }

    return program;
};

/**
 * Fragment shader for blur effect
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.BLUR = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',
    'uniform vec2 px;',

    'void main(void) {',
        'gl_FragColor = vec4(0.0);',
        'gl_FragColor += texture2D(texture, vUv + vec2(-7.0*px.x, -7.0*px.y))*0.0044299121055113265;',
        'gl_FragColor += texture2D(texture, vUv + vec2(-6.0*px.x, -6.0*px.y))*0.00895781211794;',
        'gl_FragColor += texture2D(texture, vUv + vec2(-5.0*px.x, -5.0*px.y))*0.0215963866053;',
        'gl_FragColor += texture2D(texture, vUv + vec2(-4.0*px.x, -4.0*px.y))*0.0443683338718;',
        'gl_FragColor += texture2D(texture, vUv + vec2(-3.0*px.x, -3.0*px.y))*0.0776744219933;',
        'gl_FragColor += texture2D(texture, vUv + vec2(-2.0*px.x, -2.0*px.y))*0.115876621105;',
        'gl_FragColor += texture2D(texture, vUv + vec2(-1.0*px.x, -1.0*px.y))*0.147308056121;',
        'gl_FragColor += texture2D(texture, vUv                             )*0.159576912161;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 1.0*px.x,  1.0*px.y))*0.147308056121;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 2.0*px.x,  2.0*px.y))*0.115876621105;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 3.0*px.x,  3.0*px.y))*0.0776744219933;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 4.0*px.x,  4.0*px.y))*0.0443683338718;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 5.0*px.x,  5.0*px.y))*0.0215963866053;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 6.0*px.x,  6.0*px.y))*0.00895781211794;',
        'gl_FragColor += texture2D(texture, vUv + vec2( 7.0*px.x,  7.0*px.y))*0.0044299121055113265;',
    '}'
].join('\n');

/**
 * Fragment shader for color matrix
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.COLOR_WITH_ALPHA = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',
    'uniform float m[20];',

    'void main(void) {',
        'vec4 c = texture2D(texture, vUv);',
        'gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[3] * c.a + m[4];',
        'gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[8] * c.a + m[9];',
        'gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[13] * c.a + m[14];',
        'gl_FragColor.a = m[15] * c.r + m[16] * c.g + m[17] * c.b + m[18] * c.a + m[19];',
    '}'
].join('\n');

/**
 * Fragment shader for color matrix
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.COLOR_WITHOUT_ALPHA = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',
    'uniform float m[20];',

    'void main(void) {',
        'vec4 c = texture2D(texture, vUv);',
        'gl_FragColor.r = m[0] * c.r + m[1] * c.g + m[2] * c.b + m[4];',
        'gl_FragColor.g = m[5] * c.r + m[6] * c.g + m[7] * c.b + m[9];',
        'gl_FragColor.b = m[10] * c.r + m[11] * c.g + m[12] * c.b + m[14];',
        'gl_FragColor.a = c.a;',
    '}'
].join('\n');

/**
 * Fragment shader for a 3x3 convolution matrix.
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.CONVOLUTION = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',
    'uniform vec2 px;', // (pixelSizeX, pixelSizeY)
    'uniform float m[9];', // 3x3 matrix

    'void main(void) {',
        'vec4 c11 = texture2D(texture, vUv - px);', // top left
        'vec4 c12 = texture2D(texture, vec2(vUv.x, vUv.y - px.y));', // top center
        'vec4 c13 = texture2D(texture, vec2(vUv.x + px.x, vUv.y - px.y));', // top right

        'vec4 c21 = texture2D(texture, vec2(vUv.x - px.x, vUv.y) );', // mid left
        'vec4 c22 = texture2D(texture, vUv);', // mid center
        'vec4 c23 = texture2D(texture, vec2(vUv.x + px.x, vUv.y) );', // mid right

        'vec4 c31 = texture2D(texture, vec2(vUv.x - px.x, vUv.y + px.y) );', // bottom left
        'vec4 c32 = texture2D(texture, vec2(vUv.x, vUv.y + px.y) );', // bottom center
        'vec4 c33 = texture2D(texture, vUv + px );', // bottom right

        'gl_FragColor = ',
            'c11 * m[0] + c12 * m[1] + c22 * m[2] +',
            'c21 * m[3] + c22 * m[4] + c23 * m[5] +',
            'c31 * m[6] + c32 * m[7] + c33 * m[8];',
        'gl_FragColor.a = c22.a;',

        'if (c22.r == 255.0 && c22.g == 255.0 && c22.b == 255.0){',
            'gl_FragColor.rgb = vec3(255,255,255);',
        '}',
    '}'
].join('\n');

/**
 * Fragment shader for a 3x3 convolution matrix.
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.COPY = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',
    'void main(void) {',
        'gl_FragColor = texture2D(texture, vUv);',
    '}'
].join('\n');

/**
 * Fragment shader for a 3x3 convolution matrix.
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.INVERT = [
    'precision highp float;',
    'varying vec2 vUv;',
    'uniform sampler2D texture;',
    '',
    'void main(void) {',
    'vec4 c = texture2D(texture, vUv);',
    'gl_FragColor = vec4(1.0 - c.r, 1.0 - c.g, 1.0 - c.b, c.a);',
    '}'
].join('\n');

/**
 * Basic vertex shader
 *
 * Copyright © 2015 https://github.com/phoboslab/WebGLImageFilter
 * edit by @jacmendt
 *
 * @type {string}
 * @expose
 */
glif.shader.VERTEX_IDENTITY = [
    'precision highp float;',
    'attribute vec2 pos;',
    'attribute vec2 uv;',
    'varying vec2 vUv;',
    'uniform float flipY;',

    'void main(void) {',
        'vUv = uv;',
        'gl_Position = vec4(pos.x, pos.y*flipY, 0.0, 1.);',
    '}'
].join('\n');

