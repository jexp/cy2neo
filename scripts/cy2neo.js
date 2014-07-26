function Cy2Neo(config, graphId, sourceId, execId, urlSource) {
    function createEditor() {
		return CodeMirror.fromTextArea(document.getElementById(sourceId), {
		  parserfile: ["codemirror-cypher.js"],
		  path: "scripts",
		  stylesheet: "styles/codemirror-neo.css",
		  autoMatchParens: true,
		  lineNumbers: true,
		  enterMode: "keep",
		  value: "some value"
		});
    } 
	function initAlchemyConfig() {
		config.divSelector="#"+graphId;
		config.dataSource={nodes:[],edges:[]};
		config.forceLocked = false;
		config.alpha = 0.8;
		config.edgeTypes = "caption";
		alchemy.begin(config)
		return config;
	}
	config = initAlchemyConfig();
	var neo = new Neo(urlSource);
    var editor = createEditor();
	$("#"+execId).click(function(evt) {
		try {
			evt.preventDefault();
			var query = editor.getValue();
			console.log("Executing Query",query);
			neo.executeQuery(query,{},function(err,res) {
				res = res || {}
				var graph=res.graph;
				var labels = res.labels;
				config.nodeTypes = {type: labels};
				if (err) {
					alchemy.conf.warningMessage=JSON.stringify(err);
					alchemy.startGraph(null)
				} else {
					alchemy.startGraph(graph);
				}
			});
		} catch(e) {
			console.log(e);
		}
		return false;
	});
}
