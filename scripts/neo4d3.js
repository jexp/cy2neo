function Neo(urlSource) {
	function txUrl() {
		var connection = urlSource();
		var url = connection.url;
		return url + "/api/neo4j/node/diview?term=";
	}
	var me = {
		executeQuery: function(query, params, cb) {
			var connection = urlSource();
			$.ajax(txUrl()+query, {
				type: "GET",
				xhrFields: {
    				withCredentials: true
				},
				contentType: "application/json",
				error: function(err) {
					cb(err);
				},
				
				success: function(res) {
					if (res.errors.length > 0) {
						cb(res.errors);
					} else {
						var cols = res.results[0].columns;
						var rows = res.results[0].data.map(function(row) {
							var r = {};
							cols.forEach(function(col, index) {
								r[col] = row.row[index];
							});
							return r;
						});
						var nodes = [];
						var rels = [];
						var labels = [];
					    function findNode(nodes, id) {
						   for (var i=0;i<nodes.length;i++) {
						      if (nodes[i].id == id) return i;
						   }
						   return -1;
					    }
						res.results[0].data.forEach(function(row) {
							row.graph.nodes.forEach(function(n) {
							   var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
							   if (!found) {
								  //n.props=n.properties;
								  for(var p in n.properties||{}) { n[p]=n.properties[p];delete n.properties[p];} 
								  delete n.properties;
								  nodes.push(n);
								  labels=labels.concat(n.labels.filter(function(l) { labels.indexOf(l) == -1 }))
							   }
							});
							rels = rels.concat(row.graph.relationships.map(
								function(r) { 
								   return { id: r.id, start:r.startNode, end:r.endNode, type:r.type } }
								));
						});
						cb(null,{table:rows,graph:{nodes:nodes, links:rels},labels:labels});
					}
				}
			});
		}
	};
	return me;
}
