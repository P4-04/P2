export { populate, removeAgentsFromArea, animateCaller, getSpawnAreas, addSpawnArea, setSizes, setSpawnAreas, getAgents, updateAgentColors}
import { simButton, colorPicker} from '../script.js';
import { cellSize, svgNS, getCells, getCell, endPoint, calcCellDensity, showLiveHeat, getShowHeatMap, setBlockMouse } from './cells.js'
import { calculateVectors } from './pathfinding.js'
import { updateFPSCounter } from './utils.js'


const drawingArea = document.querySelector(".drawing");
let counter = document.querySelector("#agentCount");
let spawnAreas = [];
//Initializing array of agents
let agents = [];
//Max speed increase: 0.2, for a realistic speed of around 1.2-1.4 metres per second
//Higher values allow for higher speeds, or further movement per recursion
let maxSpeedIncrease = 0.6;
let deletedAgentsCount = 0;

let exceededAgents = 0;

let canvasWidth = 0;
let canvasHeight = 0;

function setSizes(Width, Height) {
    canvasWidth = Width
    canvasHeight = Height;
}

//Agents class with relevant svg attributes
class Agent {
    constructor(x, y, fattiness) {
        this.x = x;
        this.y = y;
        this.prevCell2 = { x: null, y: null }
        this.currVector = { x: 0, y: 0 }
        this.fattiness = fattiness;
        this.body = document.createElementNS(svgNS, 'circle');
        this.body.setAttribute('r', this.fattiness);

        let xyTransform = drawingArea.createSVGTransform();
        xyTransform.setTranslate(this.x, this.y);
        this.body.transform.baseVal.appendItem(xyTransform);

        drawingArea.appendChild(this.body);

        this.SpeedModifier = Math.random() * maxSpeedIncrease + 1.2;
        //Old cell for transition vector, smooting out movement
        this.prevCell = null;
        this.prevCellFract = null;
        //Used to make sure we identify the correct agent in notifyCell
        this.myNumber = agents.length + 1;
        agents.forEach(agent => {
            if (agent.myNumber == this.myNumber && agent !== this) {
                this.myNumber = this.myNumber + 1;
            }

        });

        //The cell this agent is currently in
        this.myCell = null;

        this.squareX = Math.ceil(x - (fattiness * Math.sqrt(2) / 2));
        this.squareY = Math.ceil(y - (fattiness * Math.sqrt(2) / 2));

        this.square = {
            x,
            y,
            width: fattiness,
            height: fattiness,
            topLeft: 0,
            topRight: 0,
            bottomRight: 0,
            bottomLeft: 0,
            middle: fattiness / 2
        }

        // drawingArea.appendChild(this.rect);
    }
    setSpeedModifier(speedModifier) {
        this.SpeedModifier = speedModifier;
    }
    setCoordinates(x, y) {
        this.x = x;
        this.y = y;
        this.squareX = Math.ceil(x - (this.fattiness * Math.sqrt(2) / 2));
        this.squareY = Math.ceil(x - (this.fattiness * Math.sqrt(2) / 2));


        let xyTransform = drawingArea.createSVGTransform();
        xyTransform.setTranslate(this.x, this.y);
        if (!getShowHeatMap()) {
            this.body.transform.baseVal[0] = xyTransform;
            this.body.setAttribute('fill-opacity', '100')
        }
        else {
            this.body.setAttribute('fill-opacity', '0');
        }
        this.square.topLeft = x;
        this.square.topRight = y;
        this.square.bottomRight = x + this.fattiness;
        this.square.bottomLeft = y + this.fattiness;
    }
    updateAgentCell() {
        let cellX = Math.floor(this.x / cellSize);
        let cellY = Math.floor(this.y / cellSize);
        this.notifyCell(cellX, cellY);
    }
    //Keeps track of number of agents on cell
    notifyCell(cellX, cellY) {
        let currentCell = getCell(cellX, cellY);
        if (this.myCell == null) {
            this.myCell = currentCell;
        }

        if (getShowHeatMap()) {
            cellsToUpdate.push(this.myCell);
            cellsToUpdate.push(currentCell);
        }
        let me = this.myCell.agents.find(agent => agent == this.myNumber);

        let index = this.myCell.agents.indexOf(me);
        this.myCell.agents.splice(index, 1);

        this.myCell = currentCell;
        this.myCell.agents.push(this.myNumber);

        calcCellDensity(this.myCell);
    }
    getAgentCell() {
        return this.myCell;
    }
    destroy() {
        deletedAgentsCount = deletedAgentsCount + 1;
        //destroy agent body
        this.body.remove();
        //remove from agent array
        let me = agents.find(agent => agent.myNumber === this.myNumber);
        let index = agents.indexOf(me);
        //agents[index] == null;
        //console.log(agents.length);
        agents.splice(index, 1);
        for (let i = index; i < agents.length; i++) {
            if (agents[i].myCell != null) { // Add null check here
                let me = agents[i].myCell.agents.find(agent => agent == agents[i].myNumber);
                let index = agents[i].myCell.agents.indexOf(me);
                agents[i].myCell.agents.splice(index, 1);
                agents[i].myNumber = i + 1;
                agents[i].myCell.agents.push(agents[i].myNumber);
                agents[i].notifyCell(agents[i].myCell.x / cellSize, agents[i].myCell.y / cellSize,);
            }
        }
        //remove from cell (avoid collision check)
        if (this.myCell && this.myCell.agents) { // Add null check here
            let me = this.myCell.agents.find(agent => agent == this.myNumber);
            let index = this.myCell.agents.indexOf(me);
            this.myCell.agents.splice(index, 1);
        }
        me = null;
        if (agents.length == 0) {
            setBlockMouse(false);
        }
    }
}

