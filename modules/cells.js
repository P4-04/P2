export { createGrid, getCellIndex, cellEventHandler, clearCanvas, cellSize, setAddingExit, setAddingSpawn, getAddingExit, 
    getAddingSpawn, endPoint, startPoint, prevExit, svgNS, getCells, drawTxt, getCell, getNeighborCells, getAgentsInCell, drawVectors}

//Custom cell size
const cellSize = 25;
//Initialize 2d array for cells
let cells = [[]];
//Initialization of variables needed for adding spawn / exit cells
let prevExit = null;
let addingExit = false;
let addingSpawn = false;
let endPoint = null
let startPoint = null

const drawingArea = document.querySelector(".drawing");
const svgNS = "http://www.w3.org/2000/svg";

//Function caller for correctly handling actions on cells
function cellEventHandler(index) {
    toggleCellProperties(index);
    drawCell(cells[index.x][index.y]);
}

/** 
 * @param {int} MouseX The mouse X position on the screen
 * @param {int} MouseY The mouse Y position on the screen
 * @returns {Cords} x and y coordinate of our cell (relative to our grid)
*/
function getCellIndex(MouseX, MouseY) {
    // find cell row and column 
    let x = Math.floor(MouseX / cellSize);
    let y = Math.floor(MouseY / cellSize);
    // return index of cell in cells array (row-major order)
    const Cords = { x, y };
    return Cords;
}

/** 
 * @param {Cords} index The position of the cell to update
*/
function toggleCellProperties(index) {
    if (addingExit) {
        cells[index.x][index.y].color = "green";
        cells[index.x][index.y].isExit = true;
        cells[index.x][index.y].isSpawnPoint = false;
        cells[index.x][index.y].isWall = false;

        endPoint = cells[index.x][index.y];

        if (prevExit) {
            prevExit.color = "white";
            prevExit.isExit = false;
            prevExit = cells[index.x][index.y];
        } else {
            prevExit = cells[index.x][index.y];
        }
        addingExit = false;
    } else if (addingSpawn) {
        cells[index.x][index.y].color = "blue";
        startPoint = cells[index.x][index.y];
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].isSpawnPoint = true;
        cells[index.x][index.y].isWall = false;
    } else if (cells[index.x][index.y].color == "white") {
        cells[index.x][index.y].color = "black";
        cells[index.x][index.y].isWall = true;
        cells[index.x][index.y].mark = true;
        cells[index.x][index.y].value = cells.length * cells[0].length / 3;
    } else if (cells[index.x][index.y].color == "black" || cells[index.x][index.y].color == "green" || cells[index.x][index.y].color == "blue") {
        cells[index.x][index.y].color = "white";
        cells[index.x][index.y].isWall = false;
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].mark = false;
        cells[index.x][index.y].isSpawnPoint = false;
        cells[index.x][index.y].value = 0;
    }
}

/**
 * resets the grid to the default
*/
function clearCanvas() {
    cells.forEach(column => {
        column.forEach(cell => {
            cell.color = "white";
            cell.isWall = false;
            cell.isExit = false;
            cell.isSpawnPoint = false;
            cell.rect.setAttribute('fill', 'white');
        });
    });
}

/**
 * Updates a cell
 * @param {cell} cell the cell to update
*/
function drawCell(cell) {
    cell.rect.setAttribute('fill', cell.color);
}
function drawTxt(cell, value) {
    let numbering = document.createElementNS(svgNS, "text")
    numbering.setAttribute('x', cell.x)
    numbering.setAttribute('y', cell.y+17)
    numbering.classList.add('svgText');
    if (cell.isWall){
        numbering.setAttribute('fill', "white");
    }
    numbering.textContent = Math.round(value);
    drawingArea.appendChild(numbering)
}

/**
 * Initializes our grid-cells with their default properties and calls DrawAllCells
*/
function createGrid(canvasWidth, canvasHeight) {
    for (let x = 0; x < canvasWidth / cellSize; x++) {
        cells[x] = [];
        for (let y = 0; y < canvasHeight / cellSize; y++) {
            const cell = {
                x: x * cellSize,
                y: y * cellSize,
                width: cellSize,
                height: cellSize,
                color: "white",
                isWall: false,
                isExit: false,
                isSpawnPoint: false,
                //Vector field values
                mark: false,
                value: 0,
                vectorX: 0,
                vectorY: 0,
                dVector: {x: 0, y: 0},
                //Collision stuff
                agents: []
            };
            //Push cell to cells array
            cells[x][y] = cell;
        }
    }
    DrawAllCells(drawingArea);
}

/**
 * Draws our cells on screen using SVG
 */
function DrawAllCells() {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[0].length; y++) {
            cells[x][y].rect = document.createElementNS(svgNS, 'rect');
            cells[x][y].rect.setAttribute('width', cells[x][y].width);
            cells[x][y].rect.setAttribute('height', cells[x][y].height);
            cells[x][y].rect.setAttribute('x', cells[x][y].x);
            cells[x][y].rect.setAttribute('y', cells[x][y].y);
            cells[x][y].rect.setAttribute('stroke', 'black');
            cells[x][y].rect.setAttribute('fill', 'white');
            drawingArea.appendChild(cells[x][y].rect);
        }
    }
}

function getCells(){ return cells; }
/** 
 * @param {int} x The X position of the cell to find
 * @param {int} y The Y position of the cell to find
 * @returns {cell} the cell we found
*/
function getCell(x, y){ return cells[x][y]; }

function setAddingExit(isAdding) { addingExit = isAdding };
function setAddingSpawn(isAdding) { addingSpawn = isAdding };

function getNeighborCells(x,y)
{
    let cell = getCell(x,y);
    let neighbors = [];
    //Get x neighbors
    if (cell.x != 0) {
        neighbors[0] = cells[(cell.x / cellSize) - 1][cell.y / cellSize];
    }

    if (cell.y != 0) {
        neighbors[2] = cells[cell.x / cellSize][(cell.y / cellSize) - 1];
    }

    if (cell.x != cells[cells.length - 1][cells[0].length - 1].x) {
        neighbors[1] = cells[(cell.x / cellSize) + 1][cell.y / cellSize];
    }

    if (cell.y != cells[0][cells[0].length - 1].y) {
        neighbors[3] = cells[cell.x / cellSize][(cell.y / cellSize) + 1];
    }


    if (neighbors[0] == undefined) {
        neighbors.splice(0, 0)
    }
    if (neighbors[1] == undefined) {
        neighbors.splice(1, 1)
    }
    if (neighbors[2] == undefined) {
        neighbors.splice(2, 2)
    }
    if (neighbors[3] == undefined) {
        neighbors.splice(3, 3)
    }
    //Visualisation of the neighbors
    // neighbors.forEach(neig => {
    //          neig.color = "purple";
    //          neig.rect.setAttribute('fill', neig.color);
    //          console.log(neig.x + " " + neig.y);
    //      });
    // console.log(neighbors.length);
    return neighbors;
}

function getAddingExit() { return addingExit; };
function getAddingSpawn() { return addingSpawn; };

function getAgentsInCell(cell) { return cell.agents; };


//Draw vectors
function drawVectors(cell, value) {
    let numbering = document.createElementNS(svgNS, "text")
    numbering.setAttribute('x', cell.x+12)
    numbering.setAttribute('y', cell.y+17)
    numbering.classList.add('svgText');
    if (cell.isWall){
        numbering.setAttribute('fill', "white");
    }
    //numbering.textContent = Math.round(value);
    numbering.textContent = value;
    drawingArea.appendChild(numbering)
}