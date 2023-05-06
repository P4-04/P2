import { setEssenVariables, perfMeasure } from './modules/pathfinding.js';
import { addSpawnArea, getSpawnAreas, populate, removeAgentsFromArea, animateCaller, setSizes, getAgents, updateAgentColors } from './modules/agents.js';
import { createGrid, getCellIndex, cellEventHandler, clearCanvas, cellSize, setAddingExit, setAddingSpawn, getAddingExit, getAddingSpawn, endPoint, startPoint, prevExit, getCells, DrawAllCells, toggleHeat, 
    setShowHeatMap, getShowHeatMap, setBlockMouse, getBlockMouse, setCellSize, resetHeatmap } from './modules/cells.js';
import { getAllDesignNames, saveDesign, loadDesign, removeDesign } from './modules/designmanager.js';
//import { func } from 'prop-types';

//Initialize DOM elements
const closeMenu = document.querySelector("#close");
const openMenu = document.querySelector("#open");
const simButton = document.querySelector("#simButton");
const numAgents = document.querySelector("#numAgents");
const toggleDesignsSubmenu = document.querySelector("#toggleLoadSubmenu");
const loadSelectedButton = document.querySelector("#loadSelected");
const showDesignsDropdown = document.querySelector("#showDesignsDropdownButton");
const toggleSaveSubmenu = document.querySelector("#toggleSaveSubmenu");
const saveButton = document.querySelector("#saveButton");

const velocitySlider = document.querySelector("#velocitySlider");

//<input type="color" id="colorPicker" value="#ff0000">
const colorPicker = document.querySelector("#colorPicker");

const cellSlider = document.querySelector("#cellSlider");
const sizeDisplay = document.querySelector("#sizeDisplay");

const menu = document.querySelector(".menu");
const menuHandle = document.querySelector(".menu-handle")
const drawingArea = document.querySelector(".drawing");

const toggle = document.querySelector("#toggleDisplay");

const clearButton = document.querySelector("#clear");
const addExitButton = document.querySelector("#addExit");
const addSpawnButton = document.querySelector("#addSpawn");

const toggleAgentsSubmenu = document.querySelector("#agentsButton");
// const loadSubmenu = document.querySelector("#loadSubmenu")
const spawnButton = document.querySelector("#spawnButton");
const removeButton = document.querySelector("#removeButton");
const removeSelected = document.querySelector("#removeSelected") 
const  numAgentsInput = document.querySelector("#num-agents");
const toggleGridsSubmenu = document.querySelector("#gridsButton");

//
//
//Menu features - open / close / drag / clear / spawn / exit
//
//

//Event listener for the color picker
colorPicker.addEventListener('input', () => {
    updateAgentColors(colorPicker.value);
});
  
//Initialization of variables for overlay
let isDraggingOverlay = false;
let isMouseDown = false;
let cursorCurrentX = 0;
let cursorCurrentY = 0;
let cursorNewX = 0;
let cursorNewY = 0;

let menuHidden = true;

//Event listeners for menu open / close / drag / clear / spawn / exit
menuHandle.addEventListener("mousedown", function (event) {
    isMouseDown = true;
    isDraggingOverlay = false;
    cursorCurrentX = event.clientX;
    cursorCurrentY = event.clientY;
});

