const webglUtils = (function () {

  function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!success) throw `*** Error: could not compile shader ${gl.getShaderInfoLog(shader)}`;
    return shader;
  }

  function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!success) throw `*** Error: program failed to link ${gl.getProgramInfoLog(program)}`;
    return program;
  }

  function getContext(canvasId = 'webgl-canvas', contextId = 'webgl') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) throw `*** Error: unknown canvas element ${canvasId}`;
    canvas.height = canvas.clientHeight;
    canvas.width = canvas.clientWidth;
    const gl = canvas.getContext(contextId);
    if (!gl) throw `*** Error: could not get context ${contextId}`;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    return gl;
  }

  return {
    compileShader: compileShader,
    createProgram: createProgram,
    getContext: getContext,
  };
}());



