import { MoleculeBuilder } from './MoleculeBuilder';
import { MoleculeViewer } from './MoleculeViewer';

document.getElementById("submit").onclick = function(){
    let formula = document.getElementById('inputID').value;
    const mol = new MoleculeBuilder(formula);
    mol.visualize();
}