//import { initCellValues } from './modules/pathfinding.js';
//Initialize DOM elements
const closeMenu = document.querySelector("#close");
const openMenu = document.querySelector("#open");
const startSim = document.querySelector("#start");
const numAgents = document.querySelector("#numAgents");
const menu = document.querySelector(".menu");
const svgNS = "http://www.w3.org/2000/svg";
const drawingArea = document.querySelector(".drawing");

const popButton = document.querySelector("#populate");
const clearButton = document.querySelector("#clear");
const addExitButton = document.querySelector("#addExit");
const addSpawnButton = document.querySelector("#addSpawn");

const toggleAgentsSubmenu = document.querySelector("#agentsButton");
const spawnButton = document.querySelector("#spawnButton");
const removeButton = document.querySelector("#removeButton");
let numAgentsInput = document.querySelector("#num-agents");

//
//
//Menu features - open / close / drag / clear / spawn / exit
//
//

//Initialization of variables for overlay
let isDraggingOverlay = false;
let isMouseDown = false;
let cursorCurrentX = 0;
let cursorCurrentY = 0;
let cursorNewX = 0;
let cursorNewY = 0;

//let popButton = document.querySelector("#populate");
popButton.addEventListener("click", populate);


//Initialization of variables needed for adding spawn / exit cells
let addingExit = false;
let addingSpawn = false;
let prevExit = null;

let menuHidden = true;

//Event listeners for menu open / close / drag / clear / spawn / exit
menu.addEventListener("mousedown", function (event) {
    isMouseDown = true;
    isDraggingOverlay = false;
    cursorCurrentX = event.clientX;
    cursorCurrentY = event.clientY;
});

menu.addEventListener("mouseup", function () {
    isMouseDown = false;
    isDraggingOverlay = false;
});

closeMenu.addEventListener("click", function () {
    isMouseDown = false;
    menuHidden = true;
    if (isDraggingOverlay === false) {
        menuHidden = true;
        openMenu.style.visibility = "visible";
        menu.style.visibility = "hidden";
    }
});

openMenu.addEventListener("mousedown", function (event) {
    isMouseDown = true;
    isDraggingOverlay = false;
    cursorCurrentX = event.clientX;
    cursorCurrentY = event.clientY;
});

document.addEventListener("mousemove", function (event) {
        cursorNewX = cursorCurrentX - event.clientX;
        cursorNewY = cursorCurrentY - event.clientY;
        if ((cursorCurrentX !== cursorNewX || cursorCurrentY !== cursorNewY) && isMouseDown === true) {
            isDraggingOverlay = true;
            cursorCurrentX = event.clientX;
            cursorCurrentY = event.clientY;
            menu.style.left = (menu.offsetLeft - cursorNewX) + "px";
            menu.style.top = (menu.offsetTop - cursorNewY) + "px";
            openMenu.style.left = (menu.offsetLeft - cursorNewX) + "px";
            openMenu.style.top = (menu.offsetTop - cursorNewY) + "px";
        }
});

openMenu.addEventListener("mouseup", function () {
    isMouseDown = false;
    if (isDraggingOverlay === false) {
        menuHidden = false;
        openMenu.style.visibility = "hidden";
        menu.style.visibility = "visible";
    } 
});

// Add event to "Clear"-button
//let clearButton = document.querySelector("#clear");
clearButton.addEventListener("click", clearCanvas);

// Add event to "add exit"-button and "add-spawn"-button
//let addExitButton = document.querySelector("#addExit");
addExitButton.addEventListener("click", () => {
    addingExit = true;
});

//let addSpawnButton = document.querySelector("#addSpawn");
addSpawnButton.addEventListener("click", () => {
    addingSpawn = true;
});

//Event listeners for agents submenu
toggleAgentsSubmenu.addEventListener("click", function () {
    let submenu = document.querySelector("#agentsSubmenu");
    if (submenu.style.display === "none") {
        submenu.style.display = "block";
    } else {
        submenu.style.display = "none";
    }
});

