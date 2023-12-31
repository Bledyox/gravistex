const cone = (function () {

  function createVertexData() {
    const n = 32;
    const m = 16;

    // Positions.
    this.vertices = new Float32Array(3 * (n + 1) * (m + 1));
    const vertices = this.vertices;
    // Normals.
    this.normals = new Float32Array(3 * (n + 1) * (m + 1));
    const normals = this.normals;
    // Index data.
    this.indicesLines = new Uint16Array(2 * 2 * n * m);
    const indicesLines = this.indicesLines;
    this.indicesTris = new Uint16Array(3 * 2 * n * m);
    const indicesTris = this.indicesTris;

    const du = 2 * Math.PI / n;
    const dv = 2 * Math.PI / m;

    var ox = -1;
    var oy = 1;
    var oz = 1;

    // Counter for entries in index array.
    var iLines = 0;
    var iTris = 0;

    // Loop angle u.
    for (var i = 0, u = 0; i <= n; i++, u += du) {
      // Loop angle v.
      for (var j = 0, v = 0; j <= m; j++, v += dv) {

        var iVertex = i * (m + 1) + j;

        var x = v * Math.cos(u);
        var z = v * Math.sin(u);
        var y = -v + 0.5;

        // Set vertex positions.
        vertices[iVertex * 3] = x / 16 + ox;
        vertices[iVertex * 3 + 1] = y / 16 + oy;
        vertices[iVertex * 3 + 2] = z / 16 + oz;

        // Calc and set normals.
        var nx = Math.cos(u) * Math.cos(v);
        var ny = Math.cos(u) * Math.sin(v);
        var nz = Math.sin(u);
        normals[iVertex * 3] = nx;
        normals[iVertex * 3 + 1] = ny;
        normals[iVertex * 3 + 2] = nz;

        // if(i>14){
        // continue;
        // }

        // Set index.
        // Line on beam.
        if (j > 0 && i > 0) {
          indicesLines[iLines++] = iVertex - 1;
          indicesLines[iLines++] = iVertex;
        }
        // Line on ring.
        if (j > 0 && i > 0) {
          indicesLines[iLines++] = iVertex - (m + 1);
          indicesLines[iLines++] = iVertex;
        }

        // Set index.
        // Two Triangles.
        if (j > 0 && i > 0) {
          indicesTris[iTris++] = iVertex;
          indicesTris[iTris++] = iVertex - 1;
          indicesTris[iTris++] = iVertex - (m + 1);
          //
          indicesTris[iTris++] = iVertex - 1;
          indicesTris[iTris++] = iVertex - (m + 1) - 1;
          indicesTris[iTris++] = iVertex - (m + 1);
        }
      }
    }
  }

  return {
    createVertexData: createVertexData
  }

}());
