// Initialize canvas and context
let canvas = document.querySelector(".field");
let ctx = canvas.getContext("2d");
let closeMenu = document.getElementById("close");
let openMenu = document.getElementById("open");
let menu = document.querySelector(".menu");

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
    }
})

menu.addEventListener("mouseup", function () {
    isDraggingOverlay = false;
})

// Define canvas parameters
const canvasWidth = 1200;
const canvasHeight = 600;
canvas.width = canvasWidth;
canvas.height = canvasHeight;

const cellSize = 25;

//For later checks:
//This is a requirement for correct cell distribution:
//canvasWidth && canvasHeight % cellSize === 0
//Otherwise, canvas dimensions can be rounded:
//Math.floor((canvasWidth && canvasHeight) / cellSize) * cellSize

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
            agents: []
        };
        // push cell to cells array
        cells.push(cell);
    }
}

// Inizially draw cells on canvas
cells.forEach(cell => {
    ctx.fillStyle = cell.color;
    ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
});

let prevIndex = null
let isDragging = false

canvas.addEventListener("mousedown", (event) => {
    isDragging = true   
    menu.style.visibility = "hidden";
    prevIndex = getCellIndex(event.offsetX, event.offsetY)
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
clearButton = document.querySelector("#clear")
clearButton.addEventListener("click", clearCanvas)

// Add event to "add exit"-button
let addingExit = false
let prevExit = null
addExitButton = document.querySelector("#add-exit")
console.log(addExitButton)
addExitButton.addEventListener("click", () => {
    addingExit = true
})

function cellEventHandler(event, index) {
    toggleCellProperties(index)
    redraw()
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
        cells[index].color = "green"
        cells[index].isExit = true
        cells[index].isWall = false
        if (prevExit) {
            prevExit.color = "white"
            prevExit.isExit = false
            prevExit = cells[index]
        } else {
            prevExit = cells[index]
        }
        addingExit = false
    } else if (cells[index].color == "white") {
        cells[index].color = "black"
        cells[index].isWall = true
    } else if (cells[index].color == "black" || cells[index].color == "green") {
        cells[index].color = "white"
        cells[index].isWall = false
        cells[index].isExit = false

    }
    console.log(`cell ${index} has color ${cells[index].color} `)
}

function clearCanvas() {
    cells.forEach(cell => {
        cell.color = "white"
        cell.isWall = false
        cell.isExit = false
    })
    redraw()
}


function redraw() {
    cells.forEach(cell => {
        ctx.fillStyle = cell.color;
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        ctx.strokeStyle = 'black';
        ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
    });
}