spawnButton.addEventListener("click", function () {
    populate();
});

removeButton.addEventListener("click", function () {
    let agentNumToRemove = document.querySelector("#numAgents").value;
    if (isNaN(agentNumToRemove) || agentNumToRemove <= 0) {
        window.alert("Please enter a valid number of agents to remove");
        return;
    }

    let totalCells = 0;
    spawnAreas.forEach(area => {
        totalCells += area.length;
    });

    let removedAgents = 0;
    spawnAreas.forEach((area, index) => {
        let ratio = area.length / totalCells;
        let agentsToRemovePerArea = Math.floor(ratio * agentNumToRemove);
        if (index === spawnAreas.length - 1) {
            agentsToRemovePerArea = agentNumToRemove - removedAgents;
        }
        removedAgents += removeAgentsFromArea(area, agentsToRemovePerArea);
    });
});


function removeAgentsFromArea(area, agentsToRemovePerArea) {
    let removedAgents = 0;
    let agentsInArea = agents.filter(agent => {
        return area.some(cell => {
            return cell.x === Math.floor(agent.x / cellSize) && cell.y === Math.floor(agent.y / cellSize);
        });
    });

    let totalAgentsInArea = agentsInArea.length;
    let agentsToRemove = Math.min(agentsToRemovePerArea, totalAgentsInArea);
    let agentsToKeep = [];

    for (let i = 0; i < agents.length; i++) {
        if (agentsToRemove > 0 && agentsInArea.includes(agents[i])) {
            drawingArea.removeChild(agents[i].body);
            removedAgents++;
            agentsToRemove--;
        } else {
            agentsToKeep.push(agents[i]);
        }
    }

    agents = agentsToKeep;
    return removedAgents;
}

//Event listener for starting simulation
startSim.addEventListener("click", function () {
    if (startPoint === null) {
        alert("Missing a start point!");
        return;
    }

    if (endPoint === null) {
        alert("Missing a exit point!");
        return;
    }

    //initCellValues(cells, endPoint, startPoint);
    //AStar
    //populate();
    anime();
});

// //Start Simulation
// startSim.addEventListener("click", function () {
//     //populate();
//     anime();
// });



//
//
//SVG canvas - initialization and drawing
//
//

//Custom cell size
const cellSize = 25;

//Define canvas parameters and setting svg attributes
const canvasWidth = window.innerWidth - window.innerWidth % cellSize;
const canvasHeight = window.innerHeight - window.innerHeight % cellSize;
drawingArea.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
drawingArea.setAttribute('width', canvasWidth);
drawingArea.setAttribute('height', canvasHeight);

//Initialize 2d array for cells
let cells = [[]];

CreateGrid();

/**
 * Initializes our grid-cells with their default properties and calls DrawAllCells
*/
function CreateGrid() {
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
                //Values for AStar
                f: 0,
                g: 0,
                h: 0,
                vh: 0
            };
            //Push cell to cells array
            cells[x][y] = cell;
        }
    }
    DrawAllCells();
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

//
//
//Drawing on canvas - draw / drag 
//
//

//Initialization of variables for checking cell indexes
let prevIndex = null;
let nextIndex = null;
let isDragging = false;

drawingArea.addEventListener("mousedown", (event) => {
    if (addingSpawn) {
        return;
    }
    isDragging = true;
    menu.style.visibility = "hidden";
    prevIndex = getCellIndex(event.clientX, event.clientY);
    cellEventHandler(prevIndex);
});

drawingArea.addEventListener("mousemove", (event) => {
    if (addingSpawn) {
        return;
    }
    if (isDragging == true) {
        nextIndex = getCellIndex(event.clientX, event.clientY);
        if (prevIndex.x !== nextIndex.x || prevIndex.y !== nextIndex.y) {
            cellEventHandler(nextIndex);
            prevIndex = nextIndex;
        }
    }
});

