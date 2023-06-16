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
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    webglUtils.resizeCanvasToFullscreenSquare(gl);
    const vertexSource = 'attribute vec3 pos;attribute vec4 col;varying vec4 color;void main(){color = col;gl_Position = vec4(pos, 4.2);}';
    const fragmentSource = 'precision mediump float;varying vec4 color;void main(){gl_FragColor = color;}';
    program = webglUtils.createProgramAndCompile(gl, vertexSource, fragmentSource);
  }

  function render() {
    const triangleCount = document.getElementById('count').value;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    const buffer = {
      position: createPositionBuffer(buildPositions(triangleCount)),
      color: createColorBuffer(buildColors(3 * (3 ** triangleCount))),
      index: createIndexBuffer(buildIndices(3 * (3 ** triangleCount))),
    };
    gl.drawElements(gl.TRIANGLES, buffer.index.numerOfEmements, gl.UNSIGNED_SHORT, 0);
  }


  function buildPositions(count) {
    const positions = [];
    sierpinski(4, 8, 0, 0, 8, 0, count);

    function sierpinski(ax, ay, bx, by, cx, cy, counter) {
      if (counter > 0) {
        const point_ax = (bx + cx) / 2;
        const point_ay = (by + cy) / 2;
        const point_bx = (ax + cx) / 2;
        const point_by = (ay + cy) / 2;
        const point_cx = (ax + bx) / 2;
        const point_cy = (ay + by) / 2;
        counter -= 1;
        sierpinski(ax, ay, point_cx, point_cy, point_bx, point_by, counter);
        sierpinski(point_cx, point_cy, bx, by, point_ax, point_ay, counter);
        sierpinski(point_bx, point_by, point_ax, point_ay, cx, cy, counter);
      } else {
        positions.push(ax - 4, ay - 4, 0);
        positions.push(bx - 4, by - 4, 0);
        positions.push(cx - 4, cy - 4, 0);
      }
    }

    return positions;
  }

  function createPositionBuffer(positions) {
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const positionAttribute = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(positionAttribute, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionAttribute);
    return positionBuffer;
  }

  function buildColors(count) {
    const colors = [];
    for (let i = 0; i < count; i++) {
      colors.push(1.0, 0.0, 0.0, 1);
      colors.push(0.0, 1.0, 0.0, 1);
      colors.push(0.0, 0.0, 1.0, 1);
    }
    return colors;
  }

  function createColorBuffer(colors) {
    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    const colorAtribute = gl.getAttribLocation(program, 'col');
    gl.vertexAttribPointer(colorAtribute, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(colorAtribute);
    return colorBuffer;
  }

  function buildIndices(count) {
    const indices = [];
    for (let i = 0; i < count; i++) {
      indices.push(i);
    }
    return indices;
  }

  function createIndexBuffer(indices) {
    const indices_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
    indices_buffer.numerOfEmements = indices.length;
    return indices_buffer;
  }

  return {
    start: init,
    update: render,
  };
}());
