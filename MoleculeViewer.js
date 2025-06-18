import * as THREE from 'three';

class MoleculeViewer {
    constructor(molecule, containerId = 'body') {
        this.molecule = molecule;
        this.container = document.querySelector(containerId);
        
        // Atomic radii (in arbitrary units)
        this.atomicRadii = {
            'H': 0.5, 'C': 1.0, 'N': 1.0, 'O': 1.0,
            'F': 1.0, 'P': 1.2, 'S': 1.1, 'Cl': 1.0
        };
        
        // Element colors (CPK coloring)
        this.elementColors = {
            'H': 0xFFFFFF, 'C': 0x909090, 'N': 0x3050F8,
            'O': 0xFF0D0D, 'F': 0x90E050, 'P': 0xFF8000,
            'S': 0xFFFF30, 'Cl': 0x1FF01F
        };
        
        this.initScene();
        this.createMolecule();
        this.addControls();
        this.animate();
    }
    
    initScene() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        
        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.z = 5;
        
        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }
    
    createMolecule() {
        // Create atom spheres
        this.atomMeshes = [];
        const centralAtom = this.molecule.atoms[this.molecule.centralAtomIndex];
        
        // Position atoms using VSEPR theory
        const geometry = this.molecule.predictGeometry();
        const positions = this.calculateAtomicPositions(geometry);
        
        this.molecule.atoms.forEach((atom, index) => {
            const radius = this.atomicRadii[atom.symbol] || 0.8;
            const color = this.elementColors[atom.symbol] || 0xFF69B4;
            
            const geometry = new THREE.SphereGeometry(radius, 32, 32);
            const material = new THREE.MeshPhongMaterial({ color });
            const sphere = new THREE.Mesh(geometry, material);
            
            // Set position based on geometry
            sphere.position.copy(positions[index] || new THREE.Vector3());
            
            this.scene.add(sphere);
            this.atomMeshes.push(sphere);
        });
        
        // Create bonds
        this.bondCylinders = [];
        const printedBonds = new Set();
        
        this.molecule.atoms.forEach((atom1, i) => {
            atom1.bonds.forEach((atom2Id, bondIndex) => {
                const bondKey = [i, atom2Id].sort().join('-');
                if (!printedBonds.has(bondKey)) {
                    const atom2 = this.molecule.atoms[atom2Id];
                    const bondOrder = atom1.bondOrders[bondIndex];
                    
                    // Create bond cylinders
                    this.createBond(i, atom2Id, bondOrder);
                    printedBonds.add(bondKey);
                }
            });
        });
        
        // Update info display
        document.getElementById('info').innerHTML = `
            <strong>${this.molecule.formula}</strong><br>
            Geometry: ${geometry}<br>
            Central atom: ${centralAtom.symbol}
        `;
    }
    
    calculateAtomicPositions(geometry) {
        const positions = [];
        const centralIndex = this.molecule.centralAtomIndex;
        const centralAtom = this.molecule.atoms[centralIndex];
        const peripheralAtoms = this.molecule.atoms.filter((_, i) => i !== centralIndex);
        
        // Place central atom at origin
        positions[centralIndex] = new THREE.Vector3(0, 0, 0);
        
        // Position peripheral atoms based on geometry
        switch(geometry) {
            case 'linear':
                peripheralAtoms.forEach((_, i) => {
                    positions[centralIndex + 1 + i] = new THREE.Vector3(0, 0, (i + 1) * 1.5);
                });
                break;
                
            case 'trigonal planar':
                peripheralAtoms.forEach((_, i) => {
                    const angle = (i * 120) * (Math.PI / 180);
                    positions[centralIndex + 1 + i] = new THREE.Vector3(
                        Math.cos(angle) * 1.5,
                        Math.sin(angle) * 1.5,
                        0
                    );
                });
                break;
                
            case 'tetrahedral':
                // Tetrahedral angles
                const tetraAngles = [
                    [0, 0, 1],
                    [0.9428, 0, -0.3333],
                    [-0.4714, 0.8165, -0.3333],
                    [-0.4714, -0.8165, -0.3333]
                ];
                peripheralAtoms.forEach((_, i) => {
                    if (i < 4) {
                        positions[centralIndex + 1 + i] = new THREE.Vector3(
                            tetraAngles[i][0] * 1.5,
                            tetraAngles[i][1] * 1.5,
                            tetraAngles[i][2] * 1.5
                        );
                    }
                });
                break;
                
            case 'bent':
                // For bent geometry (like water)
                positions[centralIndex + 1] = new THREE.Vector3(0, 1.5, 0);
                positions[centralIndex + 2] = new THREE.Vector3(1.5 * Math.cos(104.5 * Math.PI/180), 
                                                              1.5 * Math.sin(104.5 * Math.PI/180), 
                                                              0);
                break;
                
            default:
                // Default to random positions if geometry not recognized
                peripheralAtoms.forEach((_, i) => {
                    positions[centralIndex + 1 + i] = new THREE.Vector3(
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3,
                        (Math.random() - 0.5) * 3
                    );
                });
        }
        
        return positions;
    }
    
    createBond(atom1Index, atom2Index, bondOrder = 1) {
        const atom1 = this.atomMeshes[atom1Index];
        const atom2 = this.atomMeshes[atom2Index];
        
        // Position between the two atoms
        const position = new THREE.Vector3().addVectors(
            atom1.position,
            atom2.position
        ).multiplyScalar(0.5);
        
        // Calculate bond length and direction
        const direction = new THREE.Vector3().subVectors(
            atom2.position,
            atom1.position
        );
        const length = direction.length();
        direction.normalize();
        
        // Create cylinder geometry
        const radius = 0.1 * bondOrder; // Thicker for multiple bonds
        const geometry = new THREE.CylinderGeometry(
            radius, radius, length, 8, 1, true
        );
        
        // Rotate to point from atom1 to atom2
        const quaternion = new THREE.Quaternion().setFromUnitVectors(
            new THREE.Vector3(0, 1, 0),
            direction
        );
        const matrix = new THREE.Matrix4().makeRotationFromQuaternion(quaternion);
        geometry.applyMatrix4(matrix);
        
        // Create bond material
        const material = new THREE.MeshPhongMaterial({ 
            color: 0xCCCCCC,
            transparent: true,
            opacity: 0.8
        });
        
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.copy(position);
        this.scene.add(cylinder);
        this.bondCylinders.push(cylinder);
    }
    
    addControls() {
        // Orbit controls for interactive rotation
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    animate() {
        requestAnimationFrame(() => this.animate());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }
}

export {MoleculeViewer}