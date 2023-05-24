export {
    createGrid, getCellIndex, cellEventHandler, clearCanvas, cellSize, setAddingExit, setAddingSpawn, getAddingExit,
    getAddingSpawn, endPoint, setExits, startPoint, prevExit, svgNS, getCells, drawTxt, getCell, getAgentsInCell, calcCellDensity, getHighestCellDensity, showLiveHeat,
    setShowHeatMap, getShowHeatMap, loadCells, DrawAllCells, setBlockMouse, getBlockMouse, setCellSize, resetHeatmap, resetGrid, resetEndpoint, resetVectors
}
//import { sizeChange } from "../script.js";

//Custom cell size
let cellSize = 25;
let showHeatMap = true;
//Initialize 2d array for cells
let cells = [[]];
//Initialization of variables needed for adding spawn / exit cells
let prevExit = null;
let addingExit = false;
let addingSpawn = false;
let endPoint = [];
let shouldIgnoreMouse = false;
let startPoint = null

const drawingArea = document.querySelector(".drawing");
const svgNS = "http://www.w3.org/2000/svg";

/**
 * Function caller for correctly handling actions on cells
 * @param {{x,y}} index the index of the cell to update
 * @param {boolean} remove 
 * @returns {void}
 */
function cellEventHandler(index, remove) {
    if (getBlockMouse()) {
        return;
    }

    toggleCellProperties(index, remove);
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
 * Updates the cells to their new properties, relative to the selected setting in the dropdown
 * @param {{x,y}} index The position of the cell to update
*/
function toggleCellProperties(index, remove) {

    //Reset cell to default
    if (remove) {
        cells[index.x][index.y].color = "white";
        cells[index.x][index.y].isWall = false;
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].mark = false;
        cells[index.x][index.y].isSpawnPoint = false;
        cells[index.x][index.y].value = 0;
        return;
    }
    //Set cell to exit and add to exit array
    if (addingExit) {
        cells[index.x][index.y].color = "green";
        cells[index.x][index.y].isExit = true;
        cells[index.x][index.y].isSpawnPoint = false;
        cells[index.x][index.y].isWall = false;

        endPoint.push(cells[index.x][index.y]);
        addingExit = false;
    }
    //Set cell to spawn
    else if (addingSpawn) {
        cells[index.x][index.y].color = "blue";
        startPoint = cells[index.x][index.y];
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].isSpawnPoint = true;
        cells[index.x][index.y].isWall = false;
    }
    //Set cell to wall
    else if (cells[index.x][index.y].color == "white") {
        cells[index.x][index.y].color = "black";
        cells[index.x][index.y].isWall = true;
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].mark = true;
        cells[index.x][index.y].value = cells.length * cells[0].length / 3;
    }
    //Set cell to default
    else if (cells[index.x][index.y].color == "black" || cells[index.x][index.y].color == "green" || cells[index.x][index.y].color == "blue") {
        cells[index.x][index.y].color = "white";
        cells[index.x][index.y].isWall = false;
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].mark = false;
        cells[index.x][index.y].isSpawnPoint = false;
        cells[index.x][index.y].value = 0;
    }
}

/**
 * Resets the endPoint array to be empty
 */
function resetEndpoint() {
    endPoint = [];
}

/**
 * Resets all vectors between each new simulation runs
 */
