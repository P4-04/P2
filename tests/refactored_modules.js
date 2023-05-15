//This is a file containing refactored modules from the original codebase but with no dependencies on the original codebase nor any DOM dependancy (e.g. document, window, etc.)
//This is to allow for unit testing of the modules without having to mock the DOM or the original codebase
//This file is not used in the actual application, it is only used for testing purposes
//This file is not meant to be run, it is only meant to be imported by the tests


module.exports = {
    populate,
    checkAgentDistance
  };

//Function for evenly distributing agents among total spawn area
function populate(spawnAreas, cellSize, numAgents) {
    if (spawnAreas.length == 0) {
      throw new Error("Please add spawn areas");
    }
  
    let totalCells = 0;
    let agentNum = numAgents;
  
    spawnAreas.forEach((area) => {
      totalCells += area.length;
    });
  
    //the minimum distance between agents
    const minAgentDistance = cellSize / 3;
    const maxAgents = totalCells * Math.floor((cellSize - minAgentDistance) / minAgentDistance);
    let exceededAgents = 0;
  
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
      populateCells(area, agentsPerArea, minAgentDistance, agents, cellSize);
    });
  
    return exceededAgents;
  }
  
  //Spawning agent randomly within correct area
  function populateCells(area, agentsPerArea, minAgentDistance, agents, cellSize) {
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
        validPosition = checkAgentDistance(x, y, minAgentDistance, agents);
        //increment tries counter
        tries++;
      }
      //only create an agent if there's a valid position
      if (validPosition) {
        let agent = { x, y, fattiness };
        agents.push(agent);
      }
      //If no valid positions are found, spawn these agents later
      else {
        agentsPerArea++;
      }
    }
  }
  
  function checkAgentDistance(x, y, minAgentDistance, agents) {
    for (let agent of agents) {
      let distance = Math.sqrt(Math.pow(agent.x - x, 2) + Math.pow(agent.y - y, 2));
      //increase the distance check to also include the agent's fattiness
      if (distance < minAgentDistance + agent.fattiness * 2) {
        return false;
      }
    }  
    return true;
}

//Getting position within spawn area
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}