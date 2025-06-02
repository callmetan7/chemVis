const fs = require('fs');

// Read the periodic table
const ptable = JSON.parse(fs.readFileSync('PeriodicTableJSON.json'))
// const input = prompt("Molecule: ")
const formula = "H2O"

// Parsing the formula => "H2O" -> [{symbol: 'H', count: 2}, ...]
const elements = [];
const regex = /([A-Z][a-z]*)(\d*)/g;
let match;
let id = 0;
const bonds = [

];

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

    elements[element]["valence"] = 8 - (lastDigit(ptable["elements"][elements[element]["index"]]["group"]))
    if(ptable["elements"][elements[element]["index"]]["electronegativity_pauling"] == null) {
        console.log("Electronegatvity invalid")
    } else {
        elements[element]["electronegativity"] = ptable["elements"][elements[element]["index"]]["electronegativity_pauling"]
    }
}

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

function canBond(atom1, atom2, currentBonds1, currentBonds2){
    let v1 = atom1['valence'];
    let v2 = atom2['valence'];
    
    if(atom1['symbol'] == 'H'){
        let maxBond1 = 1;
    }
    else if(atom2['symbol'] == 'H'){
        let maxBond2 = 1;
    }
    else{
        let maxBond1 = 8 - v1;
        let maxBond2 = 8 - v2;
    }
    return (currentBonds1 < maxbond1) && (currentBonds2 < maxBonds2)
}