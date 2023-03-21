//Redrawing agents -> Track if an agent has updated -> Draw
//Check which method works best for drawing all agents, if chosen -> Rabussys or Maximussys
// Initialize canvas and context
let closeMenu = document.getElementById("close");
let openMenu = document.getElementById("open");
let startSim = document.getElementById("start");
let menu = document.querySelector(".menu");
const svgNS = "http://www.w3.org/2000/svg";
const drawingArea = document.querySelector(".drawing")

//Open and close menu
let menuHidden = true;

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

//Draggable overlay
let isDraggingOverlay = false;
let cursorCurrentX = 0;
let cursorCurrentY = 0;
let cursorNewX = 0;
let cursorNewY = 0;

/**pathfinding stuff*/
let EndPoint = null;
let StartPoint = null;

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
const cellSize = 25;

// Define canvas parameters
const canvasWidth = window.innerWidth - window.innerWidth % cellSize;
const canvasHeight = window.innerHeight - window.innerHeight % cellSize;
drawingArea.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
drawingArea.setAttribute('width', canvasWidth);
drawingArea.setAttribute('height', canvasHeight);
// canvas.width = canvasWidth;
// canvas.height = canvasHeight;

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

let prevIndex = null;
let nextIndex = null;
let isDragging = false;

drawingArea.addEventListener("mousedown", (event) => {
    isDragging = true;
    menu.style.visibility = "hidden";
    prevIndex = getCellIndex(event.clientX, event.clientY);
    console.log(cells[prevIndex.x, prevIndex.y]);
    cellEventHandler(event, prevIndex);
})

drawingArea.addEventListener("mousemove", (event) => {
    if (isDragging == true) {
        nextIndex = getCellIndex(event.clientX, event.clientY);
        if (prevIndex.x !== nextIndex.x || prevIndex.y !== nextIndex.y) {
            cellEventHandler(event, nextIndex);
            prevIndex = nextIndex;
        }
    }
})

drawingArea.addEventListener("mouseup", () => {
    isDragging = false;
    prevIndex = null;
    if (menuHidden === false) {
        menu.style.visibility = "visible";
    }
})

// Add event to "Clear"-button
let clearButton = document.querySelector("#clear");
clearButton.addEventListener("click", clearCanvas);

// Add event to "add exit"-button and "add-spawn"-button
let addingExit = false;
let addingSpawn = false;
let prevExit = null;
let addExitButton = document.querySelector("#addExit")
addExitButton.addEventListener("click", () => {
    addingExit = true
})
let addSpawnButton = document.querySelector("#addSpawn");
addSpawnButton.addEventListener("click", () => {
    addingSpawn = true;
})


function cellEventHandler(event, index) {
    toggleCellProperties(index);
    drawCell(cells[index.x][index.y]);
}



function getCellIndex(MouseX, MouseY) {
    // find cell row and column 
    let x = Math.floor(MouseX / cellSize);
    let y = Math.floor(MouseY / cellSize);
    // return index of cell in cells array (row-major order)
    const Cords = { x, y };
    return Cords;
}

function toggleCellProperties(index) {
    if (addingExit) {
        cells[index.x][index.y].color = "green";
        cells[index.x][index.y].isExit = true;
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
    console.log(`cell ` + index.x, index.y + ` has color ${cells[index.x][index.y].color} `)
}

function clearCanvas() {
    cells.forEach(column => {
        column.forEach(cell => {
            cell.color = "white"
            cell.isWall = false
            cell.isExit = false
            cell.isSpawnPoint = false;
            cell.rect.setAttribute('fill', 'white');
        })
    })
}

function drawCell(cell) {
    cell.rect.setAttribute('fill', cell.color);
}

let agents = [];

class Agent {
    constructor(x, y, fattiness) {
        this.x = x;
        this.y = y;
        this.fattiness = fattiness;
        this.body = document.createElementNS(svgNS, 'circle')
        this.body.setAttribute('r', this.fattiness)
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

function populate() {
    for (let i = 1; i <= 10; i++) {
        let x = (Math.floor(Math.random() * canvasWidth))
        let y = (Math.floor(Math.random() * canvasHeight))
        let fattiness = (Math.floor(Math.random() * 3) + 5)

        let agent = new Agent(x, y, fattiness)
        agents.push(agent);
    }
}

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

    })
    requestAnimationFrame(anime);
}

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

//emils kode
// function toggleAgentsSubMenu() {
//     let submenu = document.getElementById("agents-submenu");
//     if (submenu.style.display === "none") {
//         submenu.style.display = "block";
//     } else {
//         submenu.style.display = "none";
//     }
// }

// let spawnButton = document.querySelector("#agents-submenu button:nth-of-type(1)");
// let removeButton = document.querySelector("#agents-submenu button:nth-of-type(2)");
// let numAgentsInput = document.querySelector("#num-agents");

// spawnButton.addEventListener("click", function () {
//     let numAgents = parseInt(numAgentsInput.value);
//     for (let i = 0; i < numAgents; i++) {
//         let x = Math.floor(Math.random() * canvasWidth);
//         let y = Math.floor(Math.random() * canvasHeight);
//         let fattiness = Math.floor(Math.random() * 3) + 5;
//         let agent = new Agent(x, y, fattiness);
//         agents.push(agent);
//     }
// });

// removeButton.addEventListener("click", function () {
//     let numAgents = parseInt(numAgentsInput.value);
//     for (let i = 0; i < numAgents; i++) {
//         let agent = agents.pop();
//         drawingArea.removeChild(agent.body);
//     }
// });
//slutning af emils kode

//Alternativ emilkode
let toggleAgentsSubmenu = document.getElementById("agentsButton");
let spawnButton = document.getElementById("spawnButton");
let removeButton = document.getElementById("removeButton");
let numAgentsInput = document.querySelector("#numAgents");

toggleAgentsSubmenu.addEventListener("click", function () {
    let submenu = document.getElementById("agentsSubmenu");
    if (submenu.style.display === "none") {
        submenu.style.display = "block";
    } else {
        submenu.style.display = "none";
    } 
})

spawnButton.addEventListener("click", function () {
    let numAgents = parseInt(numAgentsInput.value);
    for (let i = 0; i < numAgents; i++) {
        let x = Math.floor(Math.random() * canvasWidth);
        let y = Math.floor(Math.random() * canvasHeight);
        let fattiness = Math.floor(Math.random() * 3) + 5;
        let agent = new Agent(x, y, fattiness);
        agents.push(agent);
    }
});

removeButton.addEventListener("click", function () {
    let numAgents = parseInt(numAgentsInput.value);
    for (let i = 0; i < numAgents; i++) {
        let agent = agents.pop();
        drawingArea.removeChild(agent.body);
    }
});



//Start Simulation
startSim.addEventListener("click", function () {
    populate();
    anime();
})