menuHandle.addEventListener("mouseup", function () {
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

cellSlider.addEventListener("mousemove", function () {
    sizeDisplay.textContent = cellSlider.value;
})

let sizeChange = false;

cellSlider.addEventListener("mouseup", function() {
    sizeDisplay.textContent = cellSlider.value;
    setCellSize(cellSlider.value);

    canvasWidth = window.innerWidth - window.innerWidth % cellSize;
    canvasHeight = window.innerHeight - window.innerHeight % cellSize;
    drawingArea.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
    drawingArea.setAttribute('width', canvasWidth);
    drawingArea.setAttribute('height', canvasHeight);

    sizeChange = true;
    createGrid(canvasWidth, canvasHeight);
    sizeChange = false;
});

//Event listener for changing velocity of agents
velocitySlider.addEventListener("input", function () {
    let agents = getAgents();
    let sliderValue = parseFloat(velocitySlider.value);
    agents.forEach(agent => {
        agent.setSpeedModifier(sliderValue);
    });
});


// cellSlider.oninput = function() {
//     sizeDisplay.textContent = cellSlider.value;
//     setCellSize(cellSlider.value);
//     console.log("cellSize " + cellSize);

//     canvasWidth = window.innerWidth - window.innerWidth % cellSize;
//     canvasHeight = window.innerHeight - window.innerHeight % cellSize;
//     drawingArea.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
//     drawingArea.setAttribute('width', canvasWidth);
//     drawingArea.setAttribute('height', canvasHeight);

//     createGrid(canvasWidth, canvasHeight);

// }



// Add event to "Clear"-button
//let clearButton = document.querySelector("#clear");
clearButton.addEventListener("click", clearCanvas);

// Add event to "add exit"-button and "add-spawn"-button
//let addExitButton = document.querySelector("#addExit");
addExitButton.addEventListener("click", () => {
    setAddingExit(true);

});

//let addSpawnButton = document.querySelector("#addSpawn");
addSpawnButton.addEventListener("click", () => {
    setAddingSpawn(true);
});

function refreshDesignsDropdown() {
    showDesignsDropdown.length = 0;
    let designs = getAllDesignNames();
    for (let designName of designs) {
        let design = document.createElement("option");
        design.setAttribute("value", designName)
        design.innerText = `${designName}`
        showDesignsDropdown.appendChild(design)
    }
}

//Event to change the state of the submenu
function toggleSubmenu(submenuName) {
    const submenus = ["agentsSubmenu", "gridsSubmenu"];

    submenus.forEach((submenu) => {
      if (submenu !== submenuName) {
        const otherSubmenu = document.querySelector(`#${submenu}`);
        otherSubmenu.style.display = "none";
      }
    });

    let submenu = document.querySelector(`#${submenuName}`);
    if (submenu.style.display === "none") {
      submenu.style.display = "block";
      document.querySelector("#loadSubmenu").style.display = "none";
      document.querySelector("#saveSubmenu").style.display = "none";
    } else {
      submenu.style.display = "none";
    }
  }  

//Event listeners for agents submenu
toggleAgentsSubmenu.addEventListener("click", function () {
    toggleSubmenu("agentsSubmenu");
});

//Event listerns for grids submenu
toggleGridsSubmenu.addEventListener("click", function () {
    toggleSubmenu("gridsSubmenu");
});

toggleDesignsSubmenu.addEventListener("click", function() {
    let submenu = document.querySelector("#loadSubmenu");
    if (submenu.style.display === "none") {
        refreshDesignsDropdown();
        submenu.style.display = "block";
        document.querySelector("#saveSubmenu").style.display = "none";
        document.querySelector("#agentsSubmenu").style.display = "none";
        document.querySelector("#gridsSubmenu").style.display = "none";
        // let designs = getAllDesignNames();
        // for (let designName of designs) {
        //     let design = document.createElement("option");
        //     design.setAttribute("value", designName)
        //     design.innerText = `${designName}`
        //     showDesignsDropdown.appendChild(design)
        // }
    } else {
        submenu.style.display = "none";
        showDesignsDropdown.length = 0;
    }
})

loadSelectedButton.addEventListener("click", function () {
    loadDesign(showDesignsDropdown.value);
})

removeSelected.addEventListener("click", function () {
    removeDesign(showDesignsDropdown.value);
    refreshDesignsDropdown();
})

showDesignsDropdown.addEventListener("click", async function () {
    // designsDropdown.classList.toggle("show");
    // if (designsDropdown.classList.contains("show")){

})

toggleSaveSubmenu.addEventListener("click", function () {
    let submenu = document.querySelector("#saveSubmenu");
    if (submenu.style.display === "none") {
        submenu.style.display = "block";
        document.querySelector("#loadSubmenu").style.display = "none";
        document.querySelector("#agentsSubmenu").style.display = "none";
        document.querySelector("#gridsSubmenu").style.display = "none";
    } else {
        submenu.style.display = "none";
    }
})

saveButton.addEventListener("click", function () {
    let designName = document.querySelector("#designName").value;
    let warningLabel = document.querySelector("#warningLabel");

    if (designName.length > 0) {
        warningLabel.style.display = "none";
        saveDesign(getCells(), getSpawnAreas(), designName, cellSize);
    }
    else {
        warningLabel.style.display = "block";
    }
})

// loadDesignButton.addEventListener("click", function () {
//     deserializeGrid(serializeGrid(getCells()))
// })

removeButton.addEventListener("click", function () {
    let agentNumToRemove = document.querySelector("#numAgents").value;
    if (isNaN(agentNumToRemove) || agentNumToRemove <= 0) {
        window.alert("Please enter a valid number of agents to remove");
        return;
    }

    let totalCells = 0;
    let spawnAreas = getSpawnAreas();
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
        removedAgents += removeAgentsFromArea(area, agentsToRemovePerArea, drawingArea);
    });
});