drawingArea.addEventListener("mouseup", () => {
    if (addingSpawn) {
        return;
    }
    isDragging = false;
    addingSpawn = false;
    prevIndex = null;
    if (menuHidden === false) {
        menu.style.visibility = "visible";
    }
});

//Initialization of variables needed for adding custom rectangular spawn area
let startingCell;
let spawnAreas = [];

drawingArea.addEventListener("mousedown", (event) => {
    if (addingSpawn) {
        isDragging = true;
        startingCell = getCellIndex(event.offsetX, event.offsetY);
        prevIndex = getCellIndex(event.offsetX, event.offsetY);
        cellEventHandler(prevIndex);
    }
});

drawingArea.addEventListener("mousemove", (event) => {
    if (addingSpawn && isDragging) {
        let nextIndex = getCellIndex(event.offsetX, event.offsetY);
        if (prevIndex.x != nextIndex.x || prevIndex.y != nextIndex.y) {
            for (let x = nextIndex.x; x >= startingCell.x; --x) {
                for (let y = nextIndex.y; y >= startingCell.y; --y) {
                    let index = { x, y };
                    cellEventHandler(index);
                }
            }
            prevIndex = nextIndex;
        }
    }
});

drawingArea.addEventListener("mouseup", (event) => {
    if (addingSpawn) {
        isDragging = false;
        addingSpawn = false;
        let spawnGroup = [];
        let finalCell = getCellIndex(event.offsetX, event.offsetY);
        for (let x = finalCell.x; x >= startingCell.x; --x) {
            for (let y = finalCell.y; y >= startingCell.y; --y) {
                let index = { x, y };
                spawnGroup.push(index);
            }
        }
        spawnAreas.push(spawnGroup);
    }
});

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
    } else if (cells[index.x][index.y].color == "black" || cells[index.x][index.y].color == "green" || cells[index.x][index.y].color == "blue") {
        cells[index.x][index.y].color = "white";
        cells[index.x][index.y].isWall = false;
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].isSpawnPoint = false;
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

//
//
//Agents - Initializatoin / populating
//
//

//Initializing array of agents
let agents = [];

//Agents class with relevant svg attributes
class Agent {
    constructor(x, y, fattiness) {
        this.x = x;
        this.y = y;
        this.fattiness = fattiness;
        this.body = document.createElementNS(svgNS, 'circle');
        this.body.setAttribute('r', this.fattiness);
        let xyTransform = drawingArea.createSVGTransform();
        xyTransform.setTranslate(this.x, this.y);
        this.body.transform.baseVal.appendItem(xyTransform);
        drawingArea.appendChild(this.body);
    }
    setCoordinates(x, y) {
        this.x = x;
        this.y = y;
        let xyTransform = drawingArea.createSVGTransform();
        xyTransform.setTranslate(this.x, this.y);
        this.body.transform.baseVal[0] = xyTransform;
    }
}

//Calculation of agent distribution for individual cell population
function populate() {
    if (spawnAreas.length == 0) {
        window.alert("Please add spawn areas");
        return;
    }
    let totalCells = 0;
    let agentNum = null;
    agentNum = document.querySelector("#numAgents").value;
    // Count the total number of spawn area cells
    spawnAreas.forEach(area => {
        totalCells += area.length;
    });

    let agentsSpawned = 0;
    spawnAreas.forEach((area, index) => {
        let ratio = area.length / totalCells;
        let agentsPerArea = Math.floor(ratio * agentNum);
        if (index === spawnAreas.length - 1) {
            agentsPerArea = agentNum - agentsSpawned;
        }
        agentsSpawned += agentsPerArea;
        populateCells(area, agentsPerArea);
    });
}