function resetVectors() {
    cells.forEach(column => {
        column.forEach(cell => {
            if (cell.isWall === false) {
                cell.mark = false;
                cell.value = 0;
                cell.dVector.x = 0;
                cell.dVector.y = 0;
                cell.vectorX = 0;
                cell.vectorY = 0;
                cell.dVector = { x: 0, y: 0 };
                cell.agents = [],
                cell.highestDensity = 0;
            }

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

/**
 * Initializes the grid cells with their default properties and calls DrawAllCells
 * @param {int} canvasWidth the width of the canvas 
 * @param {int} canvasHeight the height of the canvas 
 * @param {boolean} sizeChange whenever the cell size is being changed or not 
 */
function createGrid(canvasWidth, canvasHeight, sizeChange) {
    if (sizeChange === true) {
        cells.forEach(row => {
            row.forEach(cell => {
                cell.rect.remove();
            });
        });
    }
    cells = [[]];
    for (let x = 0; x < canvasWidth / cellSize; x++) {
        cells[x] = [];
        for (let y = 0; y < canvasHeight / cellSize; y++) {
            const cell = {
                //Position, size and type
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
                dVector: { x: 0, y: 0 },
                //Collision and heatmap
                agents: [],
                highestDensity: 0,
            };
            //Push cell to cells array
            cells[x][y] = cell;
        }
    }
    DrawAllCells(drawingArea);
}

/**
 * Completly resets the grid 
 */
function resetGrid() {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[0].length; y++) {
            //Type
            cells[x][y].color = "white";
            cells[x][y].isWall = false;
            cells[x][y].isExit = false;
            cells[x][y].isSpawnPoint = false;
            //Vector field values
            cells[x][y].mark = false;
            cells[x][y].value = 0;
            cells[x][y].vectorX = 0;
            cells[x][y].vectorY = 0;
            cells[x][y].dVector.x = 0;
            cells[x][y].dVector.y = 0;
            cells[x][y].dVector = { x: 0, y: 0 };

            //Collision and heatmap
            cells[x][y].agents = [];
            cells[x][y].highestDensity = 0;
            cells[x][y].rect.setAttribute('fill', 'white');
            cells[x][y].agents = [],
                cells[x][y].highestDensity = 0;

        };
    }
}

/**
 * Draws cells on screen using SVG
 */
function DrawAllCells() {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[0].length; y++) {
            cells[x][y].rect = document.createElementNS(svgNS, 'rect');
            cells[x][y].rect.setAttribute('width', cells[x][y].width);
            cells[x][y].rect.setAttribute('height', cells[x][y].height);
            cells[x][y].rect.setAttribute('x', cells[x][y].x);
            cells[x][y].rect.setAttribute('y', cells[x][y].y);
            if (cells[x][y].isWall == true) {
                cells[x][y].rect.setAttribute('fill', 'black');
            }
            else if (cells[x][y].isSpawnPoint == true) {
                cells[x][y].rect.setAttribute('fill', 'blue');
            }
            else if (cells[x][y].isExit == true) {
                cells[x][y].rect.setAttribute('fill', 'green');
            }
            else {
                cells[x][y].rect.setAttribute('fill', 'white');
            }
            cells[x][y].rect.setAttribute('stroke', 'black');
            drawingArea.appendChild(cells[x][y].rect);
        }
    }
}

function loadCells(newCells, newCellSize) {
    let canvasWidth = window.innerWidth - window.innerWidth % cellSize;
    let canvasHeight = window.innerHeight - window.innerHeight % cellSize;
    cellSize = newCellSize;
    createGrid(canvasWidth, canvasHeight);
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[0].length; y++) {
            if (x < newCells.length && y < newCells[0].length) {
                cells[x][y] = newCells[x][y];
            }
        }
    }
    DrawAllCells();
}

/**
 * @returns an array of all cells on the grid
 */
function getCells() { return cells; }

/** 
 * @param {int} x The X position of the cell to find
 * @param {int} y The Y position of the cell to find
 * @returns {cells} the cell we found
*/
function getCell(x, y) { return cells[x][y]; }

/**
 * Takes the isAdding parameter and changes addingExit accordingly. Sets addingSpawn to false 
 * @param {boolean} isAdding if the user wants to add an exit or not
 */
function setAddingExit(isAdding) { addingExit = isAdding; addingSpawn = false };

/**
 * Takes the isAdding parameter and changes addingSpawn accordingly. Sets addingExit to false 
 * @param {boolean} isAdding if the user wants to add an exit or not
 */
function setAddingSpawn(isAdding) { addingSpawn = isAdding; addingExit = false; };

/**
 * Calculates the current density of a cell. If the current density is larger than the highest density, update the variable. 
 * @param {cell} cell the cell to calculate the density for 
 */
function calcCellDensity(cell) {
    let curentDensity = cell.agents.length;
    if (cell.highestDensity < curentDensity) {
        cell.highestDensity = curentDensity;
    }
}

/**
 * 
 * @param {cell} cell the cell to get the density for 
 * @returns the hightest recorded density of the cell
 */
function getHighestCellDensity(cell) {
    return cell.highestDensity;
}

/**
 * Draws heatmap cells ontop of all cells from the cellsToUpdate array
 * @param {cells} cellsToUpdate an array of all cells that agents have moved from, and to
 */
