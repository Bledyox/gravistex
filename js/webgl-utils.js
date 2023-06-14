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

  function createProgramFromScript(gl, vertexId = 'vertex-shader', fragmentId = 'fragment-shader') {
    const vertexSource = document.getElementById(vertexId).text;
    const fragmentSource = document.getElementById(fragmentId).text;
    return createProgram(
      gl,
      compileShader(gl, vertexSource, gl.VERTEX_SHADER),
      compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER),
    );
  }

  function createProgramAndCompile(gl, vertexSource, fragmentSource) {
    return createProgram(
      gl,
      compileShader(gl, vertexSource, gl.VERTEX_SHADER),
      compileShader(gl, fragmentSource, gl.FRAGMENT_SHADER),
    );
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

  function resizeCanvasToFullscreen(gl) {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
  }

  function resizeCanvasToFullscreenSquare(gl) {
    const viewportSize = Math.min(gl.viewportWidth, gl.viewportHeight);
    gl.viewport(
      (gl.viewportWidth - viewportSize) / 2,
      (gl.viewportHeight - viewportSize) / 2,
      viewportSize,
      viewportSize,
    );
  }

  return {
    compileShader: compileShader,
    createProgram: createProgram,
    createProgramAndCompile: createProgramAndCompile,
    getContext: getContext,
    resizeCanvasToFullscreen: resizeCanvasToFullscreen,
    resizeCanvasToFullscreenSquare: resizeCanvasToFullscreenSquare,
  };
}());



