const fs = require('fs');
const Atom = require('./Atom.js')
// Read the periodic table
const ptable = JSON.parse(fs.readFileSync('PeriodicTableJSON.json'))
// const input = prompt("Molecule: ")
const formula = "H2SO4"

// Parsing the formula => "H2O" -> [{symbol: 'H', count: 2}, ...]
const elements = [];
const regex = /([A-Z][a-z]*)(\d*)/g;
let match;
let id = 0;
let hasH;

while ((match = regex.exec(formula)) !== null) {
    const symbol = match[1];
    const count = match[2] ? parseInt(match[2]) : 1;
    if(count != 0){
        for(let i = 0; i < count; i++){
            elements.push({symbol, id})
            id ++;
        }
    }
    else {{elements.push({ symbol, count });}}
}

// Generate valency count for each atom and electronegativity value
// Add the index of the element into the elements list to reduce time for future lookups
const lastDigit = (num) => num % 10;
for(let element = 0; element < elements.length; element++){
    let elementSymbol = elements[element]['symbol'];
    for(let i = 0; i < 118; i++){
        if(ptable["elements"][i]["symbol"] == elementSymbol){
            elements[element]["index"] = i;
        }
    }

    elements[element]["valence"] = (lastDigit(ptable["elements"][elements[element]["index"]]["group"]))
    if(ptable["elements"][elements[element]["index"]]["electronegativity_pauling"] == null) {
        console.log("Electronegatvity invalid")
    } else {
        elements[element]["electronegativity"] = ptable["elements"][elements[element]["index"]]["electronegativity_pauling"]
    }
    elements[element]['bonds'] = []
    if((elementSymbol) == 'H'){
        hasH = true;
    }
}
console.log(elements)
// Identiy Central Atom based on electronegativity
let maxEN = 3.98;
let centralAtom = 0;
for(let element = 0; element < elements.length; element++){
    let x = elements[element];
    if(x["electronegativity"] < maxEN && x['symbol'] != 'H'){
        maxEN = x['electronegativity']
        x['type'] = 'cen'
        centralAtom = element
    }
    else {x['type'] = 'non'}
}
function canBond(atom1, atom2, currentBonds1=[], currentBonds2=[]){
    let v1 = atom1['valence'];
    let v2 = atom2['valence'];

    let maxBond1, maxBond2;
    
    if(atom1['symbol'] == 'H'){
        maxBond1 = 1;
    }
    else if(atom2['symbol'] == 'H'){
        maxBond2 = 1;
    }
    else{
        maxBond1 = 8 - v1;
        maxBond2 = 8 - v2;
    }
    return (currentBonds1.length < maxBond1) && (currentBonds2.length < maxBond2)
}

// Bond the non-H atoms first since H is usually the terminal atom in most molecules
for(let element = 0; element < elements.length; element++){
    let x = elements[element];
    if(x.type != 'cen'){
        if(x.symbol != 'H' && canBond(elements[centralAtom], x, elements[centralAtom]['bonds'], x['bonds'])){
            elements[centralAtom]['bonds'].push(([x,1]));
            x['bonds'].push([elements[centralAtom], 1]);

            x['valence'] = x['valence'] - 1;
            elements[centralAtom]['valence'] += -1;
        }
    }
}