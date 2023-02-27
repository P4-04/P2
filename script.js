console.log("Hello actions");


//Generate paths for each agent using pathfinding (A* or Dijkstra)
// OR generate a path 'master' path and have agents path find to the closest point on the master path
//If an agent is about to collide with another (use either the pythagorean theorem or vector math) generate path around the agent

//Consider using RVO/RVO2 https://gamma.cs.unc.edu/RVO2/
//Or just detect all agents around us, and adapt the agent speed to avoid collision
//or detect all agents infront of us for example FOV 90 degrees, and adapt on what we 'see'
//we can always change the FOV range or other paramteres depending on the agent speed
