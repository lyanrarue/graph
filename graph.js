const svg = d3.select("svg");
const width = window.innerWidth;
const height = window.innerHeight;
svg.attr("width", width).attr("height", height);

window.addEventListener("resize", () => {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;
  svg.attr("width", newWidth).attr("height", newHeight);

  // Update simulation center
  simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
});

const graph = {
  nodes: [{ id: 1 }, { id: 2 }, { id: 3 }],
  links: [
    { source: 1, target: 2 },
    { source: 2, target: 3 },
    { source: 3, target: 1 },
  ],
};

let simulation;
let links;
let nodesAndLabels;
let nextNodeId = 4;
const nodeRadius = 20;

const DarkSeaGreen = "#8FBC8F";
const CadetBlue = "#5F9EA0";

const initializeGraph = () => {
  // Clear existing elements
  svg.selectAll("g").remove();

  // start simulation
  simulation = d3
    .forceSimulation(graph.nodes)
    .force(
      "link",
      d3
        .forceLink(graph.links)
        .id((d) => d.id)
        .distance(100)
    )
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2));

  // draw edges on svg
  links = svg
    .append("g")
    .selectAll("line")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("stroke", "#999")
    .attr("stroke-width", 2);

  nodesAndLabels = svg
    .append("g")
    .selectAll("circle")
    .data(graph.nodes, (d) => d.id)
    .enter()
    .append("g");

  const circles = nodesAndLabels
    .append("circle")
    .attr("r", nodeRadius)
    .attr("fill", (d) => d.color || CadetBlue)
    .attr("cursor", "pointer")
    .call(drag(simulation));

  nodesAndLabels
    .append("text")
    .text((d) => d.id)
    .attr("text-anchor", "middle")
    .attr("dy", 4)
    .attr("font-family", "Helvetica")
    .attr("font-size", "10px")
    .attr("pointer-events", "none");

  simulation.on("tick", ticked);
};

const drag = (simulation) => {
  const dragStarted = (event, d) => {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  };

  const dragged = (event, d) => {
    d.fx = event.x;
    d.fy = event.y;
  };

  const dragEnded = (event, d) => {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  };

  return d3
    .drag()
    .on("start", dragStarted)
    .on("drag", dragged)
    .on("end", dragEnded);
};

const ticked = () => {
  links
    .attr("x1", (d) => d.source.x)
    .attr("y1", (d) => d.source.y)
    .attr("x2", (d) => d.target.x)
    .attr("y2", (d) => d.target.y);

  nodesAndLabels.attr("transform", (d) => `translate(${d.x},${d.y})`);
};

const getNodeAtCoords = (coords) => {
  for (let node of graph.nodes) {
    const distance = Math.sqrt(
      Math.pow(node.x - coords[0], 2) + Math.pow(node.y - coords[1], 2)
    );
    if (distance <= nodeRadius) {
      return node;
    }
  }
  return null;
};

const addRandomNode = (coords) => {
  const newNode = {
    id: nextNodeId++,
    x: coords[0],
    y: coords[1],
  };

  graph.nodes.push(newNode);

  const linksToCreate = Math.floor(Math.random() * (graph.nodes.length - 1));

  const linkedNodeIds = new Set();
  for (let i = 0; i < linksToCreate; i++) {
    const targetNode =
      graph.nodes[Math.floor(Math.random() * (graph.nodes.length - 1))];
    if (targetNode.id !== newNode.id && !linkedNodeIds.has(targetNode.id)) {
      graph.links.push({
        source: newNode.id,
        target: targetNode.id,
      });
      linkedNodeIds.add(targetNode.id);
    }
  }
};

svg.on("click", (event) => {
  simulation.stop();
  const coords = d3.pointer(event);

  const clickedNode = getNodeAtCoords(coords);

  if (clickedNode) {
    console.log(`Clicked on node: ${clickedNode.label}`);
    clickedNode.color = DarkSeaGreen;
  } else {
    addRandomNode(coords);
  }

  initializeGraph();
});

initializeGraph();