//Drawing calculated amount of agents in each spawn area
function populateCells(area, agentsPerArea) {
    let firstCell = area[area.length - 1];
    let lastCell = area[0];
    //let areaSize = { x: lastCell.x - firstCell.x, y: lastCell.y - firstCell.y };
    for (let i = 0; i < agentsPerArea; ++i) {
        let fattiness = (Math.floor(Math.random() * 3) + 5);
        let x = getRandomArbitrary(firstCell.x * cellSize + fattiness, lastCell.x * cellSize + cellSize - fattiness);
        let y = getRandomArbitrary(firstCell.y * cellSize + fattiness, lastCell.y * cellSize + cellSize - fattiness);
        let agent = new Agent(x, y, fattiness);
        agents.push(agent);
    }
}

//Getting position within spawn area
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

//
//
//Move agents - Animate / collision
//
//

//Animate function, sets random position
function anime() {
    agents.forEach(agent => {
        let x = (agent.x + Math.random() * 2) - 1;
        let y = (agent.y + Math.random() * 2) - 1;
        agent.setCoordinates(x, y);

        /*let collision = false;

        let pt = (agent.x, agent.y);

        let poly = getCellPath(cells[getCellIndex(agent.x, agent.y)]);
        isPointInPoly(poly, pt);

        //if (collision === false) {
            let arithmetic = Math.random();
            let x = (agent.x + Math.random() * 3);
            let y = (agent.y + Math.random() * 3);
            while (x >= canvasWidth && y >= canvasHeight && cells[getCellIndex(x, y)].isWall) {
                x = (agent.x + Math.random() * 5);
                y = (agent.y + Math.random() * 5);
            }
            agent.setCoordinates(x, y)*/
        //}

        // if (arithmetic <= 0.25) {
        //     agent.x = (agent.x + Math.random() * 3);
        //     agent.y = (agent.y + Math.random() * 3);
        // }
        // else if (arithmetic > 0.25 && arithmetic <= 0.5) {
        //     agent.x = (agent.x + Math.random() * 3);
        //     agent.y = (agent.y - Math.random() * 3);
        // }
        // else if (arithmetic > 0.5 && arithmetic <= 0.75) {
        //     agent.x = (agent.x - Math.random() * 3);
        //     agent.y = (agent.y + Math.random() * 3);
        // }
        // else {
        //     agent.x = (agent.x - Math.random() * 3);
        //     agent.y = (agent.y - Math.random() * 3);
        // }

        // let xyTransform = drawingArea.createSVGTransform();
        // xyTransform.setTranslate(agent.x, agent.y);
        // agent.body.transform.baseVal[0] = xyTransform;

    });

    //Calls recursively 60 times per second
    requestAnimationFrame(anime);
}

//Finding bounding circumference of given cells, used for border interference detection in collision
function getCellPath(cell) {
    let closedPath = [];
    for (let i = 0; i < 4; i++) {
        if (i === 0) {
            let x = cell.rect.getAttribute("x");
            let y = cell.rect.getAttribute("y");
            closedPath.push({ x, y });
        }
        else if (i === 1) {
            let x = cell.rect.getAttribute("x") + cellSize;
            let y = cell.rect.getAttribute("y");
            closedPath.push({ x, y });
        }
        else if (i === 2) {
            let x = cell.rect.getAttribute("x") + cellSize;
            let y = cell.rect.getAttribute("y") + cellSize;
            closedPath.push({ x, y });
        }
        else if (i === 3) {
            let x = cell.rect.getAttribute("x");
            let y = cell.rect.getAttribute("y") + cellSize;
            closedPath.push({ x, y });
        }
    }
    return closedPath;
}

//Got from https://www.inkfood.com/collision-detection-with-svg/
//poly is an array of points in cartesian space representing a closed path
//pt is the point to be checked
//if it is within the closed path, collision is detected 
function isPointInPoly(poly, pt) {
    for (var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
            && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
            && (c = !c);
    return c;
}

//
//
//Pathfinding
//
//

/**pathfinding stuff*/
let endPoint = null;
let startPoint = null;