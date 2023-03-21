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
const cells = [];

// Create cells and cell properties.
for (let y = 0; y < canvasHeight / cellSize; y++) {
    for (let x = 0; x < canvasWidth / cellSize; x++) {
        const cell = {
            x: x * cellSize,
            y: y * cellSize,
            width: cellSize,
            height: cellSize,
            color: "white",
            isWall: false,
            isExit: false,
            isSpawnPoint: false,
            rect: null
        };
        // push cell to cells array
        cells.push(cell);
    }
}

// Inizially draw cells on canvays
cells.forEach(cell => {
    // ctx.fillStyle = cell.color;
    // ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    // ctx.strokeStyle = 'black';
    // ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    cell.rect = document.createElementNS(svgNS, 'rect');
    cell.rect.setAttribute('width', cell.width);
    cell.rect.setAttribute('height', cell.height);
    cell.rect.setAttribute('x', cell.x);
    cell.rect.setAttribute('y', cell.y);
    cell.rect.setAttribute('stroke', 'black');
    cell.rect.setAttribute('fill', 'white');
    drawingArea.appendChild(cell.rect);
});

let prevIndex = null;
let isDragging = false;

drawingArea.addEventListener("mousedown", (event) => {
    isDragging = true;
    menu.style.visibility = "hidden";
    prevIndex = getCellIndex(event.offsetX, event.offsetY);
    console.log(cells[prevIndex]);
    cellEventHandler(event, prevIndex);
})

drawingArea.addEventListener("mousemove", (event) => {
    if (isDragging == true) {
        nextIndex = getCellIndex(event.offsetX, event.offsetY);
        if (prevIndex != nextIndex) {
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
clearButton = document.querySelector("#clear");
clearButton.addEventListener("click", clearCanvas);

// Add event to "add exit"-button and "add-spawn"-button
let addingExit = false;
let addingSpawn = false;
let prevExit = null;
addExitButton = document.querySelector("#add-exit")
addExitButton.addEventListener("click", () => {
    addingExit = true
})
addSpawnButton = document.querySelector("#add-spawn");
addSpawnButton.addEventListener("click", () => {
    addingSpawn = true;
})


function cellEventHandler(event, index) {
    toggleCellProperties(index)
    drawCell(cells[index])
}



function getCellIndex(x, y) {
    // find cell row and column 
    let row = Math.floor(y / cellSize)
    let column = Math.floor(x / cellSize)
    // return index of cell in cells array (row-major order)
    return row * (canvasWidth / cellSize) + column
}

function toggleCellProperties(index) {
    if (addingExit) {
        cells[index].color = "green";
        cells[index].isExit = true;
        cells[index].isSpawnPoint = false;
        cells[index].isWall = false;
        if (prevExit) {
            prevExit.color = "white";
            prevExit.isExit = false;
            prevExit = cells[index];
        } else {
            prevExit = cells[index];
        }
        addingExit = false;
    } else if (addingSpawn) {
        cells[index].color = "blue"
        cells[index].isExit = false;
        cells[index].isSpawnPoint = true;
        cells[index].isWall = false;
        addingSpawn = false;
    } else if (cells[index].color == "white") {
        cells[index].color = "black";
        cells[index].isWall = true;
    } else if (cells[index].color == "black" || cells[index].color == "green" || cells[index].color == "blue") {
        cells[index].color = "white";
        cells[index].isWall = false;
        cells[index].isExit = false;
        cells[index].isSpawnPoint = false;

    }
    console.log(`cell ${index} has color ${cells[index].color} `)
}

function clearCanvas() {
    cells.forEach(cell => {
        cell.color = "white"
        cell.isWall = false
        cell.isExit = false
        cell.isSpawnPoint = false;
        cell.rect.setAttribute('fill', 'white');
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
function toggleAgentsSubMenu() {
    var submenu = document.getElementById("agents-submenu");
    if (submenu.style.display === "none") {
        submenu.style.display = "block";
    } else {
        submenu.style.display = "none";
    }
}

let spawnButton = document.querySelector("#agents-submenu button:nth-of-type(1)");
let removeButton = document.querySelector("#agents-submenu button:nth-of-type(2)");
let numAgentsInput = document.querySelector("#num-agents");

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
//slutning af emils kode

//Start Simulation
startSim.addEventListener("click", function () {
    populate();
    anime();
})