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
    distVal += 0.5;

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
            let currentCellIndex = getCellIndex(cell.x, cell.y)
            let neighbors = getNeighbors2(cells, cell);
            let lowestCost = neighbors.reduce(function (acc, curr) {
                return Math.min(acc, curr.value);
            }, Infinity);
            let lowestCells = neighbors.filter(function (obj) {
                return obj.value === lowestCost;
            });
            console.log("checked cell " + currentCellIndex.x + " " + currentCellIndex.y + " lowest cell length " + lowestCells.length);

            //Checking for 3 lowest cells, in the case that 2 paths from goal are equal in distance
            if (lowestCells.length === 3 || lowestCells.length === 2) {
                let cell1Index = getCellIndex(lowestCells[0].x, lowestCells[0].y)
                let cell2Index = getCellIndex(lowestCells[1].x, lowestCells[1].y)
                let vector1 = { x: cell1Index.x - currentCellIndex.x, y: cell1Index.y - currentCellIndex.y }
                let vector2 = { x: cell2Index.x - currentCellIndex.x, y: cell2Index.y - currentCellIndex.y }
                let x = vector1.x + vector2.x;
                let y = vector1.y + vector2.y;
                cell.dVector.x = x;
                cell.dVector.y = y;
                console.log("vectors" + cell.dVector.x + " " + cell.dVector.y);
                console.log("current cell info " + currentCellIndex.x + " " + currentCellIndex.y);
            } else if (lowestCells.length === 1) {
                let cellVector = getCellIndex(lowestCells[0].x, lowestCells[0].y)
                let x = cellVector.x-currentCellIndex.x
                let y = cellVector.y - currentCellIndex.y;
                cell.dVector.x = x;
                cell.dVector.y = y;
                console.log("vectors" + cell.dVector.x + " " + cell.dVector.y);
                console.log("current cell info " + currentCellIndex.x + " " + currentCellIndex.y);
            }

            //Some cells against walls have zero-vectors, stopping movement
            //Assigns movement to the agents nonetheless, as these cells can be accessible in some rare cases
            if (cell.dVector.x === 0 && cell.dVector.y === 0) {
                let cellVector = getCellIndex(lowestCells[0].x, lowestCells[0].y)
                let x = cellVector.x-currentCellIndex.x
                let y = cellVector.y - currentCellIndex.y;
                cell.dVector.x = x;
                cell.dVector.y = y;
                console.log("vectors" + cell.dVector.x + " " + cell.dVector.y);
                console.log("current cell info " + currentCellIndex.x + " " + currentCellIndex.y);
            }
        }
    });
}



export { setEssenVariables, perfMeasure, getCanvasHeight, getCanvasWidth };