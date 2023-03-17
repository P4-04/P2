// Initialize canvas and context
// var canvas = document.querySelector(".field")
// var ctx = canvas.getContext("2d");
const svgNS = "http://www.w3.org/2000/svg";
const drawingArea = document.querySelector(".drawing")
const closeMenu = document.getElementById("close");
const openMenu = document.getElementById("open");
const menu = document.querySelector(".menu");

// Define canvas parameters
const canvasWidth = 1000;
const canvasHeight = 1000;
drawingArea.setAttribute('width', canvasWidth);
drawingArea.setAttribute('height', canvasHeight);
const clearButton = document.querySelector("#clear")
clearButton.addEventListener("click", clearAllRects)

let isDraggingOverlay = false;
let cursorCurrentX = 0;
let cursorCurrentY = 0;
let cursorNewX = 0;
let cursorNewY = 0;
let menuHidden = true;

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

const cellSize = 25;

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
      agents: [],
      rect: null
    };
    // push cell to cells array
    cells.push(cell);
  }
}

class Agent {
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
    this.body = document.createElementNS(svgNS, 'circle')
    // this.body.setAttribute('cx', this.x)
    // this.body.setAttribute('cy', this.x)
    this.body.setAttribute('r', this.r)
    const dickTransform = drawingArea.createSVGTransform();
    dickTransform.setTranslate(this.x, this.y);
    this.body.transform.baseVal.appendItem(dickTransform);
    drawingArea.appendChild(this.body);
    
  }
  set setX(x) {
    this.x = x
    this.body.transform("rotate", (1,2,3))
  }
  set setY(y) {
    this.y = y
    this.body.setAttribute('cy', y)
  }
  // setCoordinates: (x, y) => {}

}
agents = []
document.addEventListener("keydown", (event) => {
  if (event.key === "a") {
    agents.push(new Agent(2, 3))
  }
})
// Inizially draw cells on canvas
cells.forEach(cell => {
  // ctx.fillStyle = cell.color;
  // ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
  // ctx.strokeStyle = 'black';
  // ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
  let rect = document.createElementNS(svgNS, 'rect')
  rect.setAttribute('width', cell.width)
  rect.setAttribute('height', cell.height)
  rect.setAttribute('x', cell.x)
  rect.setAttribute('y', cell.y)
  rect.setAttribute('stroke', 'black')
  rect.setAttribute('fill', 'white')
  rect.addEventListener("mousedown", (event) => {
    isDragging = true
    DrawHandler(event, rect)
  })
  rect.addEventListener("mousemove", (event) => {
    if (isDragging){
      DrawHandler(event, rect)
    }
  })
  rect.addEventListener("mouseup", () => {
    isDragging = false
  })
  cell.rect = rect;
  drawingArea.appendChild(rect)
});

let prevRect = null
let isDragging = false

function DrawHandler(event, rect){
  if (!(prevRect === rect)) {
    if (rect.getAttribute('fill') === 'white')
    {
    rect.setAttribute('fill', 'black')
    }
    else
    {
    rect.setAttribute('fill', 'white')
    }
  }
  prevRect = rect;
}

function clearAllRects(){
  cells.forEach(cell => {
    cell.rect.setAttribute('fill', 'white');
  });
}
// canvas.addEventListener("mousedown", (event) => {
//   isDragging = true
//   prevIndex = getCellIndex(event.offsetX, event.offsetY)
//   cellEventHandler(event, prevIndex)
// })

// canvas.addEventListener("mousemove", (event) => {
//   if (isDragging == true) {
//     nextIndex = getCellIndex(event.offsetX, event.offsetY)
//     if (prevIndex != nextIndex) {
//       cellEventHandler(event, nextIndex)
//       prevIndex = nextIndex
//     }
//   }
// })

// canvas.addEventListener("mouseup", () => {
//   isDragging = false
//   prevIndex = null
// })

// // Add event to "Clear"-button
// clearButton = document.querySelector("#clear")
// clearButton.addEventListener("click", clearCanvas)

// // Add event to "add exit"-button
// let addingExit = false
// let prevExit = null
// addExitButton = document.querySelector("#add-exit")
// console.log(addExitButton)
// addExitButton.addEventListener("click", () => {
//   addingExit = true
// })

// function cellEventHandler(event, index) {
//   toggleCellProperties(index)
//   redraw()
// }



// function getCellIndex(x, y) {
//   // find cell row and column 
//   let row = Math.floor(y / cellSize)
//   let column = Math.floor(x / cellSize)
//   // return index of cell in cells array (row-major order)
//   return row * (canvasWidth / cellSize) + column
// }

// function toggleCellProperties(index) {
//   if (addingExit) {
//     cells[index].color = "green"
//     cells[index].isExit = true
//     cells[index].isWall = false
//     if (prevExit) {
//       prevExit.color = "white"
//       prevExit.isExit = false
//       prevExit = cells[index]
//     } else {
//       prevExit = cells[index]
//     }
//     addingExit = false
//   } else if (cells[index].color == "white") {
//     cells[index].color = "black"
//     cells[index].isWall = true
//   } else if (cells[index].color == "black" || cells[index].color == "green") {
//     cells[index].color = "white"
//     cells[index].isWall = false
//     cells[index].isExit = false

//   }
//   console.log(`cell ${index} has color ${cells[index].color} `)
// }

// function clearCanvas() {
//   cells.forEach(cell => {
//     cell.color = "white"
//     cell.isWall = false
//     cell.isExit = false
//   })
//   redraw()
// }


// function redraw() {
//   cells.forEach(cell => {
//     ctx.fillStyle = cell.color;
//     ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
//     ctx.strokeStyle = 'black';
//     ctx.strokeRect(cell.x, cell.y, cell.width, cell.height);
//   });
// }
