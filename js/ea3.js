"use strict";

function main() {
  const canvas = document.getElementById('ea3-canvas');
  const gl = canvas.getContext('experimental-webgl');
  gl.clearColor(1, 1, 1, 1);
  gl.frontFace(gl.CCW);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);

  // vertex shader
  const vertex_source = '' +
    'attribute vec3 pos;' +
    'attribute vec4 col;' +
    'varying vec4 color;' +
    'void main()' +
    '{' +
    'color = col;' +
    'gl_Position = vec4(pos, 4.2);' +
    '}';
  const vertex_shader = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex_shader, vertex_source);
  gl.compileShader(vertex_shader);

  // fragment shader
  const fragment_source = '' +
    'precision mediump float;' +
    'varying vec4 color;' +
    'void main()' +
    '{' +
    'gl_FragColor = color;' +
    '}';
  const fragment_shader = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment_shader, fragment_source);
  gl.compileShader(fragment_shader);

  // shader program
  const shader_program = gl.createProgram();
  gl.attachShader(shader_program, vertex_shader);
  gl.attachShader(shader_program, fragment_shader);
  gl.linkProgram(shader_program);
  gl.useProgram(shader_program);

  // vertices
  const vertices = [];
  sierpinski(4, 8, 0, 0, 8, 0, 2);

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
      vertices.push(ax - 4, ay - 4, 0);
      vertices.push(bx - 4, by - 4, 0);
      vertices.push(cx - 4, cy - 4, 0);
    }
  }

  // indices
  const indices = [];
  for (let i = 0; i < vertices.length / 3; i++) {
    indices.push(i);
  }

  // colors
  const colors = [];
  colors.push(1.0, 0.0, 0.0, 1); // Rot
  colors.push(1.0, 0.0, 0.5, 1); // Magenta
  colors.push(1.0, 0.5, 0.0, 1); // Orange
  colors.push(1.0, 0.0, 0.5, 1); // Magenta
  colors.push(1.0, 0.0, 1.0, 1); // Pink
  colors.push(1.0, 1.0, 1.0, 1); // Weiß
  colors.push(1.0, 0.5, 0.0, 1); // Orange
  colors.push(1.0, 1.0, 1.0, 1); // Weiß
  colors.push(1.0, 1.0, 0.0, 1); // Gelb
  colors.push(1.0, 0.0, 1.0, 1); // Pink
  colors.push(0.5, 0.0, 1.0, 1); // Violett
  colors.push(1.0, 1.0, 1.0, 1); // Weiß
  colors.push(0.5, 0.0, 1.0, 1); // Violett
  colors.push(0.0, 0.0, 1.0, 1); // Blau
  colors.push(0.0, 0.5, 1.0, 1); // Hellblau
  colors.push(1.0, 1.0, 1.0, 1); // Weiß
  colors.push(0.0, 0.5, 1.0, 1); // Hellblau
  colors.push(0.0, 1.0, 1.0, 1); // Türkis
  colors.push(1.0, 1.0, 0.0, 1); // Gelb
  colors.push(1.0, 1.0, 1.0, 1); // Weiß
  colors.push(0.5, 1.0, 0.0, 1); // Grün-Gelb
  colors.push(1.0, 1.0, 1.0, 1); // Weiß
  colors.push(0.0, 1.0, 1.0, 1); // Türkis
  colors.push(0.0, 1.0, 0.5, 1); // Mint-Grün
  colors.push(0.5, 1.0, 0.0, 1); // Grün-Gelb
  colors.push(0.0, 1.0, 0.5, 1); // Mint-Grün
  colors.push(0.0, 1.0, 0.0, 1); // Grün

  // vertex buffer position
  const vertex_buffer_position = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_position);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const position_attribute = gl.getAttribLocation(shader_program, 'pos');
  gl.vertexAttribPointer(position_attribute, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(position_attribute);

  // vertex buffer color
  const vertex_buffer_color = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer_color);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
  const color_attribute = gl.getAttribLocation(shader_program, 'col');
  gl.vertexAttribPointer(color_attribute, 4, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(color_attribute);

  // indices buffer
  const indices_buffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices_buffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  indices_buffer.numerOfEmements = indices.length;

  // render
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, indices_buffer.numerOfEmements, gl.UNSIGNED_SHORT, 0);

}
