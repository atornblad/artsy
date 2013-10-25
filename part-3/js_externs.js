var THREE = {
    MeshBasicMaterial : function() {},
    Vector3 : function() {},
    Mesh : function() { this.position = { x : null, y : null, z : null }; },
    Geometry : function() { this.vertices = []; this.faces = []; },
    Face3 : function() {},
    MeshFaceMaterial : function() {},
    PlaneGeometry : function() { this.computeCentroids = function() {}; this.computeFaceNormals = function() {}; this.computeVertexNormals = function() {}; },
    Scene : function() {},
    PerspectiveCamera : function() { this.lookAt = function() {}; this.up = { x : null, y : null, z : null}; },
    WebGLRenderer : function() { this.setSize = function() {}; this.setClearColor = function() {}; this.render = function() {}; this.domElement = null; },
    CanvasRenderer : function() { this.setSize = function() {}; this.setClearColor = function() {}; this.render = function() {}; this.domElement = null; }
};
