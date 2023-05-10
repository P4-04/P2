import { loadCells, setExits } from './cells.js';
import { setSpawnAreas } from './agents.js';
export { saveDesign, loadDesign, getAllDesignNames, removeDesign };

async function getAllDesignNames(userCookie) {
    let savedDesigns = [];
    let response = await fetch("/getdesignnames", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cookie": userCookie
          }
    })
    let designs = await response.json();
    designs.forEach(design => {
        savedDesigns.push(design.name);
    });
    return savedDesigns;
}

async function saveDesign(userCookie, cells, spawnAreas, name, cellSize) {
    const design = {
        userCookie: userCookie,
        name: name,
        cells: cells,
        spawnAreas: spawnAreas,
        cellSize: cellSize
    }

    const serializedDesign = JSON.stringify(design);
    await fetch("/savedesign", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
          },
        body: serializedDesign
    })
}

async function removeDesign(name, userCookie) {
    await fetch("/removedesign", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "cookie": userCookie,
            "name": name
          }
    })
}

async function loadDesign(name, userCookie){
    let response = await fetch("/getdesign", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "cookie": userCookie,
            "name": name
          }
    })
    let deserializedDesign = await response.json();

    let Exits = [];
    deserializedDesign.cells.forEach(columns => {
        columns.forEach(cell => {
            if (cell.isExit) {
                Exits.push(cell);
            }
        });
    });
    setExits(Exits);
    loadCells(deserializedDesign.cells, deserializedDesign.cellSize);
    setSpawnAreas(deserializedDesign.spawnAreas);
}