function showLiveHeat(cellsToUpdate) {
    cellsToUpdate.forEach(cell => {
        let density = getHighestCellDensity(cell);
        if (density != 0 && cell.isWall == false && cell.isExit == false && cell.isSpawnPoint == false) {
            cell.rect = document.createElementNS(svgNS, 'rect');
            cell.rect.setAttribute('width', cell.width);
            cell.rect.setAttribute('height', cell.height);
            cell.rect.setAttribute('x', cell.x);
            cell.rect.setAttribute('y', cell.y);
            cell.rect.setAttribute('stroke', 'black');

            //Scaler for maximum agent density on cell

            const scaler = 36; //255 / 7 = 36.4, we round down, and now we have a scaler for our cells (any value over 7 is bad);

            let r = 255;
            let g = 255 - ((scaler) * density);
            let b = 255 - ((scaler) * density);

            if (7 < density) {
                g = 0;
                b = 0;
            }
            let col = "rgb(" + r + "," + g + "," + b + ")";

            cell.rect.setAttribute('fill', col);

            cell.rect.setAttribute('class', "heatCells");
            let cellID = cell.x.toString() + ", " + cell.y.toString();
            let element = document.getElementById(cellID);
            cell.rect.setAttribute("id", cellID);

            if (element != null) {
                element.replaceWith(cell.rect)
            } else {
                drawingArea.appendChild(cell.rect);
            }
        }
    });
}

/**
 * @returns if the user is adding an exit or not
 */
function getAddingExit() { return addingExit; };

/**
 * @returns if the user is adding a spawn area or not
 */
function getAddingSpawn() { return addingSpawn; };

/**
 * @param {cell} cell the cell to get agents from
 * @returns all agents within a cell
 */
function getAgentsInCell(cell) { return cell.agents; };

/**
 * Is called when the user toggles the heatmap on or off. If the heatmap is toggled off, heated cells are removed. If toggeled on, it draws a heatmap cell ontop of all cells that ever contained an agent
 * @param {boolean} shouldDisplay if the heatmap should be displayed or not
 * @returns {void}
 */
function setShowHeatMap(shouldDisplay) {
    showHeatMap = shouldDisplay;
    if (!showHeatMap) {
        let heatedCells = [];
        heatedCells = document.getElementsByClassName("heatCells");

        while (heatedCells.length != 0) {
            heatedCells[0].remove();    
        }
        return;
    }

    if (showHeatMap) {
        for (let x = 0; x < cells.length; x++) {
            for (let y = 0; y < cells[0].length; y++) {
                let density = getHighestCellDensity(cells[x][y]);
                if (density != 0 && cells[x][y].isWall == false && cells[x][y].isExit == false && cells[x][y].isSpawnPoint == false) {
                    cells[x][y].rect = document.createElementNS(svgNS, 'rect');
                    cells[x][y].rect.setAttribute('width', cells[x][y].width);
                    cells[x][y].rect.setAttribute('height', cells[x][y].height);
                    cells[x][y].rect.setAttribute('x', cells[x][y].x);
                    cells[x][y].rect.setAttribute('y', cells[x][y].y);
                    cells[x][y].rect.setAttribute('stroke', 'black');
                    cells[x][y].rect.setAttribute('class', "heatCells");
                    let cellID = cells[x][y].x.toString() + ", " + cells[x][y].y.toString();
                    let element = document.getElementById(cellID);
                    cells[x][y].rect.setAttribute("id", cellID);
                    const scaler = 36; //255 / 7 = 36.4, we round down, and now we have a scaler for our cells (any value over 7 is bad);

                    let r = 255;
                    let g = 255 - ((scaler) * density);
                    let b = 255 - ((scaler) * density);

                    if (7 < density) {
                        g = 0;
                        b = 0;
                    }

                    let col = "rgb(" + r + "," + g + "," + b + ")";

                    cells[x][y].rect.setAttribute('fill', col);

                    drawingArea.appendChild(cells[x][y].rect);
                }
            }
        }

    }
}

/**
 * Resets all density values to 0. Ensures old cells are removed, and turns the heatmap on, if it were before this function call
 */
function resetHeatmap() {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[0].length; y++) {
            cells[x][y].highestDensity = 0;
        }
    }
    let show = getShowHeatMap();
    setShowHeatMap(false);
    setShowHeatMap(show);
}

/**
 * @returns {boolean} if the heatmap is being displayed or not
 */
function getShowHeatMap() { return showHeatMap; }

/**
 * @returns {int} value the size of the cells on the grid
 */
function getCellSize(){ return cellSize;}

/**
 * 
 * @param {int} value the new size of the cells on the grid
 */
function setCellSize(value) { cellSize = value }

/**
 * 
 * @param {cell} exits 
 */
function setExits(exits) { endPoint = exits }

/**
 * @returns {boolean} if the website should ignore all mouse clicks on the grid
 */
function getBlockMouse() { return shouldIgnoreMouse; }

/**
 * @param {boolean} blocMouse sets if the website should ignore all mouse clicks on the grid
 */
function setBlockMouse(blockMouse) { shouldIgnoreMouse = blockMouse; }