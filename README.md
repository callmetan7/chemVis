# Molecular Visualization Toolkit (On Hold)  

**⚠️ Project Status: On Hold**  
This project is currently **not fully functional** and development is paused. The codebase provides a foundation for molecular visualization but requires significant improvements to handle complex molecules accurately.  

## Overview  

A JavaScript/Three.js-based tool for visualizing simple molecular structures in 3D. The application:  
- Parses molecular formulas (e.g., `H2O`, `CH4`)  
- Predicts bond types (single/double/triple)  
- Renders atoms and bonds with basic VSEPR geometry  
- Provides an interactive 3D viewer  

### Current Limitations  
❌ **Incomplete bond detection** (fails for many valid structures)  
❌ **No error handling** for invalid formulas  
❌ **Basic VSEPR only** (no advanced geometries)  
❌ **No optimization** (e.g., no WebWorker support)  

---

## Code Structure  

### Key Files  
| File | Purpose | Status |  
|------|---------|--------|  
| `index.html` | Main interface with input form | ✅ Functional |  
| `MoleculeBuilder.js` | Formula parsing + bond prediction | ⚠️ Partial |  
| `MoleculeViewer.js` | Three.js visualization | ⚠️ Basic shapes only |  

### Dependencies  
- Three.js (`v0.177.0`)  
- vite (`6.3.5`)
---

## Roadmap (If Development Resumes)  

### High-Priority Fixes  
1. **Bonding Algorithm**  
   - Implement accurate Lewis structure detection  
   - Add resonance/hypervalency support  

2. **Visualization**  
   - Electron density surfaces  
   - Molecular orbital rendering  

3. **Performance**  
   - WebWorker-based calculations  
   - Level-of-detail (LOD) rendering  

---

## Usage Example  

```javascript
// Basic workflow (currently unstable)
const molecule = new MoleculeBuilder("H2O");
molecule.formBonds(); // May fail for complex molecules
const viewer = new MoleculeViewer(molecule, "viewport");
```

---

## Contributing  

✅ **Accepting contributions** while the project is on hold.  

---

## License  

MIT License (see `LICENSE`). Free for educational use.  

--- 