//Event listener for starting simulation
simButton.addEventListener("click", function () {

    // Check if the start button has been clicked and change it to "Stop simulation" if it has
    if (simButton.innerText === "Start simulation") {
        // if (startPoint === null) {
        //     alert("Missing a start point!");
        //     return;
        // }
        
        if (endPoint === null) {
            alert("Missing a exit point!");
            return;
        }

        simButton.innerText = "Stop simulation";
    
        resetHeatmap();
        setEssenVariables(canvasWidth, canvasHeight, cellSize);
        perfMeasure(getCells(), endPoint, startPoint);
    
        setSizes(canvasWidth, canvasHeight)
        populate();
        setBlockMouse(true);
      
        animateCaller()
        
        //toggleHeat();

        
    } else {
        let agents = getAgents();
        while (agents.length != 0)
        {
            agents[0].destroy();
        }
        //agents.forEach(agent => {
            
        //});
        simButton.innerText = "Start simulation";
    }
});

toggle.addEventListener("click", function () {
    setShowHeatMap(getShowHeatMap() ? false : true);
});


//
//
//SVG canvas - initialization and drawing
//
//



//Define canvas parameters and setting svg attributes
let canvasWidth = window.innerWidth - window.innerWidth % cellSize;
let canvasHeight = window.innerHeight - window.innerHeight % cellSize;
drawingArea.setAttribute('viewBox', `0 0 ${canvasWidth} ${canvasHeight}`);
drawingArea.setAttribute('width', canvasWidth);
drawingArea.setAttribute('height', canvasHeight);


createGrid(canvasWidth, canvasHeight);


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
    if (getAddingSpawn()) {
        return;
    }

    isDragging = true;
    menu.style.visibility = "hidden";
    prevIndex = getCellIndex(event.clientX, event.clientY);
    cellEventHandler(prevIndex);
});

