// Variable declarations
let scene,
  camera,
  fieldOfView,
  aspectRatio,
  nearPlane,
  farPlane,
  HEIGHT,
  WIDTH,
  renderer,
  container,
  hemisphereLight,
  shadowLight;

// Color Palette
let Colors = {
  red: 0xf25346,
  white: 0xe5e5e7,
  brown: 0x59332e,
  pink: 0xf5986e,
  brownDark: 0x23190f,
  blue: 0x0b0f67
};

// Mouse Position
let mousePos = {
  x: 0,
  y: 0
};

function createScene() {
  // Get width and height of the screen
  // use them to set up aspect ratio of the camera and size of the renderer
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  // Create the scene
  scene = new THREE.Scene();

  // Add a fog effect to the scene; same color as background
  scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);

  // Create the camera
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 60;
  nearPlane = 1;
  farPlane = 10000;
  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    nearPlane,
    farPlane
  );

  // Set the camera position
  camera.position.x = 0;
  camera.position.z = 200;
  camera.position.y = 100;

  // Create the renderer
  renderer = new THREE.WebGLRenderer({
    // Allow transparency to show the gradient background
    alpha: true,

    // Activate anti-aliasing
    antialias: true
  });

  // Define the size of the renderer (Entire Screen)
  renderer.setSize(WIDTH, HEIGHT);

  // Enable shadow rendering
  renderer.shadowMap.enabled = true;

  // Add DOM element of the renderer to the container
  container = document.querySelector("#world");
  container.appendChild(renderer.domElement);

  // Update window resize
  window.addEventListener("resize", handleWindowResize, false);
}

function handleWindowResize() {
  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;
  renderer.setSize(WIDTH, HEIGHT);
  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
}

function createLights() {
  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

  // Light that acts like the sun
  shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

  // Set direction of the light
  shadowLight.position.set(150, 350, 350);

  // Enable shadow casting
  shadowLight.castShadow = true;

  // Define the visible area of projected shadow
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;

  // Define resolution of the shadow
  shadowLight.shadow.mapSize.width = 2048;
  shadowLight.shadow.mapSize.height = 2048;

  // Add lights to the scene
  scene.add(hemisphereLight);
  scene.add(shadowLight);
}

Sea = function() {
  var geom = new THREE.CylinderGeometry(725, 725, 20, 60, 20);
  geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  // important: by merging vertices we ensure the continuity of the waves
  geom.mergeVertices();

  // get the vertices
  var l = geom.vertices.length;

  // create an array to store new data associated to each vertex
  this.waves = [];

  for (var i = 0; i < l; i++) {
    // get each vertex
    var v = geom.vertices[i];

    // store some data associated to it
    this.waves.push({
      y: v.y,
      x: v.x,
      z: v.z,
      // a random angle
      ang: Math.random() * Math.PI * 2,
      // a random distance
      amp: 5 + Math.random() * 15,
      // a random speed between 0.016 and 0.048 radians / frame
      speed: 0.016 + Math.random() * 0.032
    });
  }
  var mat = new THREE.MeshPhongMaterial({
    color: Colors.blue,
    transparent: true,
    opacity: 0.9,
    shading: THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;
};

// now we create the function that will be called in each frame
// to update the position of the vertices to simulate the waves

Sea.prototype.moveWaves = function() {
  // get the vertices
  var verts = this.mesh.geometry.vertices;
  var l = verts.length;

  for (var i = 0; i < l; i++) {
    var v = verts[i];

    // get the data associated to it
    var vprops = this.waves[i];

    // update the position of the vertex
    v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
    v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;

    // increment the angle for the next frame
    vprops.ang += vprops.speed;
  }

  // Tell the renderer that the geometry of the sea has changed.
  // In fact, in order to maintain the best level of performance,
  // three.js caches the geometries and ignores any changes
  // unless we add this line
  this.mesh.geometry.verticesNeedUpdate = true;

  sea.mesh.rotation.z += 0.000001;
};

// Instatiate the sea and add it to the scene
let sea;

function createSea() {
  sea = new Sea();

  // Push to the bottom of the scene (Won't do this for my game)
  sea.mesh.position.y = -600;

  // Add the mesh of the sea to the scene
  scene.add(sea.mesh);
}

let Fish = function() {
  this.mesh = new THREE.Object3D();

  // Fish body
  let geomBody = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
  let matBody = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });

  geomBody.vertices[4].y -= 10;
  geomBody.vertices[4].z += 20;
  geomBody.vertices[5].y -= 10;
  geomBody.vertices[5].z -= 20;
  geomBody.vertices[6].y += 10;
  geomBody.vertices[6].z += 20;
  geomBody.vertices[7].y += 20;
  geomBody.vertices[7].z -= 20;

  let body = new THREE.Mesh(geomBody, matBody);
  body.castShadow = true;
  body.receiveShadow = true;
  this.mesh.add(body);

  // Create the tail
  var geomTail = new THREE.BoxGeometry(10, 25, 0, 1);
  var matTail = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });

  var tail = new THREE.Mesh(geomTail, matTail);
  tail.position.set(-30, 0, 0);
  tail.castShadow = true;
  tail.receiveShadow = true;
  this.mesh.add(tail);
};

let fish;

function createFish() {
  fish = new Fish();
  fish.mesh.scale.set(0.05, 0.05, 0.05);
  fish.mesh.position.y = 100;
  scene.add(fish.mesh);
}

