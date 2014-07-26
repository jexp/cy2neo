var config = {
  dataSource: 'data/team.json',                      

  cluster: true,

  nodeTypes: {"node_type":
              ["family", "coworker", 
               "classmate", "friend", 
               "other"]},
  nodeCaption: "firstName",
  rootNodeRadius: 30,

  showControlDash: false,

  showStats: false,
  nodeStats: true,

  showFilters: true,
  nodeFilters: true,

  captionToggle: true,
  edgesToggle: true,
  nodesToggle: true,
  toggleRootNotes: false,

  zoomControls: true
};

// alchemy.begin(config)