drawingArea.addEventListener("mousemove", (event) => {
    if (event.buttons !== 1) {
        isDragging = false;
    }

    if (getAddingSpawn()) {
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
    if (getAddingSpawn()) {
        return;
    }

    isDragging = false;
    setAddingSpawn(false);
    prevIndex = null;
    if (menuHidden === false) {
        menu.style.visibility = "visible";
    }
});

//Initialization of variables needed for adding custom rectangular spawn area
let startingCell;

drawingArea.addEventListener("mousedown", (event) => {

    if (getAddingSpawn()) {
        isDragging = true;
        startingCell = getCellIndex(event.offsetX, event.offsetY);
        prevIndex = getCellIndex(event.offsetX, event.offsetY);
        cellEventHandler(prevIndex);
    }
});

drawingArea.addEventListener("mousemove", (event) => {
    if (getAddingSpawn() && isDragging) {
        let nextIndex = getCellIndex(event.offsetX, event.offsetY);
        if (prevIndex.x != nextIndex.x || prevIndex.y != nextIndex.y) {
            switch (true) {
                case (nextIndex.x >= startingCell.x && nextIndex.y <= startingCell.y): // first quadrant 
                    if (nextIndex.x == startingCell.x || nextIndex.y == startingCell.y) {
                        let x = prevIndex.x
                        for (let y = prevIndex.y; y <= startingCell.y; ++y) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                        let y = prevIndex.y;
                        for (let x = prevIndex.x; x >= startingCell.x; --x) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.x < prevIndex.x) {
                        let x = prevIndex.x;
                        for (let y = prevIndex.y; y <= startingCell.y; ++y) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.y > prevIndex.y) {
                        let y = prevIndex.y;
                        for (let x = prevIndex.x; x >= startingCell.x; --x) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    } else {
                        for (let x = nextIndex.x; x >= startingCell.x; --x) {
                            for (let y = nextIndex.y; y <= startingCell.y; ++y) {
                                let index = { x, y };
                                cellEventHandler(index);
                            }
                        }
                    }
                    break;
                case (nextIndex.x <= startingCell.x && nextIndex.y <= startingCell.y): // second quadrant
                    if (nextIndex.y == startingCell.y) {
                        let y = prevIndex.y;
                        for (let x = prevIndex.x; x <= startingCell.x; ++x) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.x > prevIndex.x) {
                        let x = prevIndex.x;
                        for (let y = prevIndex.y; y <= startingCell.y; ++y) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.y > prevIndex.y) {
                        let y = prevIndex.y;
                        for (let x = prevIndex.x; x <= startingCell.x; ++x) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    } else {
                        for (let x = nextIndex.x; x <= startingCell.x; ++x) {
                            for (let y = nextIndex.y; y <= startingCell.y; ++y) {
                                let index = { x, y };
                                cellEventHandler(index);
                            }
                        }
                    }
                    break;
                case (nextIndex.x <= startingCell.x && nextIndex.y >= startingCell.y): // 3th quadrant
                    if (nextIndex.x == startingCell.x) {
                        let x = prevIndex.x
                        for (let y = prevIndex.y; y >= startingCell.y; --y) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.x > prevIndex.x) {
                        let x = prevIndex.x;
                        for (let y = prevIndex.y; y >= startingCell.y; --y) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.y < prevIndex.y) {
                        let y = prevIndex.y;
                        for (let x = prevIndex.x; x <= startingCell.x; ++x) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    } else {
                        for (let x = nextIndex.x; x <= startingCell.x; ++x) {
                            for (let y = nextIndex.y; y >= startingCell.y; --y) {
                                let index = { x, y };
                                cellEventHandler(index);
                            }
                        }
                    }
                    break;
                case (nextIndex.x >= startingCell.x && nextIndex.y >= startingCell.y): // 4th quadrant
                    if (nextIndex.x < prevIndex.x) {
                        let x = prevIndex.x;
                        for (let y = prevIndex.y; y >= startingCell.y; --y) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    }
                    if (nextIndex.y < prevIndex.y) {
                        let y = prevIndex.y;
                        for (let x = prevIndex.x; x >= startingCell.x; --x) {
                            let index = { x, y };
                            cellEventHandler(index, "remove");
                        }
                    } else {
                        for (let x = nextIndex.x; x >= startingCell.x; --x) {
                            for (let y = nextIndex.y; y >= startingCell.y; --y) {
                                let index = { x, y };
                                cellEventHandler(index);
                            }
                        }
                    }
                    break;
            }
            prevIndex = nextIndex;
        }
    }
});

drawingArea.addEventListener("mouseup", (event) => {
    if (getAddingSpawn()) {
        isDragging = false;
        setAddingSpawn(false);
        let spawnGroup = [];
        let finalCell = getCellIndex(event.offsetX, event.offsetY);
        switch (true) {
            case (finalCell.x > startingCell.x && finalCell.y < startingCell.y): // 1st quadrant
                for (let x = finalCell.x; x >= startingCell.x; --x) {
                    for (let y = finalCell.y; y <= startingCell.y; ++y) {
                        let index = { x, y };
                        spawnGroup.push(index);
                    }
                }
                break;
            case (finalCell.x > startingCell.x && finalCell.y > startingCell.y): // 2th quadrant
                for (let x = finalCell.x; x >= startingCell.x; --x) {
                    for (let y = finalCell.y; y >= startingCell.y; --y) {
                        let index = { x, y };
                        spawnGroup.push(index);
                    }
                }
                break;
            case (finalCell.x < startingCell.x && finalCell.y > startingCell.y): // 3th quadrant
                for (let x = finalCell.x; x <= startingCell.x; ++x) {
                    for (let y = finalCell.y; y >= startingCell.y; --y) {
                        let index = { x, y };
                        spawnGroup.push(index);
                    }
                }
                break;
            case (finalCell.x < startingCell.x && finalCell.y < startingCell.y): // 4th quadrant
                for (let x = finalCell.x; x <= startingCell.x; ++x) {
                    for (let y = finalCell.y; y <= startingCell.y; ++y) {
                        let index = { x, y };
                        spawnGroup.push(index);
                    }
                }
                break;
            case (finalCell.x == startingCell.x && finalCell.y == startingCell.y): // single cells
                let x = finalCell.x;
                let y = finalCell.y;
                let index = { x, y };
                spawnGroup.push(index);
                break;
            case (finalCell.x > startingCell.x && finalCell.y == startingCell.y): // When doing a horisontal line where x gets smaller
                for (let x = startingCell.x; x <= finalCell.x; ++x) {
                    let y = finalCell.y;
                    let index = { x, y };
                    spawnGroup.push(index);
                }
                break;
            case (finalCell.x < startingCell.x && finalCell.y == startingCell.y): // When doing a horisontal line where x gets larger
                for (let x = finalCell.x; x <= startingCell.x; ++x) {
                    let y = finalCell.y;
                    let index = { x, y };
                    spawnGroup.push(index);
                }
                break;
            case (finalCell.x == startingCell.x && finalCell.y < startingCell.y): // When doing a vertical line where y gets smaller
                for (let y = finalCell.y; y <= startingCell.y; ++y) {
                    let x = finalCell.x;
                    let index = { x, y };
                    spawnGroup.push(index);
                }

                break;
            case (finalCell.x == startingCell.x && startingCell.y < finalCell.y): // When doing a vertical line where y gets larger
                for (let y = startingCell.y; y <= finalCell.y; ++y) {
                    let x = finalCell.x;
                    let index = { x, y };
                    spawnGroup.push(index);
                }

                break;
        }
        addSpawnArea(spawnGroup);
    }
});

window.addEventListener("mousemove", function (event) {
    //Checks if the primary mouse button is NOT pressed and updates the isMouseDown variable accordingly.
    //event.buttons {1 == primary, 2 == secondary, 4 == auxiliary(middle)}
    if (event.buttons !== 1) {
        isMouseDown = false;
    }

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

        // Call the resetMenuPosition function
        resetMenuPosition();
    } else {
        isDraggingOverlay = false;
    }
});

function resetMenuPosition() {
    const menuRect = menu.getBoundingClientRect();
    const openMenuRect = openMenu.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;

    if (menuRect.top < 0) {
        menu.style.top = "0px";
        openMenu.style.top = "0px";
    }

    if (menuRect.left < 0) {
        menu.style.left = "0px";
        openMenu.style.left = "0px";
    }

    if (menuRect.bottom > windowHeight) {
        menu.style.top = (windowHeight - menuRect.height) + "px";
        openMenu.style.top = (windowHeight - menuRect.height) + "px";
    }

    if (menuRect.right > windowWidth) {
        menu.style.left = (windowWidth - menuRect.width) + "px";
        openMenu.style.left = (windowWidth - menuRect.width) + "px";
    }
}

export { sizeChange, simButton, colorPicker};