//Function to set a new color for all agents
function updateAgentColors(newColor) {
    let agents = getAgents();
    agents.forEach(agent => {
        agent.body.setAttribute('fill', newColor);
    });
}

//Function for evenlt distributing agents among total spawn area
function populate() {
    if (spawnAreas.length == 0) {
        window.alert("Please add spawn areas");
        return;
    }
    let totalCells = 0;
    let agentNum = null;
    agentNum = document.querySelector("#numAgents").value;
    spawnAreas.forEach(area => {
        totalCells += area.length;
    });

    //the minimum distance between agents
    const minAgentDistance = cellSize / 3;
    const maxAgents = totalCells * Math.floor((cellSize - minAgentDistance) / minAgentDistance);
    if (agentNum > maxAgents) {
        exceededAgents = agentNum - maxAgents;
        agentNum = maxAgents;
    }

    let agentsSpawned = 0;
    spawnAreas.forEach((area, index) => {
        let ratio = area.length / totalCells;
        let agentsPerArea = Math.floor(ratio * agentNum);
        if (index === spawnAreas.length - 1) {
            agentsPerArea = agentNum - agentsSpawned;
        }
        agentsSpawned += agentsPerArea;
        populateCells(area, agentsPerArea, minAgentDistance);
    });
}

//Spawning agent randomly within correct area
function populateCells(area, agentsPerArea, minAgentDistance) {
    let firstCell = area[area.length - 1];
    let lastCell = area[0];
    let fattiness = ((cellSize / 6) + Math.floor(Math.random() * 3));

    //increase the padding to ensure agents are not placed too close to the border
    let padding = minAgentDistance;
    //add a limit to the number of tries
    let maxTries = 100;

    for (let i = 0; i < agentsPerArea; ++i) {
        let validPosition = false;
        let x, y;
        //initialize tries counter
        let tries = 0;
        //add tries limit to the condition
        while (!validPosition && tries < maxTries) {
            x = getRandomArbitrary(firstCell.x * cellSize + fattiness + padding, lastCell.x * cellSize + Math.floor(cellSize) - fattiness - padding);
            y = getRandomArbitrary(firstCell.y * cellSize + fattiness + padding, lastCell.y * cellSize + Math.floor(cellSize) - fattiness - padding);
            validPosition = checkAgentDistance(x, y, minAgentDistance);
            //increment tries counter
            tries++;
        }
        //only create an agent if there's a valid position
        if (validPosition) {
            let agent = new Agent(x, y, fattiness);
            agents.push(agent);
        }
        //If no valid positions are found, spawn these agents later
        else {
            exceededAgents++;
        }
    }
}

function checkAgentDistance(x, y, minAgentDistance) {
    for (let agent of agents) {
        let distance = Math.sqrt(Math.pow(agent.x - x, 2) + Math.pow(agent.y - y, 2));
        //increase the distance check to also include the agent's fattiness
        if (distance < minAgentDistance + agent.fattiness * 2) {
            return false;
        }
    }
    return true;
}

