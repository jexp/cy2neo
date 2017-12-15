function Cy2NeoD3(config, graphId, tableId, sourceId, execId, urlSource, renderGraph, cbResult) {
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
    var cm = $('.CodeMirror')[0].CodeMirror;
	//Hide
	$(cm.getWrapperElement()).hide();

	try {
			
		var query = editor.getValue();
		if (query!==""){
			//console.log("checked value is "+document.querySelector('input[name="showallrelationships"]').checked);
			query=query+"&searchMethod="+document.querySelector('input[name="searchmethod"]:checked').value+"&showAllRelationships="+document.querySelector('input[name="showallrelationships"]').checked;
		}
		console.log("Executing Query",query);
		var execButton = $(this).find('i');
		execButton.toggleClass('fa-play-circle-o fa-spinner fa-spin')
		if (query.trim() !== ""){
		neo.executeQuery(query,{},function(err,res) {
			execButton.toggleClass('fa-spinner fa-spin fa-play-circle-o')
			res = res || {}
			var graph=res.graph;
			if (renderGraph) {
				if (graph) {
					var c=$("#"+graphId);
					c.empty();
					neod3.render(graphId, c ,graph);
					renderResult(tableId, res.table);
				} else {
					if (err) {
						console.log(err);
						if (err.length > 0) {
							sweetAlert("Cypher error", err[0].code + "\n" + err[0].message, "error");
						} else {
							sweetAlert("Ajax " + err.statusText, "Status " + err.status + ": " + err.state(), "error");
						}
					}
				}
			}
			if(cbResult) cbResult(res);
		});
}
	} catch(e) {
		console.log(e);
		sweetAlert("Catched error", e, "error");
	}
	return false;
}
