const fs = require("fs");
const ptable = JSON.parse(fs.readFileSync("PeriodicTableJSON.json"));

class MoleculeBuilder {
  constructor(formula) {
    this.formula = formula;
    this.atoms = [];
    this.centralAtomIndex = null;
    this.parseFormula();
    this.enrichAtoms();
    this.identifyCentralAtom();
  }

  parseFormula() {
    const regex = /([A-Z][a-z]*)(\d*)/g;
    let match;
    let id = 0;

    while ((match = regex.exec(this.formula)) !== null) {
      const symbol = match[1];
      const count = match[2] ? parseInt(match[2]) : 1;
      
      for (let i = 0; i < count; i++) {
        this.atoms.push({
          symbol,
          id: id++,
          bonds: [],
          bondOrders: [] // Track bond orders separately
        });
      }
    }
  }

  enrichAtoms() {
    this.atoms.forEach(atom => {
      const element = ptable.elements.find(e => e.symbol === atom.symbol);
      if (!element) throw new Error(`Element ${atom.symbol} not found`);
      
      atom.index = element.number - 1;
      atom.group = element.group;
      atom.electronegativity = element.electronegativity_pauling;
      atom.valence = this.calculateValence(atom);
      atom.lonePairs = this.calculateLonePairs(atom);
    });
  }

  calculateValence(atom) {
    // Simplified valence calculation
    if (atom.symbol === 'H') return 1;
    const lastDigit = atom.group % 10;
    return lastDigit > 4 ? 8 - lastDigit : lastDigit;
  }

  calculateLonePairs(atom) {
    // Basic lone pair estimation
    if (atom.symbol === 'O') return 2;
    if (atom.symbol === 'N') return 1;
    return 0;
  }

  identifyCentralAtom() {
    let minEN = Infinity;
    this.atoms.forEach((atom, index) => {
      if (atom.symbol !== 'H' && atom.electronegativity < minEN) {
        minEN = atom.electronegativity;
        this.centralAtomIndex = index;
        atom.type = 'cen';
      } else {
        atom.type = 'non';
      }
    });
  }

  canFormBond(atom1, atom2, proposedOrder = 1) {
    const available1 = atom1.valence - this.getBondOrderSum(atom1);
    const available2 = atom2.valence - this.getBondOrderSum(atom2);
    return available1 >= proposedOrder && available2 >= proposedOrder;
  }

  getBondOrderSum(atom) {
    return atom.bondOrders.reduce((sum, order) => sum + order, 0);
  }

  shouldFormDoubleBond(atom1, atom2) {
    if (!this.canFormBond(atom1, atom2, 2)) return false;
    
    const commonPairs = [
      ['C', 'O'], ['C', 'N'], ['C', 'C'],
      ['S', 'O'], ['P', 'O']
    ];
    
    const pair = [atom1.symbol, atom2.symbol].sort().join(',');
    return commonPairs.some(p => p.join(',') === pair);
  }

  formBonds() {
    const central = this.atoms[this.centralAtomIndex];
    
    // First bond non-hydrogen atoms
    this.atoms.forEach(atom => {
      if (atom.id !== central.id && atom.symbol !== 'H') {
        if (this.shouldFormDoubleBond(central, atom)) {
          this.createBond(central, atom, 2);
        } else if (this.canFormBond(central, atom)) {
          this.createBond(central, atom, 1);
        }
      }
    });

    // Then bond hydrogen atoms
    this.atoms.forEach(atom => {
      if (atom.symbol === 'H' && this.canFormBond(central, atom)) {
        this.createBond(central, atom, 1);
      }
    });

    // Handle remaining bonds
    this.handleRemainingBonds();
  }

  createBond(atom1, atom2, order) {
    atom1.bonds.push(atom2.id);
    atom2.bonds.push(atom1.id);
    atom1.bondOrders.push(order);
    atom2.bondOrders.push(order);
  }

  handleRemainingBonds() {
    // Handle cases where atoms need to bond with each other (not just central)
    this.atoms.forEach(atom1 => {
      this.atoms.forEach(atom2 => {
        if (atom1.id < atom2.id && // Prevent duplicate checks
            !atom1.bonds.includes(atom2.id) &&
            this.canFormBond(atom1, atom2)) {
          
          const bondOrder = this.shouldFormDoubleBond(atom1, atom2) ? 2 : 1;
          this.createBond(atom1, atom2, bondOrder);
        }
      });
    });
  }

  getBondType(atom1Id, atom2Id) {
    const atom1 = this.atoms.find(a => a.id === atom1Id);
    const atom2 = this.atoms.find(a => a.id === atom2Id);
    
    for (let i = 0; i < atom1.bonds.length; i++) {
      if (atom1.bonds[i] === atom2.id) {
        return atom1.bondOrders[i];
      }
    }
    return 0;
  }

  printStructure() {
    console.log(`Molecule: ${this.formula}`);
    console.log("Central atom:", this.atoms[this.centralAtomIndex].symbol);
    
    console.log("\nBonds:");
    const printed = new Set();
    this.atoms.forEach(atom1 => {
      atom1.bonds.forEach((atom2Id, i) => {
        const bondKey = [atom1.id, atom2Id].sort().join('-');
        if (!printed.has(bondKey)) {
          const atom2 = this.atoms.find(a => a.id === atom2Id);
          const bondType = ['-', '=', '≡'][atom1.bondOrders[i] - 1] || '-';
          console.log(`${atom1.symbol}${bondType}${atom2.symbol}`);
          printed.add(bondKey);
        }
      });
    });
  }
}

// Example usage
const formula = "H2SO4";
const molecule = new MoleculeBuilder(formula);
molecule.formBonds();
molecule.printStructure();


const testCases = ["CO2", "C2H4", "H2O", "CH2O", "CN"];
testCases.forEach(formula => {
  console.log("\nTesting:", formula);
  const mol = new MoleculeBuilder(formula);
  mol.formBonds();
  mol.printStructure();
});