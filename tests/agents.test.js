const { populate, checkAgentDistance } = require('./refactored_modules.js');

describe('populate', () => {
    test('throws an error when spawnAreas is an empty array', () => {
      const spawnAreas = [];
      const cellSize = 10;
      const numAgents = 5;
      expect(() => {
        populate(spawnAreas, cellSize, numAgents);
      }).toThrowError('Please add spawn areas');
    });
  });
  
  describe('checkAgentDistance', () => {
    test('returns false when distance is less than minAgentDistance + agent.fattiness * 2', () => {
      const x = 10;
      const y = 20;
      const minAgentDistance = 5;
      const agents = [
        { x: 15, y: 25, fattiness: 2 },
        { x: 30, y: 35, fattiness: 3 },
      ];
      const result = checkAgentDistance(x, y, minAgentDistance, agents);
      expect(result).toBe(false);
    });
  
    test('returns true when there are no agents in the array', () => {
      const x = 10;
      const y = 20;
      const minAgentDistance = 5;
      const agents = [];
      const result = checkAgentDistance(x, y, minAgentDistance, agents);
      expect(result).toBe(true);
    });
  });
  
