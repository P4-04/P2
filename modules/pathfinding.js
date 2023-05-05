export {calculateVectors}
import { getSpawnAreas } from './agents.js';
import { cellSize, drawTxt, getCellIndex } from './cells.js'

async function perfMeasure(cells, goal, spawn) {
    const start = performance.now();

    markCells(cells, goal);

    let spawnCount = 0;
    let spawnGroups = getSpawnAreas();
    for (let i = 0; i < getSpawnAreas().length; i++)
    {
        spawnCount = spawnCount + spawnGroups[i].length;
    }
    // if (hitSpawnCells != spawnCount){
    //     alert("Not all spawn areas can reach the end point(s)!");
    // }

    //calcVectorField(cells);

    calculateVectors(cells);

    const end = performance.now();
    console.log(`Execution time: ${end - start} ms`);
}

let hitSpawnCells = 0;
let pCanvasWidth = 0;
let pCanvasHeight = 0;
let pCellSize = 0;

function setEssenVariables(Width, Height, Size) {
    pCanvasHeight = Height;
    pCanvasWidth = Width;
    pCellSize = Size;   
}

function getCanvasHeight() { return pCanvasHeight; }
function getCanvasWidth() { return pCanvasWidth; }

let distVal = 0;

//Makes an array for input in markCells
function setArray(cells, cellsArray) {
    let updateArray = [];
    for (let i = 0; i < cellsArray.length; i++) {
        updateArray[i] = cells[cellsArray[i].x / pCellSize][cellsArray[i].y / pCellSize];
    }
    return updateArray;
}

//Recursive function for marking arrau of cells and counting distance
function markCells(cells, currentCell) {
    let nextNeighbors = [];
    let NeighborArr = [];

    for (let i = 0; i < currentCell.length; i++) {
        //Update cell if not already marked as updated or wall
        //cell.isWall === true => cell.mark === true
        if (currentCell[i] != undefined && currentCell[i].mark === false) {
            markCellsController(cells, currentCell[i]);

            NeighborArr = getNeighbors2(cells, currentCell[i]);

            //A maximum of 4 neighbors can be found for each cell
            nextNeighbors.push(NeighborArr[0]);
            nextNeighbors.push(NeighborArr[1]);
            nextNeighbors.push(NeighborArr[2]);
            nextNeighbors.push(NeighborArr[3]);
        }
    }
    distVal += 1;

    //If neighbors are present around current cells, do same procedure on cells
    if (nextNeighbors.length !== 0) {
        markCells(cells, nextNeighbors);
    }
}

//Sets distance value and mark on cell
//Draws text on cell
function markCellsController(cells, currentCell) {
    cells[currentCell.x / pCellSize][currentCell.y / pCellSize].value = distVal;
    //drawTxt(cells[currentCell.x / pCellSize][currentCell.y / pCellSize], distVal);
    
    let cell = cells[currentCell.x / pCellSize][currentCell.y / pCellSize]

    if (cell.color == "blue")
    {
        hitSpawnCells++;
    } 
    cells[currentCell.x / pCellSize][currentCell.y / pCellSize].mark = true;
    currentCell.mark = true;
}

function getNeighbors(currentCell, cellsArray) {
    let neighbors = { N: null, S: null, E: null, W: null, NE: null, NW: null, SE: null, SW: null }

    let index = getCellIndex(currentCell.x, currentCell.y)
    // Find north
    if (index.y != 0) {
        neighbors.N = cellsArray[index.x][index.y - 1]
    }
    // find south
    if (index.y < cellsArray[0].length - 1) {
        neighbors.S = cellsArray[index.x][index.y + 1]
    }
    // find east
    if (index.x < cellsArray.length - 1) {
        neighbors.E = cellsArray[index.x + 1][index.y]
    }
    // find west
    if (index.x != 0) {
        neighbors.W = cellsArray[index.x - 1][index.y]
    }
    // find north-east 
    if (index.x < cellsArray.length - 1 && index.y != 0) {
        neighbors.NE = cellsArray[index.x + 1][index.y - 1]
    }
    // find north-west
    if (index.x != 0 && index.y != 0) {
        neighbors.NW = cellsArray[index.x - 1][index.y - 1]
    }
    // find south-east
    if (index.x < cellsArray.length - 1 && index.y < cellsArray[0].length - 1) {
        neighbors.SE = cellsArray[index.x + 1][index.y + 1]
    }
    // find south-west
    if (index.x != 0 && index.y < cellsArray[0].length - 1) {
        neighbors.SW = cellsArray[index.x - 1][index.y + 1]
    }
    return neighbors
}