function updateFish() {
  var targetY = normalize(mousePos.y, -0.75, 0.75, 0, 110);
  var targetX = normalize(mousePos.x, -0.75, 0.75, -150, 150);

  // Move the plane at each frame by adding a fraction of the remaining distance
  fish.mesh.position.y += (targetY - fish.mesh.position.y) * 0.1;
  fish.mesh.position.x += (targetX - fish.mesh.position.x) * 0.1;

  // Rotate the plane proportionally to the remaining distance
  fish.mesh.rotation.z = (targetY - fish.mesh.position.y) * 0.0128;
  fish.mesh.rotation.x = (fish.mesh.position.y - targetY) * 0.0064;
}

let BadFish = function() {
  this.mesh = new THREE.Object3D();

  // Fish body
  let geomBody = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
  let matBody = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });

  geomBody.vertices[4].y += 10;
  geomBody.vertices[4].z -= 20;
  geomBody.vertices[5].y += 10;
  geomBody.vertices[5].z += 20;
  geomBody.vertices[6].y -= 10;
  geomBody.vertices[6].z -= 20;
  geomBody.vertices[7].y -= 20;
  geomBody.vertices[7].z += 20;

  let body = new THREE.Mesh(geomBody, matBody);
  body.castShadow = true;
  body.receiveShadow = true;
  this.mesh.add(body);

  // Create the tail
  var geomTail = new THREE.BoxGeometry(10, 25, 0, 1);
  var matTail = new THREE.MeshPhongMaterial({
    color: Colors.red,
    shading: THREE.FlatShading
  });

  var tail = new THREE.Mesh(geomTail, matTail);
  tail.position.set(30, 0, 0);
  tail.castShadow = true;
  tail.receiveShadow = true;
  this.mesh.add(tail);
};

let badFish;

function createBadFish() {
  badFish = new BadFish();
  badFish.mesh.scale.set(0.05, 0.05, 0.05);
  badFish.mesh.position.y = 50;
  badFish.mesh.position.x = 250;
  scene.add(badFish.mesh);
}

Cloud = function() {
  // Create an empty container that will hold the different parts of the cloud
  this.mesh = new THREE.Object3D();

  // Create the sphere geometry
  let geom = new THREE.SphereGeometry(25, 25, 25);

  // create a material
  let mat = new THREE.MeshPhongMaterial({
    color: Colors.white,
    opacity: 0.8
  });

  // Duplicate the geometry of a random number of times
  let nBlocs = 3 + Math.floor(Math.random() * 3);
  for (let i = 0; i < nBlocs; i++) {
    // Creat the mesh by cloning the geometry
    let m = new THREE.Mesh(geom, mat);

    // Set the position and the rotation of each sphere at random
    m.position.x = i * 15;
    m.position.y = Math.random() * 10;
    m.position.z = Math.random() * 10;
    m.rotation.z = Math.random() * Math.PI * 2;
    m.rotation.z = Math.random() * Math.PI * 2;

    // Set the size of the sphere randomly
    let s = 0.1 + Math.random() * 0.9;
    m.scale.set(s, s, s);

    // Allow each sphere to cast and to receive shadows
    m.castShadow = true;
    m.receiveShadow = true;

    // Add the sphere to the container
    this.mesh.add(m);
  }
};

Sky = function() {
  // Create an empty container
  this.mesh = new THREE.Object3D();

  // choose a number of clouds to be scattered in the sky
  this.nClouds = 20;

  // To distribute clouds consistently they need to be placed to a uniform angle
  let stepAngle = (Math.PI * 2) / this.nClouds;

  // Create the clouds
  for (let i = 0; i < this.nClouds; i++) {
    let c = new Cloud();

    // Set the rotation and the position of each cloud
    let a = stepAngle * i; // Final angle of the cloud
    let h = 900 + Math.random() * 200; // Distance between the clouds

    c.mesh.position.y = Math.sin(a) * h;
    c.mesh.position.x = Math.cos(a) * h;

    // Rotate the cloud according to its position
    c.mesh.rotation.z = a + Math.PI / 2;

    // Position the clouds at random depths in the scene
    c.mesh.position.z = -400 - Math.random() * 400;

    // Set a random scale for each cloud
    let s = 1 + Math.random() * 2;
    c.mesh.scale.set(s, s, s);

    // Add the mesh to each cloud
    this.mesh.add(c.mesh);
  }
};

let sky;

function createSky() {
  sky = new Sky();
  sky.mesh.position.y = -400;
  scene.add(sky.mesh);
}

function handleMouseMove(e) {
  let tx = -1 + (e.clientX / WIDTH) * 2;
  let ty = 1 - (e.clientY / HEIGHT) * 2;
  mousePos = {
    x: tx,
    y: ty
  };
}

function loop() {
  // Rotate the sea
  sea.mesh.rotation.z += 0.001;
  sky.mesh.rotation.z += 0.001;
  badFish.mesh.position.x -= 1;

  sea.moveWaves();

  updateFish();

  // Render the scene
  renderer.render(scene, camera);

  // Call the loop function again
  requestAnimationFrame(loop);
}

function normalize(v, vmin, vmax, tmin, tmax) {
  var nv = Math.max(Math.min(v, vmax), vmin);
  var dv = vmax - vmin;
  var pc = (nv - vmin) / dv;
  var dt = tmax - tmin;
  var tv = tmin + pc * dt;
  return tv;
}

window.addEventListener("load", init, false);

function init(e) {
  // Sets up the scene, camera, and renderer
  createScene();

  // Add lights
  createLights();

  // Add the objects
  createFish();
  createBadFish();
  createSea();
  createSky();

  document.addEventListener("mousemove", handleMouseMove, false);

  // Start a loop that will update the objects' positions and render the scene on each frame
  loop();
}
