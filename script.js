//Redrawing agents -> Track if an agent has updated -> Draw
//Check which method works best for drawing all agents, if chosen -> Rabussys or Maximussys
// Initialize canvas and context
import { initCellValues } from './modules/pathfinding.js';
//export default es6;
let canvas = document.querySelector(".field");
let ctx = canvas.getContext("2d");
let closeMenu = document.getElementById("close");
let openMenu = document.getElementById("open");
let menu = document.querySelector(".menu");
//const svgNS = "http://www.w3.org/2000/svg";
//let svgElement = document.createElementNS(svgNS, "svg");
let StartSim = document.getElementById("start");
//Open and close menu
let menuHidden = true;

//testing stuff
let StartPoint = null;
let EndPoint = null;

const Cords = { x: 0, y: 0 };

closeMenu.addEventListener("click", function () {
    menuHidden = true;
    openMenu.style.visibility = "visible";
    menu.style.visibility = "hidden";
})

openMenu.addEventListener("click", function () {
    menuHidden = false;
    openMenu.style.visibility = "hidden";
    menu.style.visibility = "visible";
})

StartSim.addEventListener("click", function () {
    if (StartPoint === null) {
        console.log("Missing start point");
        return;
    }

    if (EndPoint === null) {
        console.log("Missing exit point");
        return;
    }

    initCellValues(cells, EndPoint, StartPoint);
    //AStar
})

//Draggable overlay
let isDraggingOverlay = false;
let cursorCurrentX = 0;
let cursorCurrentY = 0;
let cursorNewX = 0;
let cursorNewY = 0;

menu.addEventListener("mousedown", function (event) {
    isDraggingOverlay = true;
    cursorCurrentX = event.clientX;
    cursorCurrentY = event.clientY;
})

document.addEventListener("mousemove", function (event) {
    if (isDraggingOverlay === true) {
        cursorNewX = cursorCurrentX - event.clientX;
        cursorNewY = cursorCurrentY - event.clientY;
        cursorCurrentX = event.clientX;
        cursorCurrentY = event.clientY;
        menu.style.left = (menu.offsetLeft - cursorNewX) + "px";
        menu.style.top = (menu.offsetTop - cursorNewY) + "px";
        openMenu.style.left = (menu.offsetLeft - cursorNewX) + "px";
        openMenu.style.top = (menu.offsetTop - cursorNewY) + "px";
    }
})

menu.addEventListener("mouseup", function () {
    isDraggingOverlay = false;
})
const cellSize = 25; //Probably not less than 15

// Define canvas parameters
const canvasWidth = window.innerWidth - window.innerWidth % cellSize;
const canvasHeight = window.innerHeight - window.innerHeight % cellSize;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

// Initizialize array for cells
let cells = [[]];

CreateGrid();
// Create cells and cell properties.
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
            // push cell to cells array
            cells[x][y] = cell;
        }
    }
    DrawAllCells();
}

// Inizially draw cells on canvays
function DrawAllCells() {
    for (let x = 0; x < cells.length; x++) {
        for (let y = 0; y < cells[0].length; y++) {
            ctx.fillStyle = cells[x][y].color;
            ctx.fillRect(cells[x][y].x, cells[x][y].y, cells[x][y].width, cells[x][y].height);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(cells[x][y].x, cells[x][y].y, cells[x][y].width, cells[x][y].height);
        }
    }
}

let prevIndex = null
let isDragging = false

canvas.addEventListener("mousedown", (event) => {
    isDragging = true;
    menu.style.visibility = "hidden";
    prevIndex = getCellIndex(event.clientX, event.clientY);
    console.log(cells[prevIndex.x, prevIndex.y]);
    cellEventHandler(event, prevIndex)
})

canvas.addEventListener("mousemove", (event) => {
    if (isDragging == true) {
        nextIndex = getCellIndex(event.offsetX, event.offsetY)
        if (prevIndex != nextIndex) {
            cellEventHandler(event, nextIndex)
            prevIndex = nextIndex
        }
    }
})

canvas.addEventListener("mouseup", () => {
    isDragging = false
    prevIndex = null
    if (menuHidden === false) {
        menu.style.visibility = "visible";
    }
})

// Add event to "Clear"-button
let clearButton = document.querySelector("#clear")
clearButton.addEventListener("click", clearCanvas)

// Add event to "add exit"-button and "add-spawn"-button
let addingExit = false
let addingSpawn = false;
let prevExit = null
let addExitButton = document.querySelector("#add-exit")

addExitButton.addEventListener("click", () => {
    addingExit = true
})

let addSpawnButton = document.querySelector("#add-spawn");

addSpawnButton.addEventListener("click", () => {
    addingSpawn = true;
})


