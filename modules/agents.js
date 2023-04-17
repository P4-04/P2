export { populate, removeAgentsFromArea, anime, getSpawnArea, addSpawnArea }
import { cellSize, svgNS, getCells, getCellIndex } from './cells.js'

const drawingArea = document.querySelector(".drawing");
let spawnAreas = [];

//Initializing array of agents
let agents = [];
let MaxSpeed = 5;
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
        this.SpeedModifier = Math.random() * MaxSpeed + 1;
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
        let fattiness = ((cellSize / 6) + Math.floor(Math.random() * 3));
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
    let i = 0, len = agents.length;
    let cells = getCells();
    while (i < len) {
        let x = Math.floor(agents[i].x / cellSize);
        let y = Math.floor(agents[i].y / cellSize);
        let newX = agents[i].x + (cells[x][y].dVector.x) * agents[i].SpeedModifier;
        let newY = agents[i].y + (cells[x][y].dVector.y) * agents[i].SpeedModifier;
        agents[i].setCoordinates(newX, newY);
        i++;
    }
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
function getSpawnArea() { return spawnAreas; }
