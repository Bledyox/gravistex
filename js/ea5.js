const app = (function () {

  let gl;

  // The shader program object is also used to
  // store attribute and uniform locations.
  let program;

  // Array of model objects.
  let models;

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
    xAngle: 0.0,
    yAngle: 0.5,
    zAngle: 0.0,
    // Distance in XZ-Plane from center when orbiting.
    distance: 4,
    //aspect ratio
    aspect: 1
  };

  function setup() {
    gl = webglUtils.getContext();
    gl.clearColor(0, 0, 0, 0);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);
    gl.polygonOffset(0.5, 0);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    webglUtils.resizeCanvasToFullscreen(gl);
    camera.aspect = gl.viewportWidth / gl.viewportHeight;
    const vertexSource = document.getElementById("vertex-shader").text;
    const fragmentSource = document.getElementById("fragment-shader").text;
    program = webglUtils.createProgramAndCompile(gl, vertexSource, fragmentSource);
  }

  function init() {
    setup();
    gl.bindAttribLocation(program, 0, "aPosition");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
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
  }

  function initModels() {
    models = [];
    // fill-style
    const fs = "fillwireframe";
    const wire = "wireframe";
    createModel("torus", fs);
    createModel("recursive_sphere", fs);
    createModel("sphere", fs);
    createModel("plane", wire);
  }

  /**
   * Create model object, fill it and push it in model array.
   *
   * @parameter geometryname: string with name of geometry.
   * @parameter fillstyle: wireframe, fill, fillwireframe.
   */
  function createModel(geometryname, fillstyle) {
    const model = {};
    model.fillstyle = fillstyle;
    initDataAndBuffers(model, geometryname);
    // Create and initialize Model-View-Matrix.
    model.mvMatrix = mat4.create();

    models.push(model);
  }

  /**
   * Init data and buffers for model object.
   *
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
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesLines,
      gl.STATIC_DRAW);
    model.iboLines.numberOfElements = model.indicesLines.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

    // Setup triangle index buffer object.
    model.iboTris = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboTris);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indicesTris,
      gl.STATIC_DRAW);
    model.iboTris.numberOfElements = model.indicesTris.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }

  function initEventHandler() {
    // Rotation step.
    const deltaRotate = Math.PI / 36;

    window.onkeydown = function (evt) {
      const key = evt.which ? evt.which : evt.keyCode;
      const c = String.fromCharCode(key);

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

    setProjection();

    // mat4.identity(camera.vMatrix);
    // mat4.rotate(camera.vMatrix, camera.vMatrix,
    //    Math.PI*1/4 ,[1, 0, 0]);
    calculateCameraOrbit();

    // Set view matrix depending on camera.
    mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

    // Loop over model.
    for (let i = 0; i < models.length; i++) {
      // Update modelview for model.
      mat4.copy(models[i].mvMatrix, camera.vMatrix);

      // Set uniforms for model.
      gl.uniformMatrix4fv(program.mvMatrixUniform, false, models[i].mvMatrix);

      draw(models[i]);
    }
  }

  function setProjection() {
    // Set projection Matrix.
    let v;
    switch (camera.projectionType) {
      case("ortho"):
        v = camera.lrtb;
        mat4.ortho(camera.pMatrix, -v, v, -v, v, -10, 10);
        break;
      case("frustum"):
        v = camera.lrtb;
        mat4.frustum(camera.pMatrix, -v / 2, v / 2, -v / 2, v / 2, 1, 10);
        break;
      case("perspective"):
        mat4.perspective(camera.pMatrix, camera.fovy, camera.aspect, 1, 10);
        break;
    }
    // Set projection uniform.
    gl.uniformMatrix4fv(program.pMatrixUniform, false, camera.pMatrix);
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
      gl.drawElements(gl.TRIANGLES, model.iboTris.numberOfElements,
        gl.UNSIGNED_SHORT, 0);
    }

    // Setup rendering lines.
    const wireframe = (model.fillstyle.search(/wireframe/) !== -1);
    if (wireframe) {
      gl.disableVertexAttribArray(program.normalAttrib);
      gl.vertexAttrib3f(program.normalAttrib, 0, 0, 0);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.iboLines);
      gl.drawElements(gl.LINES, model.iboLines.numberOfElements,
        gl.UNSIGNED_SHORT, 0);
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

  // App interface.
  return {
    start: init
  }

}());
