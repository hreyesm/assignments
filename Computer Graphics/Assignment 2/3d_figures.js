let mat4 = glMatrix.mat4;

var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute,
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 2500; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource =
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas) {
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try
    {
        gl = canvas.getContext("experimental-webgl");
    }
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;
 }

function initViewport(gl, canvas) {
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas) {
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

function createPyramid(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [

      0.2, 0, 0,
      0.06180339887498949, 0, 0.1902113032590307,
      -0.16180339887498948, 0, 0.11755705045849466,

      0.2, 0, 0,
      -0.16180339887498948, 0, 0.11755705045849466,
      0.06180339887498945, 0, -0.19021130325903074,

      -0.16180339887498948, 0, 0.11755705045849466,
      -0.1618033988749895, 0, -0.11755705045849461, 0.06180339887498945, 0, -0.19021130325903074,

      0.2, 0, 0, 0.06180339887498949, 0, 0.1902113032590307, 0, 0.5, 0,

      0.06180339887498949, 0, 0.1902113032590307, -0.16180339887498948, 0, 0.11755705045849466, 0, 0.5, 0,

      -0.16180339887498948, 0, 0.11755705045849466, -0.1618033988749895, 0, -0.11755705045849461, 0, 0.5, 0,

      -0.1618033988749895, 0, -0.11755705045849461, 0.06180339887498945, 0, -0.19021130325903074, 0, 0.5, 0,

      0.06180339887498945, 0, -0.19021130325903074, 0.2, 0, 0, 0, 0.5, 0
    ];


    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],

        [0.0, 1.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
    ];

    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);

    let pyramidIndices = [
      0, 1, 2,  3, 4, 5,  6, 7, 8,
      9, 10, 11,  12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);

    let pyramid = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
        vertSize:3, nVerts:8, colorSize:4, nColors:8, nIndices:24,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    };

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function() {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };

    return pyramid;
}

function createOctahedron(gl, translation, rotationAxis) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let verts = [

      0.2, 0, 0.2,
      -0.2, 0, 0.2,
      0, 0.4, 0,

      0.2, 0, -0.2,
      -0.2, 0, -0.2,
      0, 0.4, 0,

      0.2, 0, 0.2,
      0.2, 0, -0.2,
      0, 0.4, 0,

      -0.2, 0, 0.2,
      -0.2, 0, -0.2,
      0, 0.4, 0,

      0.2, 0, 0.2,
      -0.2, 0, 0.2,
      0, -0.4, 0,

      0.2, 0, -0.2,
      -0.2, 0, -0.2,
      0, -0.4, 0,

      0.2, 0, 0.2,
      0.2, 0, -0.2,
      0, -0.4, 0,

      -0.2, 0, 0.2,
      -0.2, 0, -0.2,
      0, -0.4, 0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
    ];

    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);

    let octahedronIndices = [
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);

    let octahedron = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
        vertSize:3, nVerts:8, colorSize:4, nColors:8, nIndices:24,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
    };

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    let i = 0, dir = 0;

    octahedron.update = function() {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);

        let height = 175;
        if(i < height && dir == 0){
            mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0, fract, 0]);
            i++;
            if(i == height){
                dir = 1;
            }
        }
        else{
            mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0, -fract, 0]);
            i--;
            if(i == (height * -1)){
                dir = 0;
            }
        }
    };

    return octahedron;
}

