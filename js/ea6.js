const app = (function () {

  // Constant value for the x-axis.
  const X = 0;

  // Constant value for the y-axis.
  const Y = 1;

  // Constant value for the z-axis.
  const Z = 2;

  // Constant value for the rotation.
  const DELTA_ROTATE = Math.PI / 36;

  // Constant value for the scaling.
  //const DELTA_SCALE = 0.05;

  // Constant value for the translation.
  //const DELTA_TRANSLATE = 0.05;

  // The context of WebGL.
  let gl;

  // The shader program object is also used to store attribute and uniform locations.
  let program;

  // Array of model objects.
  const models = [];

  // Model that is target for user input.
  let interactiveModel;

  // Models that are target for animations.
  const animatedModels = [];

  // Orbit for the sphere movement.
  let orbit;

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
    // Angle to Z-Axis for camera when orbiting the center
    // given in radian.
    zAngle: 0,
    // Distance in XZ-Plane from center when orbiting.
    distance: 4,
  };

  function setup() {
    gl = webglUtils.getContext('ea6-canvas');
    gl.clearColor(0, 0, 0, 0);
    gl.frontFace(gl.CCW);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(0.5, 0);
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    initUniforms();
    initModels();
    initOrbit();
    initEventHandler();
    render();
  }


  /**
   * Create and init uniforms for Projection Matrix, Model-View-Matrix, Normal-Matrix and color.
   */
  function initUniforms() {
    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    program.nMatrixUniform = gl.getUniformLocation(program, "uNMatrix");
    program.colorUniform = gl.getUniformLocation(program, "uColor");
  }

  /**
   * Create and init the model of the application.
   * Add model to interactive or animated model.
   */
  function initModels() {
    const fs = "fillwireframe";
    createModel("torus", fs, [1, 0, 0, 1], [0, 0, 2], [0, -1.5, 0], [1, 1, 1]);
    createModel("sphere", fs, [1, 1, 0, 1], [0, 0, 0], [0, 0, 0], [.25, .25, .25]);
    createModel("sphere", fs, [0, 1, 0, 1], [0, 0, 0], [0, 0, 0], [.25, .25, .25]);
    createModel("sphere", fs, [0, 1, 1, 1], [0, 0, 0], [0, 0, 0], [.25, .25, .25]);
    createModel("sphere", fs, [0, 0, 1, 1], [0, 0, 0], [0, 0, 0], [.25, .25, .25]);
    createModel("plane", "wireframe", [1, 1, 1, 1], [0, -.8, 0], [0, 0, 0], [1, 1, 1]);
    // interactive model
    interactiveModel = models[0];
    // animated model
    animatedModels[0] = models[0];
    animatedModels[1] = models[1];
    animatedModels[2] = models[2];
    animatedModels[3] = models[3];
    animatedModels[4] = models[4];
  }

  /**
   * Create and init the orbit for the model movement.
   */
  function initOrbit() {
    orbit = {};
    orbit.radius = 2;
    orbit.rotate = DELTA_ROTATE;
    orbit.position = [];
    // push model in the orbit positions.
    for (let id = 1; id < animatedModels.length; id++) {
      animatedModels[id].translate[X] = orbit.radius * Math.cos(orbit.rotate);    // x = r * cos(phi)
      animatedModels[id].translate[Z] = orbit.radius * Math.sin(orbit.rotate);    // y = r * sin(phi)
      orbit.position.push(orbit.rotate);
      orbit.rotate += DELTA_ROTATE * 90;  // 360 / sphere count
    }
  }

  /**
   * Create model object, fill it and push it in model array.
   *
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
    model.translate = translate;
    model.rotate = rotate;
    model.scale = scale;
    model.mMatrix = mat4.create();
    model.mvMatrix = mat4.create();
    model.nMatrix = mat3.create();
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

    window.onkeydown = function (evt) {
      const key = evt.which ? evt.which : evt.keyCode;
      const c = String.fromCharCode(key);
      //console.log(evt);

      // Use shift key to change sign.
      const sign = evt.shiftKey ? -1 : 1;

      // Animation
      switch (c) {
        case('K'):
          for (let id = 0; id < animatedModels.length; id++) {
            if (id === 0) {
              animatedModels[0].rotate[Y] += sign * DELTA_ROTATE * 2;
              animatedModels[0].rotate[X] += sign * DELTA_ROTATE * 2;
            } else {
              orbit.position[id - 1] += sign * Math.PI / 36;
              animatedModels[id].translate[X] = orbit.radius * Math.cos(orbit.position[id - 1]);    // x = r * cos(phi)
              animatedModels[id].translate[Z] = orbit.radius * Math.sin(orbit.position[id - 1]);    // y = r * sin(phi)
              animatedModels[id].rotate[X] += sign * orbit.radius * orbit.rotate;
            }
          }
          break;
      }

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

      // Camera move and orbit.
      switch (c) {
        case('C'):
          // Orbit camera.
          // camera.zAngle += sign * DELTA_ROTATE;
          break;
        case('H'):
          // Move camera up and down.
          //camera.eye[Y] += sign * DELTA_TRANSLATE;
          break;
        case('D'):
          // Camera distance to center.
          //camera.distance += sign * DELTA_TRANSLATE;
          break;
        case('V'):
          // Camera fovy in radian.
          //camera.fovy += sign * 5 * Math.PI / 180;
          break;
        case('B'):
          // Camera near plane dimensions.
          //camera.lrtb += sign * 0.1;
          break;
      }

      // Rotate interactive Model.
      switch (c) {
        case('X'):
          //interactiveModel.rotate[X] += sign * DELTA_ROTATE;
          break;
        case('Y'):
          //interactiveModel.rotate[Y] += sign * DELTA_ROTATE;
          break;
        case('Z'):
          //interactiveModel.rotate[Z] += sign * DELTA_ROTATE;
          break;
      }

      // Scale interactive Model.
      switch (c) {
        case('S'):
          //interactiveModel.scale[X] *= 1 + sign * DELTA_SCALE;
          //interactiveModel.scale[Y] *= 1 - sign * DELTA_SCALE;
          //interactiveModel.scale[Z] *= 1 + sign * DELTA_SCALE;
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

    calculateCameraOrbit();

    // Set view matrix depending on camera.
    mat4.lookAt(camera.vMatrix, camera.eye, camera.center, camera.up);

    // Loop over model.
    for (let i = 0; i < models.length; i++) {

      gl.uniformMatrix3fv(program.nMatrixUniform, false, models[i].nMatrix);

      // Update modelview for model.
      updateTransformations(models[i]);

      // Set uColor for model.
      gl.uniform4fv(program.colorUniform, models[i].color);

      // Set uniforms for model.
      gl.uniformMatrix4fv(program.mvMatrixUniform, false, models[i].mvMatrix);

      draw(models[i]);
    }
  }

  function calculateCameraOrbit() {
    camera.eye[X] = camera.center[X];
    camera.eye[Z] = camera.center[Z];
    camera.eye[X] += camera.distance * Math.sin(camera.zAngle);
    camera.eye[Z] += camera.distance * Math.cos(camera.zAngle);
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

    // Calculate normal matrix from model-view matrix.
    mat3.normalFromMat4(model.nMatrix, mvMatrix);

  }

  function draw(model) {
    // Setup position VBO.
    gl.bindBuffer(gl.ARRAY_BUFFER, model.vboPos);
    gl.vertexAttribPointer(program.positionAttrib, 3, gl.FLOAT, false,
      0, 0);

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

  // App interface.
  return {
    start: main
  }

}());
