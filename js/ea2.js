"use strict";

function main() {
  const canvas = document.getElementById('ea2-canvas');

  const gl = canvas.getContext('experimental-webgl');

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

  // vertex shader
  const vertex_source = 'attribute vec2 pos;' +
    'void main() { gl_Position = vec4(pos, 0.0, 1.0); }';
  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, vertex_source);
  gl.compileShader(vertex_shader);

  // fragment shader
  const fragment_source = 'void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }';
  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, fragment_source);
  gl.compileShader(fragment_shader);

  // shader program
  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);
  gl.useProgram(shader_program);

  // vertex buffer
  const vertex_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // position attribute variable
  const pos_attr = gl.getAttribLocation(shader_program, 'pos');
  gl.vertexAttribPointer(pos_attr, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(pos_attr);

  // framebuffer and render primitives
  gl.clearColor(1.0, 1.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.LINES, 0, lines * 2); // 1 x lines = 2 x vertices
}
