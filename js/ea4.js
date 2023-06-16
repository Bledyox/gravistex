const app = (function () {

  const ANTI_TREFOIL_KNOT = 0, TREFOIL_KNOT = 1, ASYMMETRIC_TORUS = 2, SNAIL = 3, WAVE_TORUS = 4, ANTI_WAVE_TORUS = 5;

  let gl;

  let program;

  let vertices, indices_lines, indices_triangles, colors_lines, colors_triangles;

  window.addEventListener('load', () => init());

  function init() {
    setup();
    build();
  }

  function setup() {
    gl = webglUtils.getContext();
    gl.clearColor(0, 0, 0, 0);
    gl.frontFace(gl.CCW);
    gl.cullFace(gl.BACK);
    gl.enable(gl.CULL_FACE);
    gl.depthFunc(gl.LEQUAL);
    gl.enable(gl.DEPTH_TEST);
    gl.polygonOffset(1.0, 1.0);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    webglUtils.resizeCanvasToFullscreenSquare(gl);
    const vertexSource = 'attribute vec3 pos; attribute vec4 col; varying vec4 color; void main() { color = col; gl_Position = vec4(pos * 0.2, 1); }';
    const fragmentSource = 'precision mediump float; varying vec4 color; void main() { gl_FragColor = color; }';
    program = webglUtils.createProgramAndCompile(gl, vertexSource, fragmentSource);
  }

  function build() {
    const firstSurface = document.getElementById('first').checked;
    const secondSurface = document.getElementById('second').checked;
    gl.bindAttribLocation(program, 0, "pos");
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (firstSurface) {
      construct(TREFOIL_KNOT, 64, 20);
      construct(ASYMMETRIC_TORUS, 64, 20);
    } else if (secondSurface) {
      construct(ANTI_TREFOIL_KNOT, 64, 20);
      construct(ANTI_WAVE_TORUS, 64, 20);
    }
  }

  function construct(object, nu, nv) {
    let range_u, range_v;
    let param;
    let index = [0, 0, 0];


    switch (object) {
      case ANTI_TREFOIL_KNOT:
        range_u = [0, 12 * Math.PI];
        range_v = [0, 2 * Math.PI];
        param = [0.4, 2, 1.6];
        break;
      case TREFOIL_KNOT:
        range_u = [0, 12 * Math.PI];
        range_v = [0, 2 * Math.PI];
        param = [0.4, 2.5];
        break;
      case ASYMMETRIC_TORUS:
        range_u = [0, 2 * Math.PI];
        range_v = [0, 2 * Math.PI];
        param = [0.2, 4, 1.6];
        break;
      case SNAIL:
        range_u = [0, 6 * Math.PI];
        range_v = [0, 2 * Math.PI];
        param = [2, 3];
        break;
      case WAVE_TORUS:
        range_u = [0, 2 * Math.PI];
        range_v = [0, 2 * Math.PI];
        param = [4, 0.5, 0.2, 7];
        break;
      case ANTI_WAVE_TORUS:
        range_u = [0, 2 * Math.PI];
        range_v = [0, 2 * Math.PI];
        param = [4, 0.5, 0.2, 7];
        break;
      default:
        console.log("ERROR: no object " + object);
        return;
    }
    let du = (range_u[1] - range_u[0]) / nu;
    let dv = (range_v[1] - range_v[0]) / nv;
    vertices = new Float32Array(3 * (nu + 1) * (nv + 1));
    indices_lines = new Uint16Array(2 * 2 * nu * nv);
    indices_triangles = new Uint16Array(3 * 2 * nu * nv);
    colors_lines = [];
    colors_triangles = [];
    for (let iu = 0, u = range_u[0]; iu <= nu; iu++, u += du) {
      for (let iv = 0, v = range_v[0]; iv <= nv; iv++, v += dv) {
        index[0] = iu * (nv + 1) + iv;
        let x, y, z, bx, by, bz, h;
        switch (object) {
          case ANTI_TREFOIL_KNOT:
            bx = param[0] + Math.cos(u / 2);
            by = (param[1] + param[0] * (param[2] + Math.sin(u / 2))) * Math.cos(u / 3);
            bz = (param[1] + param[0] * (param[2] + Math.sin(u / 2))) * Math.sin(u / 3);
            x = bx + param[0] * Math.cos(v - Math.PI) - param[0];
            y = by + param[0] * Math.cos(u / 3) * Math.sin(v - Math.PI);
            z = bz + param[0] * Math.sin(u / 3) * Math.sin(v - Math.PI);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_triangles.push(1.0, 0.0, 0.0, 1);
            colors_triangles.push(1.0, 0.5, 0.0, 1);
            colors_triangles.push(1.0, 0.0, 0.5, 1);
            break;
          case TREFOIL_KNOT:
            bx = param[0] + Math.sin(u / 2);
            by = (param[1] + param[0] * Math.cos(u / 2)) * Math.sin(u / 3);
            bz = (param[1] + param[0] * Math.cos(u / 2)) * Math.cos(u / 3);
            x = bx + param[0] * Math.sin(v - Math.PI) - param[0];
            y = by + param[0] * Math.sin(u / 3) * Math.cos(v - Math.PI);
            z = bz + param[0] * Math.cos(u / 3) * Math.cos(v - Math.PI);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_triangles.push(1.0, 0.0, 0.0, 1);
            colors_triangles.push(1.0, 0.5, 0.0, 1);
            colors_triangles.push(1.0, 0.0, 0.5, 1);
            break;
          case ASYMMETRIC_TORUS:
            x = (param[1] + param[0] * Math.cos(v) * (param[2] + Math.sin(u))) * Math.cos(u);
            y = param[0] * Math.sin(v) * (param[2] + Math.sin(u));
            z = (param[1] + param[0] * Math.cos(v) * (param[2] + Math.sin(u))) * Math.sin(u);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_triangles.push(0.0, 0.0, 1.0, 1);
            colors_triangles.push(0.5, 0.0, 1.0, 1);
            colors_triangles.push(0.0, 0.5, 1.0, 1);
            break;
          case SNAIL:
            h = Math.pow(Math.E, u / (6 * Math.PI));
            x = (param[0] * (1 - h) * Math.cos(u) * Math.cos(0.5 * v) * Math.cos(0.5 * v));
            y = (1 - Math.pow(Math.E, u / (param[1] * Math.PI)) - Math.sin(v) + h * Math.sin(v)) + 3;
            z = (param[0] * (-1 + h) * Math.sin(u) * Math.cos(0.5 * v) * Math.cos(0.5 * v));
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_triangles.push(0.0, 1.0, 0.0, 1);
            colors_triangles.push(0.0, 1.0, 0.5, 1);
            colors_triangles.push(0.5, 1.0, 0.0, 1);
            break;
          case WAVE_TORUS:
            x = (param[0] + (param[1] + param[2] * Math.sin(param[3] * u)) * Math.cos(v)) * Math.cos(u);
            y = (param[1] + param[2] * Math.sin(param[3] * u)) * Math.sin(v);
            z = (param[0] + (param[1] + param[2] * Math.sin(param[3] * u)) * Math.cos(v)) * Math.sin(u);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_triangles.push(0.0, 1.0, 0.0, 1);
            colors_triangles.push(0.0, 1.0, 0.5, 1);
            colors_triangles.push(0.5, 1.0, 0.0, 1);
            break;
          case ANTI_WAVE_TORUS:
            x = (param[0] + (param[1] + param[2] * Math.cos(param[3] * u)) * Math.sin(v)) * Math.sin(u);
            y = (param[0] + (param[1] + param[2] * Math.cos(param[3] * u)) * Math.sin(v)) * Math.cos(u);
            z = (param[1] + param[2] * Math.cos(param[3] * u)) * Math.cos(v);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_lines.push(0.0, 0.0, 0.0, 1);
            colors_triangles.push(0.0, 1.0, 0.0, 1);
            colors_triangles.push(0.0, 1.0, 0.5, 1);
            colors_triangles.push(0.5, 1.0, 0.0, 1);
            break;
          default:
            console.log("ERROR: no object " + object);
            return;
        }
        vertices[index[0] * 3] = x;
        vertices[index[0] * 3 + 1] = y;
        vertices[index[0] * 3 + 2] = z;
        if (iv > 0 && iu > 0) {
          indices_lines[index[1]++] = index[0] - 1;
          indices_lines[index[1]++] = index[0];
          indices_lines[index[1]++] = index[0] - (nv + 1);
          indices_lines[index[1]++] = index[0];
        }
        if (iv > 0 && iu > 0) {
          indices_triangles[index[2]++] = index[0];
          indices_triangles[index[2]++] = index[0] - 1;
          indices_triangles[index[2]++] = index[0] - (nv + 1);
          indices_triangles[index[2]++] = index[0] - 1;
          indices_triangles[index[2]++] = index[0] - (nv + 1) - 1;
          indices_triangles[index[2]++] = index[0] - (nv + 1);
        }
      }
    }

    createPositionBuffer(vertices);
    createColorBuffer(colors_triangles);
    const buffer1 = createIndexBuffer(indices_triangles);
    gl.drawElements(gl.TRIANGLES, buffer1.numberOfElements, gl.UNSIGNED_SHORT, 0);
    createColorBuffer(colors_lines);
    const buffer2 = createIndexBuffer(indices_lines);
    gl.drawElements(gl.LINES, buffer2.numberOfElements, gl.UNSIGNED_SHORT, 0);
  }

  function createPositionBuffer(positions) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
    const attribLocation = gl.getAttribLocation(program, 'pos');
    gl.vertexAttribPointer(attribLocation, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocation);
    return buffer;
  }

  function createColorBuffer(colors) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    let attribLocation = gl.getAttribLocation(program, 'col');
    gl.vertexAttribPointer(attribLocation, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribLocation);
    return buffer;
  }

  function createIndexBuffer(indices) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    buffer.numberOfElements = indices.length;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    return buffer;
  }

  return {
    start: init,
    change: build,
  };
}());