function cellEventHandler(event, index) {
    toggleCellProperties(index)
    drawCell(cells[index.x][index.y])
}



function getCellIndex(MouseX, MouseY) {
    // find cell row and column 
    let x = Math.floor(MouseX / cellSize)
    let y = Math.floor(MouseY / cellSize)
    // return index of cell in cells array (row-major order)
    const Cords = {x, y};
    return Cords;
}

function toggleCellProperties(index) {
    if (addingExit) {
        cells[index.x][index.y].color = "green"
        cells[index.x][index.y].isExit = true
        cells[index.x][index.y].isSpawnPoint = false;
        cells[index.x][index.y].isWall = false

        EndPoint = cells[index.x][index.y];

        if (prevExit) {
            prevExit.color = "white"
            prevExit.isExit = false
            prevExit = cells[index.x][index.y]
        } else {
            prevExit = cells[index.x][index.y]
        }
        addingExit = false
    } else if (addingSpawn) {
        cells[index.x][index.y].color = "blue"
        StartPoint = cells[index.x][index.y];
        cells[index.x][index.y].isExit = false;
        cells[index.x][index.y].isSpawnPoint = true
        cells[index.x][index.y].isWall = false
        addingSpawn = false
    } else if (cells[index.x][index.y].color == "white") {
        cells[index.x][index.y].color = "black"
        cells[index.x][index.y].isWall = true
    } else if (cells[index.x][index.y].color == "black" || cells[index.x][index.y].color == "green" || cells[index.x][index.y].color == "blue") {
        cells[index.x][index.y].color = "white"
        cells[index.x][index.y].isWall = false
        cells[index.x][index.y].isExit = false
        cells[index.x][index.y].isSpawnPoint = false;

    }
    console.log(`cell `+ index.x, index.y +` has color ${cells[index.x][index.y].color} `)
}

function clearCanvas() {
    for (let x = 0; x < cells.length; x++)
    {
        for (let y = 0; y < cells[0].length; y++)
        {
            cell[x][y].color = "white"
            cell[x][y].isWall = false
            cell[x][y].isExit = false
            cell[x][y].isSpawnPoint = false;

        }
    }

    redraw()
}

function drawCell(cell) {
    ctx.fillStyle = cell.color;
    ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
}


function redraw() {
    for (let x = 0; x < cells.length; x++)
    {
        for (let y = 0; y < cells[0].length; y++)
        {
            ctx.fillStyle = cell[x][y].color;
            ctx.fillRect(cell[x][y].x, cell[x][y].y, cell[x][y].width, cell[x][y].height);
            ctx.strokeStyle = 'black';
            ctx.strokeRect(cell[x][y].x, cell[x][y].y, cell[x][y].width, cell[x][y].height);
        }
    }

}

let agents = [];


function populate() {
    for (let i = 1; i <= 30; i++) {
        const agent = {
            x: (Math.floor(Math.random() * canvasWidth)),
            y: (Math.floor(Math.random() * canvasHeight)),
            fattiness: (Math.floor(Math.random() * 3) + 5),
            //body: document.createElementNS(svgNS, 'circle'),
        }
        /*// agent.body.setAttribute('cx', agent.x);
        // agent.body.setAttribute('cy', agent.y);
        agent.body.setAttribute('r', agent.fattiness);
        let transformDick = svgElement.createSVGTransform();
        transformDick.setTranslate(agent.x, agent.y);
        agent.body.transform.baseVal.appendItem(transformDick);
        canvas.appendChild(agent.body);*/
        agents.push(agent);
    }

    agents.forEach(agent => {
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.fattiness, 0, 2 * Math.PI);
        ctx.fillStyle = "blue"
        ctx.fill();
    })
}

populate();

//Need to delete old agent positions without clearing whole canvas
function anime() {
    agents.forEach(agent => {
        //ctx.translate(agent.x+5, agent.y+100)

        ctx.beginPath();
        ctx.arc((agent.x), (agent.y), agent.fattiness, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();

        agent.x += 1;
        agent.y += 1;
        ctx.beginPath();
        ctx.arc((agent.x), (agent.y), agent.fattiness, 0, 2 * Math.PI);
        ctx.fillStyle = "blue"
        ctx.fill();
    })
    requestAnimationFrame(anime);
}

anime();

//Generate paths for each agent using pathfinding (A* or Dijkstra)
// OR generate a path 'master' path and have agents path find to the closest point on the master path
//If an agent is about to collide with another (use either the pythagorean theorem or vector math) generate path around the agent

//Consider using RVO/RVO2 https://gamma.cs.unc.edu/RVO2/
//Or just detect all agents around us, and adapt the agent speed to avoid collision
//or detect all agents infront of us for example FOV 90 degrees, and adapt on what we 'see'
//we can always change the FOV range or other paramteres depending on the agent speed