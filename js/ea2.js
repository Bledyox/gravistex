const app = (function () {

  let gl;

  function main() {
    gl = webglUtils.getContext('ea2-canvas');
    // alert("This browser doesn't support WebGL!");
    // vertices
    const vertices = [];
    const lines = 100.0;
    const line_margin = 0.1;
    const line_padding = 0.2;

    for (let angle = -180.0; angle < 180.0; angle += (360.0 / lines)) {
      const rotation = angle / 180 * Math.PI;
      const x = Math.cos(rotation);
      const y = Math.sin(rotation);
      vertices.push(x * line_padding, y * line_padding, x * (1 - line_margin), y * (1 - line_margin));
    }

    const vertex_source = 'attribute vec2 pos;void main() { gl_Position = vec4(pos, 0.0, 1.0); }';
    const fragment_source = 'void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }';
    const program = webglUtils.createProgram(
      gl,
      webglUtils.compileShader(gl, vertex_source, gl.VERTEX_SHADER),
      webglUtils.compileShader(gl, fragment_source, gl.FRAGMENT_SHADER),
    );

    // vertex buffer
    const vertex_buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // position attribute variable
    const pos_attr = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(pos_attr, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(pos_attr);

    // framebuffer and render primitives
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const viewportSize = Math.min(gl.viewportWidth, gl.viewportHeight);
    gl.viewport(
      (gl.viewportWidth - viewportSize) / 2,
      (gl.viewportHeight - viewportSize) / 2,
      viewportSize,
      viewportSize,
    );
    gl.drawArrays(gl.LINES, 0, lines * 2); // 1 x lines = 2 x vertices
  }

  return {
    start: main
  };
}());
