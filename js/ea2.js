const app = (function () {

  let gl;

  let program;

  window.addEventListener('load', () => init());

  function init() {
    setup();
    render();
  }

  function setup() {
    gl = webglUtils.getContext('webgl-canvas');
    gl.clearColor(0, 0, 0, 0);
    webglUtils.resizeCanvasToFullscreenSquare(gl);
    const vertexSource = 'attribute vec2 pos;void main() { gl_Position = vec4(pos, 0.0, 1.0); }';
    const fragmentSource = 'void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }';
    program = webglUtils.createProgramAndCompile(gl, vertexSource, fragmentSource);
  }

  function render() {
    const lineCount = document.getElementById('count').value;
    gl.clear(gl.COLOR_BUFFER_BIT);
    buffer = createPositionBuffer(buildPositions(lineCount));
    gl.drawArrays(gl.LINES, 0, buffer.numberOfElements);
  }

  function buildPositions(count) {
    const positions = [];
    const lineMargin = 0.1;
    const linePadding = 0.2;

    for (let angle = -180.0; angle < 180.0; angle += (360.0 / count)) {
      const rotation = angle / 180 * Math.PI;
      const x = Math.cos(rotation);
      const y = Math.sin(rotation);
      positions.push(x * linePadding, y * linePadding, x * (1 - lineMargin), y * (1 - lineMargin));
    }
    return positions;
  }

  function createPositionBuffer(positions) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const positionAttribute = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(positionAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribute);
    positionBuffer.numberOfElements = positions.length / 2;
    return positionBuffer;
  }

  return {
    start: init,
    update: render,
  };
}());
