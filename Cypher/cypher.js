// view-source:http://jexp.github.io/cy2neo/
// requires jQuery

function Cypher(urlSource) {
		
	function txUrl() {
		var url = (urlSource || "http://localhost:7474").replace(/\/db\/data.*/,"") + "/db/data/transaction/commit";
		return url;
	};

	var me = {
		executeQuery: function(query, params, callback) {
			
			$.ajax(txUrl(), {
				type: "POST",
				data: JSON.stringify({
					statements: [{
						statement: query,
						parameters: params || {},
						resultDataContents: ["row", "graph"]
					}]
				}),
				contentType: "application/json",
				error: function(err) {
					callback(err);
				},
				success: function(res) {
					if (res.errors.length > 0) {
						callback(res.errors);
					} else {
/* Table is useless
					var cols = res.results[0].columns;
						var rows = res.results[0].data.map(function(row) {
							var r = {};
							cols.forEach(function(col, index) {
								r[col] = row.row[index];
							});
							return r;
						});
*/
						var nodes = [];
						var rels = [];
						var labels = [];
						res.results[0].data.forEach(function(row) {
							row.graph.nodes.forEach(function(n) {
							   var found = nodes.filter(function (m) { return m.id == n.id; }).length > 0;
							   if (!found) {
								  var node = n.properties||{}; node.id=n.id;node.type=n.labels[0];
								  nodes.push(node);
								  if (labels.indexOf(node.type) == -1) labels.push(node.type);
							   }
							});
							rels = rels.concat(row.graph.relationships.map(function(r) { return $.extend({ source:r.startNode, target:r.endNode, caption:r.type}, r.properties); }));
						});
//						callback(null,{table:rows,graph:{nodes:nodes, relationships:rels},labels:labels});
						callback(null,{graph:{nodes:nodes, relationships:rels},labels:labels});
					}
				}
			});
		}/*,
		createNode: function () {},
		createRelationship: function() {},
		updateNode: function() {},
		updateRelationship: function() {},
		deleteNode: function() {},
		deleteRelationship: function() {}
		*/
	};
	return me;
}