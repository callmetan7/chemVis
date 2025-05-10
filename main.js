import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
const fs = require('fs');

// Read the periodic table
fs.readFile('./PeriodicTableJSON.json', 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }
    const ptable = JSON.parse(data);
});

// Initialize scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Smooth rotation
// Position the camera
camera.position.z = 5;

// Add lights
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

function createAtom(x, y, z, color = 0xff0000, radius = 0.4) {
  const geometry = new THREE.SphereGeometry(radius, 32, 32);
  const material = new THREE.MeshPhongMaterial({ color });
  const atom = new THREE.Mesh(geometry, material);
  atom.position.set(x, y, z);
  scene.add(atom);
  return atom;
}

// Function to create a bond (cylinder)
function createBond(start, end, color = 0xffffff, radius = 0.1) {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, 8);
  const material = new THREE.MeshPhongMaterial({ color });
  const bond = new THREE.Mesh(geometry, material);

  // Position and rotate the bond
  bond.position.addVectors(start, end).multiplyScalar(0.5);
  bond.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.clone().normalize()
  );

  scene.add(bond);
  return bond;
}

// Example: Create a water molecule (H2O)
const oxygen = createAtom(0, 0, 0, 0xff0000); // Red (O)
const hydrogen1 = createAtom(0.8, 0.6, 0, 0x00aaff); // Blue (H)
const hydrogen2 = createAtom(-0.8, 0.6, 0, 0x00aaff); // Blue (H)

createBond(oxygen.position, hydrogen1.position);
createBond(oxygen.position, hydrogen2.position);

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update(); // Required if using OrbitControls
}
animate();