//Make array of neighbors on given cell
function getNeighbors2(cells, currentCell) {
    let newCurrentCell = [];
    if (currentCell.x != 0) {
        newCurrentCell[0] = cells[(currentCell.x / pCellSize) - 1][currentCell.y / pCellSize];
        if (newCurrentCell[0] === undefined) {
            newCurrentCell.splice(0, 1);
        }
    }
    else {

    }

    if (currentCell.x != cells[cells.length - 1][cells[0].length - 1].x) {
        newCurrentCell[1] = cells[(currentCell.x / pCellSize) + 1][currentCell.y / pCellSize];
        if (newCurrentCell[1] === undefined) {
            newCurrentCell.splice(1, 1);
        }
    }

    if (currentCell.y != 0) {
        newCurrentCell[2] = cells[currentCell.x / pCellSize][(currentCell.y / pCellSize) - 1];
        if (newCurrentCell[2] === undefined) {
            newCurrentCell.splice(2, 1);
        }
    }

    if (currentCell.y != cells[0][cells[0].length - 1].y) {
        newCurrentCell[3] = cells[currentCell.x / pCellSize][(currentCell.y / pCellSize) + 1];
        if (newCurrentCell[3] === undefined) {
            newCurrentCell.splice(3, 1);
        }
    }
    return newCurrentCell;
}

//Sets vector attribute on marked cell
//Calculated from direct neighbor values
// function calcVectorField(cells) {
//     for (let i = 1; i < cells.length-1; i++) {
//         for (let j = 1; j < cells[i].length-1; j++) {
//             if (cells[i][j].mark === true) {
//                 cells[i][j].vectorX = (cells[i-1][j].value - cells[i+1][j].value);
//                 cells[i][j].vectorY = (cells[i][j-1].value - cells[i][j+1].value);
//             }
//         }
//     }
// }


function calculateVectors(cells) {
    cells.forEach(row => {
        for (let cell of row) {
            if (cell.value === 0 || cell.isWall === true) {
                continue;
            }
            let neighbors = getNeighbors(cell, cells);

            if (neighbors.N && neighbors.N.isWall) {
                neighbors.NE = null
                neighbors.NW = null
            }
            if (neighbors.E && neighbors.E.isWall) {
                neighbors.NE = null
                neighbors.SE = null
            }
            if (neighbors.S && neighbors.S.isWall) {
                neighbors.SE = null
                neighbors.SW = null
            }
            if (neighbors.W && neighbors.W.isWall) {
                neighbors.NW = null
                neighbors.SW = null
            }
            let lowestValue = Infinity;
            let direction = '';

            for (let key in neighbors) {
                let neighbor = neighbors[key];
                if (neighbor && neighbor.isWall == false && neighbor.value < lowestValue) {
                    lowestValue = neighbor.value;
                    direction = key;
                }
            }

            if (direction === 'N') {
                cell.dVector = { x: 0, y: -1 }
            } else if (direction === 'S') {
                cell.dVector = { x: 0, y: 1 }
            } else if (direction === 'E') {
                cell.dVector = { x: 1, y: 0 }
            } else if (direction === 'W') {
                cell.dVector = { x: -1, y: 0 }
            } else if (direction === 'NE') {
                cell.dVector = { x: 1, y: -1 }
            } else if (direction === 'NW') {
                cell.dVector = { x: -1, y: -1 }
            } else if (direction === 'SE') {
                cell.dVector = { x: 1, y: 1 }
            } else if (direction === 'SW') {
                cell.dVector = { x: -1, y: 1 }
            }
        }
    });
    
}



export { setEssenVariables, perfMeasure, getCanvasHeight, getCanvasWidth, getNeighbors2 };