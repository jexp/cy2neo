function Cy2NeoD3(config, graphId, tableId,sourceId, execId, urlSource) {
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
    var neod3 = new Neod3Renderer();
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
				if (graph) {
					var c=$("#"+graphId);
					c.empty();
					neod3.render(graphId, c ,graph);
					renderResult(tableId, res.table);
				}
			});
		} catch(e) {
			console.log(e);
		}
		return false;
	});
}
