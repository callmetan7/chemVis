class Atom {
    constructor({ id, symbol, valenceElectrons, bonds = [], electronegativity, isCentral = false }) {
        this._id = id;
        this._symbol = symbol;
        this._valenceElectrons = valenceElectrons;
        this._bonds = bonds;
        this._electronegativity = electronegativity;
        this._isCentral = isCentral;
    }

    // id
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }

    // symbol
    get symbol() {
        return this._symbol;
    }
    set symbol(value) {
        this._symbol = value;
    }

    // valenceElectrons
    get valenceElectrons() {
        return this._valenceElectrons;
    }
    set valenceElectrons(value) {
        this._valenceElectrons = value;
    }

    // bonds
    get bonds() {
        return this._bonds;
    }
    set bonds(value) {
        this._bonds = value;
    }

    // electronegativity
    get electronegativity() {
        return this._electronegativity;
    }

    // isCentral
    get isCentral() {
        return this._isCentral;
    }
    set isCentral(value) {
        this._isCentral = value;
    }

    createBond(atom){
        this.bonds.append(atom)
        this.valence = this.valence - atom.getValence()
    }
}