//Spawns agents which could not be spawned earlier
function spawnExceededAgents() {
    const minAgentDistance = cellSize / 3;
    const padding = minAgentDistance / 2;
    for (let area of spawnAreas) {
        for (let cell of area) {
            let fattiness = ((cellSize / 6) + Math.floor(Math.random() * 3));
            let x = getRandomArbitrary(cell.x * cellSize + fattiness + padding, (cell.x + 1) * cellSize - fattiness - padding);
            let y = getRandomArbitrary(cell.y * cellSize + fattiness + padding, (cell.y + 1) * cellSize - fattiness - padding);
            if (checkAgentDistance(x, y, minAgentDistance)) {
                let agent = new Agent(x, y, fattiness);
                agents.push(agent);
                exceededAgents--;
                if (exceededAgents <= 0) {
                    break;
                }
            }
        }
        if (exceededAgents <= 0) {
            break;
        }
    }
}

//Getting position within spawn area
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

function getAgents() {
    return agents;
}

let cellsToUpdate = [];
//Animate function, sets random position
function animate(start) {
    let i = 0, len = agents.length;
    let cells = getCells();
    while (i < len) {
        if (agents[i] != null) {
            //Calculate next position for agent based on current cell vector
            let x = Math.floor(agents[i].x / cellSize);
            let y = Math.floor(agents[i].y / cellSize);
            let newX = agents[i].x + ((cells[x][y].dVector.x) * agents[i].SpeedModifier) / 3;
            let newY = agents[i].y + ((cells[x][y].dVector.y) * agents[i].SpeedModifier) / 3;

            //Applies decreasing fractions of previous vector to current vector
            //Agent move further away from walls during corner turns
            if (getCell(x, y).dVector.x !== getCell(Math.floor(newX / cellSize), Math.floor(newY / cellSize)).dVector.x ||
                getCell(x, y).dVector.y !== getCell(Math.floor(newX / cellSize), Math.floor(newY / cellSize)).dVector.y) {
                agents[i].prevCell = getCell(x, y);
                agents[i].prevCellFract = 50;
                getCell(x, y).agents.splice(agents[i].myNumber, 1);
            }

            //Remove fraction of previous vector if fraction is too small
            if (agents[i].prevCellFract <= 5) {
                agents[i].prevCell = null;
                agents[i].prevCellFract = null;
            }
            //If a fraction exists, apply it to current vector
            else if (agents[i].prevCellFract !== null) {
                let prevVectorX = agents[i].prevCell.dVector.x * agents[i].prevCellFract;
                let prevVectorY = agents[i].prevCell.dVector.y * agents[i].prevCellFract;
                newX = agents[i].x + ((cells[x][y].dVector.x / (agents[i].prevCellFract) + (prevVectorX / agents[i].prevCellFract)) * agents[i].SpeedModifier) / 7;
                newY = agents[i].y + ((cells[x][y].dVector.y / (agents[i].prevCellFract) + (prevVectorY / agents[i].prevCellFract)) * agents[i].SpeedModifier) / 7;
                //Decrease fraction for each move
                agents[i].prevCellFract -= 1;
            }

            //Vector rotation for checking collision on current vector, 90deg counterclockwise, and 90deg clockwise
            //Counterclockwise vector rotation
            if (collisionCheck(newX, newY, agents[i], cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)])) {
                if (agents[i].currVector.x != 0 && agents[i].currVector.y != 0) {
                    newX = agents[i].x + agents[i].currVector.x / 3;
                    newY = agents[i].y + agents[i].currVector.y / 3;
                }
                if (collisionCheck(newX, newY, agents[i], cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)])) {
                    //Rotation matrix application to vector
                    let vectorTransformX = Math.cos(90 * (Math.PI / 180)) * cells[x][y].dVector.x - Math.sin(90 * (Math.PI / 180)) * cells[x][y].dVector.y;
                    let vectorTransformY = Math.sin(90 * (Math.PI / 180)) * cells[x][y].dVector.x + Math.cos(90 * (Math.PI / 180)) * cells[x][y].dVector.y;

                    newX = agents[i].x + (vectorTransformX * agents[i].SpeedModifier) / 3;
                    newY = agents[i].y + (vectorTransformY * agents[i].SpeedModifier) / 3;
                    agents[i].currVector.x = vectorTransformX;
                    agents[i].currVector.y = vectorTransformY;

                    //Clockwise rotation, if counterclockwise movement failed
                    if (collisionCheck(newX, newY, agents[i], cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)])) {
                        //Inverse rotation matrix application to vector
                        let vectorTransformX = Math.cos(90 * (Math.PI / 180)) * cells[x][y].dVector.x + Math.sin(90 * (Math.PI / 180)) * cells[x][y].dVector.y;
                        let vectorTransformY = -Math.sin(90 * (Math.PI / 180)) * cells[x][y].dVector.x + Math.cos(90 * (Math.PI / 180)) * cells[x][y].dVector.y;

                        newX = agents[i].x + (vectorTransformX * agents[i].SpeedModifier) / 3;
                        newY = agents[i].y + (vectorTransformY * agents[i].SpeedModifier) / 3;
                        agents[i].currVector.x = vectorTransformX;
                        agents[i].currVector.y = vectorTransformY;

                        // if all directions have collisions, just stand still
                        if (collisionCheck(newX, newY, agents[i], cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)])) {
                            newX = agents[i].x;
                            newY = agents[i].y;
                        }
                    }
                }
            }
            if (newX < 0) {
                newX = 0;
            }

            //Applying agent weight to cell
            //Makes more densely packed cells less desirable
            let agentWeight = 0.5;
            if (!agents[i].prevCell2.x) {
                agents[i].prevCell2.x = Math.floor(newX / cellSize);
                agents[i].prevCell2.y = Math.floor(newY / cellSize);
                cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)].value += agentWeight;
            }
            else if (agents[i].prevCell2.x != Math.floor(newX / cellSize) || agents[i].prevCell2.y != Math.floor(newY / cellSize)) {
                cells[agents[i].prevCell2.x][agents[i].prevCell2.y].value -= agentWeight;
                if (!cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)].isExit) {
                    cells[Math.floor(newX / cellSize)][Math.floor(newY / cellSize)].value += agentWeight;
                }

                agents[i].prevCell2 = { x: Math.floor(newX / cellSize), y: Math.floor(newY / cellSize) }
            }
            // else {
            //     cells[agents[i].prevCell2.x][agents[i].prevCell2.y].highestDensity += agentWeight;
            // }

            //Update agent position based on calculations of next position
            agents[i].setCoordinates(newX, newY);
            agents[i].updateAgentCell();

            //Remove agent if end point is reached
            endPoint.forEach(endPoint => {
                if (getCell(x, y) === endPoint) {
                    agents[i].destroy();
                }
            });
        }
        i++;
    }

    if (exceededAgents > 0) {
        spawnExceededAgents();
        updateAgentColors(colorPicker.value);
    }

    let end = performance.now();
    //Recalculate vectors based on new added weight from agents
    calculateVectors(cells)
    //Real time agent counter
    counter.textContent = agents.length + "ppl";
    if (agents.length === 0) {
        simButton.innerText = 'Start simulation';
    } else {
        requestAnimationFrame(animateCaller);
        updateFPSCounter();
    }
}

//Check for collision
function collisionCheck(x, y, currAgent, newCell) {
    let agentCollision = agents.some((agent) => Math.abs(agent.x - x) < agent.fattiness + currAgent.fattiness && Math.abs(agent.y - y) < agent.fattiness + currAgent.fattiness && agent.x != currAgent.x && agent.y != currAgent.y);
    let cellCollision = newCell.isWall;
    if (agentCollision || cellCollision) {
        return true;
    } 
    else {
        return false;
    }
}

//Recursively call animate if agents exist
async function animateCaller() {

    if (agents.length == 0) {
        return;
    }
    const start = performance.now();

    animate(start);
    if (getShowHeatMap) {
        showLiveHeat(cellsToUpdate);
    }
    cellsToUpdate = [];
    return;
}

function removeAgentsFromArea(area, agentsToRemovePerArea, drawingArea) {
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

function addSpawnArea(spawnGroup) { spawnAreas.push(spawnGroup); }
function setSpawnAreas(newAreas) { spawnAreas = newAreas; }
function getSpawnAreas() { return spawnAreas; }