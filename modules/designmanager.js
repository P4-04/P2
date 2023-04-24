import { setCells } from './cells.js';
import { setSpawnAreas } from './agents.js';
export { saveDesign, loadDesign, getAllDesignNames };

function getAllDesignNames() {
    let savedDesigns = [];
    for ( let i = 0, len = localStorage.length; i < len; ++i ) {
        //abcd.cells -> abcd | cut of the string after the first period
        let designName = localStorage.key(i).substring(0, localStorage.key(i).indexOf('.')); 
        if (!savedDesigns.includes(designName)) {
            savedDesigns.push(designName);
        }
    }
    return savedDesigns;
}

function saveDesign(cells, spawnAreas, name) {
    let serializedCells = JSON.stringify(cells)
    let serializedSpawnAreas = JSON.stringify(spawnAreas)
    localStorage.setItem(`${name}.cells`, `${serializedCells}`)
    localStorage.setItem(`${name}.areas`, `${serializedSpawnAreas}`)
}

function loadDesign(name){
    let loadedCells = localStorage.getItem(`${name}.cells`);
    let loadedSpawnAreas = localStorage.getItem(`${name}.areas`);
    let deserializedCells = JSON.parse(loadedCells);
    let deserializedSpawnAreas = JSON.parse(loadedSpawnAreas);
    setCells(deserializedCells);
    setSpawnAreas(deserializedSpawnAreas);
}