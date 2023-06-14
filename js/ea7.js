const app = (function () {

  let gl;

  // The shader program object is also used to
  // store attribute and uniform locations.
  let program;

  // Array of model objects.
  const models = [];

  const camera = {
    // Initial position of the camera.
    eye: [0, 1, 4],
    // Point to look at.
    center: [0, 0, 0],
    // Roll and pitch of the camera.
    up: [0, 1, 0],
    // Opening angle given in radian.
    // radian = degree*2*PI/360.
    fovy: 60.0 * Math.PI / 180,
    // Camera near plane dimensions:
    // value for left right top bottom in projection.
    lrtb: 2.0,
    // View matrix.
    vMatrix: mat4.create(),
    // Projection matrix.
    pMatrix: mat4.create(),
    // Projection types: ortho, perspective, frustum.
    projectionType: "perspective",
    // Angle to X-, Y- & Z-Axis for camera when orbiting the center
    // given in radian.
    xAngle: 0.25,
    yAngle: 0.25,
    zAngle: 0.0,
    // Distance in XZ-Plane from center when orbiting.
    distance: 4,
  };

  function setup() {
    gl = webglUtils.getContext('ea7-canvas');
    gl.clearColor(0, 0, 0, 0);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    gl.polygonOffset(0.5, 0);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    camera.aspect = gl.viewportWidth / gl.viewportHeight;
    const vertexSource = document.getElementById("vertexshader").text;
    const fragmentSource = document.getElementById("fragmentshader").text;
    program = webglUtils.createProgram(
      gl,
      webglUtils.compileShader(gl, vertexSource, gl.VERTEX_SHADER),
      webglUtils.compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER),
    );
  }

  function main() {
    setup();
    gl.bindAttribLocation(program, 0, "aPosition");
    initUniforms();
    initModels();
    initEventHandler();
    render();
  }

  function initUniforms() {
    // Projection Matrix.
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");

    // Model-View-Matrix.
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");

    // Normal Matrix.
    program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");

    // Color.
    program.colorUniform = gl.getUniformLocation(program, "uColor");
  }

  function initModels() {
    // fillstyle
    const fs = "fillwireframe";
    createModel("torus", fs, [1, 1, 1, 1], [0, 0, 0], [0, 0, 0], [3, 3, 3]);
    createModel("torus", fs, [1, 1, 1, 1], [0, 0, 0], [0, 1.5, 0], [3, 3, 3]);
    createModel("torus", fs, [1, 1, 1, 1], [0, 0, 0], [1.5, 0, 0], [3, 3, 3]);
    createModel("sphere", fs, [0, 1, 0, 1], [0, 0, 0], [0, 0, 0], [.6, .6, .6]);
    createModel("sphere", fs, [0, 1, 0, 1], [1.5, 0, 0], [0, 0, 0], [.6, .6, .6]);
    createModel("sphere", fs, [0, 1, 0, 1], [-1.5, 0, 0], [0, 0, 0], [.6, .6, .6]);
    createModel("sphere", fs, [0, 1, 0, 1], [0, 0, 1.5], [0, 0, 0], [.6, .6, .6]);
    createModel("sphere", fs, [0, 1, 0, 1], [0, 0, -1.5], [0, 0, 0], [.6, .6, .6]);
    createModel("sphere", fs, [0, 1, 0, 1], [0, 1.5, 0], [0, 0, 0], [.6, .6, .6]);
    createModel("sphere", fs, [0, 1, 0, 1], [0, -1.5, 0], [0, 0, 0], [.6, .6, .6]);
    /**
     createModel("sphere", fs, [ 0, 0, 1, 1 ], [ -.75,  .05,    0 ], [   0,   0, 0 ], [  .3,  .3,  .3 ]);
     createModel("sphere", fs, [ 0, 1, 0, 1 ], [ -.05,  .05,  .75 ], [   0,   0, 0 ], [  .3,  .3,  .3 ]);
     createModel("sphere", fs, [ 0, 0, 1, 1 ], [  .05,  .05, -.75 ], [   0,   0, 0 ], [  .3,  .3,  .3 ]);
     createModel("sphere", fs, [ 0, 1, 0, 1 ], [    0,  .75,    0 ], [   0,   0, 0 ], [  .3,  .3,  .3 ]);
     createModel("sphere", fs, [ 0, 0, 1, 1 ], [    0, -.75,    0 ], [   0,   0, 0 ], [  .3,  .3,  .3 ]);**/
  }

  /**
   * Create model object, fill it and push it in model array.
   * @parameter geometryname: string with name of geometry.
   * @parameter fillstyle: wireframe, fill, fillwireframe.
   */
  function createModel(geometryname, fillstyle, color, translate, rotate, scale) {
    const model = {};
    model.fillstyle = fillstyle;
    model.color = color;
    initDataAndBuffers(model, geometryname);
    initTransformations(model, translate, rotate, scale);

    models.push(model);
  }

  /**
   * Set scale, rotation and transformation for model.
   */
  function initTransformations(model, translate, rotate, scale) {
    // Store transformation vectors.
    model.translate = translate;
    model.rotate = rotate;
    model.scale = scale;

    // Create and initialize Model-Matrix.
    model.mMatrix = mat4.create();

    // Create and initialize Model-View-Matrix.
    model.mvMatrix = mat4.create();

    // Create and initialize Normal Matrix.
    model.nMatrix = mat3.create();
  }

  /**
   * Init data and buffers for model object.
   * @parameter model: a model object to augment with data.
   * @parameter geometryname: string with name of geometry.
   */
  function initDataAndBuffers(model, geometryname) {
    // Provide model object with vertex data arrays.
    // Fill data arrays for Vertex-Positions, Normals, Index data:
    // vertices, normals, indicesLines, indicesTris;
    // Pointer this refers to the window.
    this[geometryname]['createVertexData'].apply(model);

    // Setup position vertex buffer object.
    model.vboPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW);
    // Bind vertex buffer to attribute variable.
    program.positionAttrib = gl.getAttribLocation(program, 'aPosition');
    gl.enableVertexAttribArray(program.positionAttrib);

    // Setup normal vertex buffer object.
    model.vboNormal = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW);
    // Bind buffer to attribute variable.
    program.normalAttrib = gl.getAttribLocation(program, 'aNormal');
    gl.enableVertexAttribArray(program.normalAttrib);

    // Setup lines index buffer object.
    model.iboLines = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines, gl.STATIC_DRAW);
    model.iboLines.numberOfElements = model.indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup triangle index buffer object.
    model.iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris, gl.STATIC_DRAW);
    model.iboTris.numberOfElements = model.indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function initEventHandler() {
    // Rotation step for model.
    const deltaRotate = Math.PI / 36;
    //var deltaTranslate = 0.05;
    //var deltaScale = 0.05;

    window.onkeydown = function (evt) {
      const key = evt.which ? evt.which : evt.keyCode;
      const c = String.fromCharCode(key);
      //console.log(evt);
      // Use shift key to change sign.
      //var sign = evt.shiftKey ? -1 : 1;
      // Change projection of scene.
      switch (c) {
        case('O'):
          camera.projectionType = "ortho";
          camera.lrtb = 2;
          break;
        case('F'):
          camera.projectionType = "frustum";
          camera.lrtb = 1.2;
          break;
        case('P'):
          camera.projectionType = "perspective";
          break;
      }
      // Move view of the scene
      switch (c) {
        case('W'):
          if (camera.yAngle + deltaRotate < Math.PI / 2) camera.yAngle += deltaRotate;
          break;
        case('A'):
          camera.xAngle -= deltaRotate;
          break;
        case('S'):
          if (camera.yAngle - deltaRotate > -Math.PI / 2) camera.yAngle -= deltaRotate;
          break;
        case('D'):
          camera.xAngle += deltaRotate;
          break;
      }
      // Render the scene again on any key pressed.
      render();
    };
  }

  /**
   * Run the rendering pipeline.
   */
  function render() {
    // Clear framebuffer and depth-/z-buffer.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    setProjection();

    calculateCameraOrbit();

    // Set view matrix depending on camera.
    mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

    // Loop over model.
    for (let i = 0; i < models.length; i++) {
      // Update modelview for model.
      updateTransformations(models[i]);

      // Set uniforms for model.
      gl.uniform4fv(program.colorUniform, models[i].color);
      gl.uniformMatrix4fv(program.mvMatrixUniform, false, models[i].mvMatrix);
      gl.uniformMatrix3fv(program.nMatrixUniform, false, models[i].nMatrix);

      draw(models[i]);
    }
  }

  function calculateCameraOrbit() {
    // Calculate x,z position/eye of camera orbiting the center.
    const x = 0, y = 1, z = 2;
    camera.eye[x] = camera.center[x];
    camera.eye[y] = camera.center[y];
    camera.eye[z] = camera.center[z];
    camera.eye[x] += camera.distance * Math.sin(camera.xAngle) * Math.cos(camera.yAngle);
    camera.eye[y] += camera.distance * Math.sin(camera.yAngle);
    camera.eye[z] += camera.distance * Math.cos(camera.xAngle) * Math.cos(camera.yAngle);
  }

  function setProjection() {
    const v = camera.lrtb;
    // Set projection Matrix.
    switch (camera.projectionType) {
      case("ortho"):
        mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
        break;
      case("frustum"):
        mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2, 1, 10);
        break;
      case("perspective"):
        mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
        break;
    }
    // Set projection uniform.
    gl.uniformMatrix4fv(program.pMatrixUniform, false, camera.pMatrix);
  }

  /**
   * Update model-view matrix for model.
   */
  function updateTransformations(model) {

    // Use shortcut variables.
    const mMatrix = model.mMatrix;
    const mvMatrix = model.mvMatrix;

    // Reset matrices to identity.
    mat4.identity(mMatrix);
    mat4.identity(mvMatrix);

    // Translate.
    mat4.translate(mMatrix, mMatrix, model.translate);
    // Rotate.
    mat4.rotateX(mMatrix, mMatrix, model.rotate[0]);
    mat4.rotateY(mMatrix, mMatrix, model.rotate[1]);
    mat4.rotateZ(mMatrix, mMatrix, model.rotate[2]);
    // Scale
    mat4.scale(mMatrix, mMatrix, model.scale);

    // Combine view and model matrix
    // by matrix multiplication to mvMatrix.
    mat4.multiply(mvMatrix, camera.vMatrix, mMatrix);

    // Calculate normal matrix from model matrix.
    mat3.normalFromMat4(model.nMatrix, mvMatrix);
  }

  function draw(model) {
    // Setup position VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.vertexAttribPointer(program.positionAttrib, 3, gl.FLOAT, false, 0, 0);

    // Setup normal VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboNormal);
    gl.vertexAttribPointer(program.normalAttrib, 3, gl.FLOAT, false, 0, 0);

    // Setup rendering tris.
    const fill = (model.fillstyle.search(/fill/) !== -1);
    if (fill) {
      gl.enableVertexAttribArray(program.normalAttrib);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
      gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }

    // Setup rendering lines.
    const wireframe = (model.fillstyle.search(/wireframe/) !== -1);
    if (wireframe) {
      gl.uniform4fv(program.colorUniform, [0., 0., 0., 1.]);
      gl.disableVertexAttribArray(program.normalAttrib);
      gl.vertexAttrib3f(program.normalAttrib, 0, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
      gl.drawElements(gl.LINES, model.iboLines.numberOfElements, gl.UNSIGNED_SHORT, 0);
    }
  }

  // App interface.
  return {
    start: main
  };

}());