function createDodecahedron(gl, translation, rotationAxis, rotationAxis2) {
    // Vertex Data
    let vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    let phi = ( 1 + Math.sqrt( 5 ) ) / 2;
  	let b = 1 / phi;
    let c = 2 - phi;

    // 0-1-2, 0-2-4, 2-3-4

    let verts = [
      c,  0,  1,   -c,  0,  1,   -b,  b,  b,
      c,  0,  1,   -b,  b,  b,    b,  b,  b,
     -b,  b,  b,    0,  1,  c,    b,  b,  b,

     -c,  0,  1,    c,  0,  1,    b, -b,  b,
     -c,  0,  1,    b, -b,  b,   -b, -b,  b,
      b, -b,  b,    0, -1,  c,   -b, -b,  b,

     c,  0, -1,    -c,  0, -1,   -b, -b, -b,
     c,  0, -1,    -b, -b, -b,    b, -b, -b,
     -b, -b, -b,    0, -1, -c,    b, -b, -b,

     -c,  0, -1,    c,  0, -1,    b,  b, -b,
     -c,  0, -1,    b,  b, -b,   -b,  b, -b,
     b,  b, -b,    0,  1, -c,   -b,  b, -b,

     0,  1, -c,    0,  1,  c,    b,  b,  b,
     0,  1, -c,    b,  b,  b,    b,  b, -b,
     b,  b,  b,    1,  c,  0,    b,  b, -b,

     0,  1,  c,    0,  1, -c,   -b,  b, -b,
     0,  1,  c,   -b,  b, -b,   -b,  b,  b,
     -b,  b, -b,   -1,  c,  0,   -b,  b,  b,

     0, -1, -c,    0, -1,  c,   -b, -b,  b,
     0, -1, -c,   -b, -b,  b,   -b, -b, -b,
    -b, -b,  b,   -1, -c,  0,   -b, -b, -b,

     0, -1,  c,    0, -1, -c,    b, -b, -b,
     0, -1,  c,    b, -b, -b,    b, -b,  b,
     b, -b, -b,    1, -c,  0,    b, -b,  b,

     1,  c,  0,    1, -c,  0,    b, -b,  b,
     1,  c,  0,    b, -b,  b,    b,  b,  b,
     b, -b,  b,    c,  0,  1,    b,  b,  b,

     1, -c,  0,    1,  c,  0,    b,  b, -b,
     1, -c,  0,    b,  b, -b,    b, -b, -b,
     b,  b, -b,    c,  0, -1,    b, -b, -b,

     -1,  c,  0,   -1, -c,  0,   -b, -b, -b,
     -1,  c,  0,   -b, -b, -b,   -b,  b, -b,
     -b, -b, -b,   -c,  0, -1,   -b,  b, -b,

     -1, -c,  0,   -1,  c,  0,   -b,  b,  b,
     -1, -c,  0,   -b,  b,  b,   -b, -b,  b,
     -b,  b,  b,   -c,  0,  1,   -b, -b,  b
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // color data
    let colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    let faceColors = [
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],
        [0.0, 0.0, 0.0, 1.0],

        [0.0, 0.0, 1.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],
        [0.0, 0.0, 1.0, 1.0],

        [0.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],
        [0.0, 1.0, 0.0, 1.0],

        [0.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],
        [0.0, 1.0, 1.0, 1.0],

        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],
        [1.0, 0.0, 0.0, 1.0],

        [1.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],
        [1.0, 0.0, 1.0, 1.0],

        [1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],
        [1.0, 1.0, 0.0, 1.0],

        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],
        [1.0, 1.0, 1.0, 1.0],

        [0.0, 0.0, 0.5, 1.0],
        [0.0, 0.0, 0.5, 1.0],
        [0.0, 0.0, 0.5, 1.0],

        [0.0, 0.5, 0.5, 1.0],
        [0.0, 0.5, 0.5, 1.0],
        [0.0, 0.5, 0.5, 1.0],

        [0.5, 0.5, 0.5, 1.0],
        [0.5, 0.5, 0.5, 1.0],
        [0.5, 0.5, 0.5, 1.0],

        [0.5, 0.0, 0.5, 1.0],
        [0.5, 0.0, 0.5, 1.0],
        [0.5, 0.0, 0.5, 1.0],
    ];

    let vertexColors = [];
    faceColors.forEach(color =>{
        for (let j = 0; j < 3; j++)
            vertexColors.push(...color);
    });

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    let dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);

    let dodecahedronIndices = [
      0, 1, 2, 3, 4, 5, 6, 7, 8,
      9, 10, 11, 12, 13, 14, 15, 16, 17,
      18, 19, 20, 21, 22, 23, 24, 25, 26,
      27, 28, 29, 30, 31, 32, 33, 34, 35,
      36, 37, 38, 39, 40, 41, 42, 43, 44,
      45, 46, 47, 48, 49, 50, 51, 52, 53,
      54, 55, 56, 57, 58, 59, 60, 61, 62,
      63, 64, 65, 66, 67, 68, 69, 70, 71,
      72, 73, 74, 75, 76, 77, 78, 79, 80,
      81, 82, 83, 84, 85, 86, 87, 88, 89,
      90, 91, 92, 93, 94, 95, 96, 97, 98,
      99, 100, 101, 102, 103, 104, 105, 106, 107
    ];

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);

    let dodecahedron = {
        buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
        vertSize:3, nVerts:20, colorSize:4, nColors:36, nIndices:108,
        primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()
        // nIndices:108
    };

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function() {
        let now = Date.now();
        let deltat = now - this.currentTime;
        this.currentTime = now;
        let fract = deltat / duration;
        let angle = Math.PI * 2 * fract;
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis2);
    };

    return dodecahedron;
}

function createShader(gl, str, type) {
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl) {
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);

    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) {
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) {
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}
