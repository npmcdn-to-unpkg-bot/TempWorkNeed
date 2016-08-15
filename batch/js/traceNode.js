// var height = $(window).innerHeight();
// $('.info-body').mCustomScrollbar({theme:"minimal-dark",axis:"y",set_height:height- 114,scrollInertia:300});
// $('.batchMindMap').height(height)//.width($(window).innerWidth()-344);

var jsonData = {
		"total": 0, 
		"rows": [
			{
				"NodeList": [
					{
						"ID": "1", 
						"nodeid": "4dfb74b5-a75a-40dc-a45b-6d7735c01a8e", 
						"nodename": "包菜201606301056", 
						"nodetitle": "包菜"
					}, 
					{
						"ID": "2", 
						"nodeid": "44d5a95d-1dbd-4568-8601-f773f39ab6f6", 
						"nodename": "黄花201606301056", 
						"nodetitle": "黄花"
					}, 
					{
						"ID": "3", 
						"nodeid": "2c29f9fe-8c59-46af-a511-87929b37b4c8", 
						"nodename": "小青菜201606301018", 
						"nodetitle": "小青菜"
					}, 
					{
						"ID": "4", 
						"nodeid": "9cb85955-1f1f-4bea-be0c-a045ca28232c", 
						"nodename": "汉字测试", 
						"nodetitle": "基本上最后一个简单的测试"
					}, 
					{
						"ID": "5", 
						"nodeid": "d0fc1d71-30e7-4a4d-991a-795f226acc80", 
						"nodename": "数量的测试", 
						"nodetitle": "辣条数量的测试"
					}, 
					{
						"ID": "6", 
						"nodeid": "9e0e619d-5598-4e76-9e5d-f1ce14c124f1", 
						"nodename": "百合测试批次", 
						"nodetitle": "白百合"
					}, 
					{
						"ID": "7", 
						"nodeid": "be0d260c-e8e7-4ceb-af5d-12375a4873ca", 
						"nodename": "大白菜批次", 
						"nodetitle": "大白菜"
					}, 
					{
						"ID": "8", 
						"nodeid": "327780b6-ca11-4928-816f-1c03b5fdd64c", 
						"nodename": "西蓝花批次", 
						"nodetitle": "西蓝花"
					}, 
					{
						"ID": "9", 
						"nodeid": "596ce63e-f2b5-4a31-b4ee-21f6bdec9b38", 
						"nodename": "儿童", 
						"nodetitle": "测试猪肉"
					},
					{
						"ID": "10", 
						"nodeid": "596ce63e-f3b5-4a31-b4ee-26f6bdec9b38", 
						"nodename": "儿童10", 
						"nodetitle": "测试猪肉10"
					}
				], 
				"RelationList": [
					{
						"Descendant": "3", 
						"Ancestor": "1", 
						"RelationName": ""
					}, 
					{
						"Descendant": "9", 
						"Ancestor": "6", 
						"RelationName": ""
					}, 
					{
						"Descendant": "10", 
						"Ancestor": "7", 
						"RelationName": ""
					}, 
					{
						"Descendant": "3", 
						"Ancestor": "2", 
						"RelationName": ""
					}, 
					{
						"Descendant": "7", 
						"Ancestor": "6", 
						"RelationName": ""
					}, 
					{
						"Descendant": "4", 
						"Ancestor": "3", 
						"RelationName": ""
					}, 
					{
						"Descendant": "6", 
						"Ancestor": "3", 
						"RelationName": ""
					}, 
					{
						"Descendant": "7", 
						"Ancestor": "4", 
						"RelationName": ""
					}, 
					{
						"Descendant": "4", 
						"Ancestor": "5", 
						"RelationName": ""
					}, 
					
					
					{
						"Descendant": "5", 
						"Ancestor": "8", 
						"RelationName": ""
					}, 
					{
						"Descendant": "10", 
						"Ancestor": "9", 
						"RelationName": ""
					}
				]
			}
		], 
		"success": true, 
		"msg": ""
}

function getTreeData(jsonData){	
	var jsonNodes = jsonData.rows[0].NodeList,
		jsonRelates = jsonData.rows[0].RelationList,newLinks = [];

	function getNodeById(id,nodes){
		var nodeLength = nodes.length;
		for(var i = 0;i<nodeLength;i++){
			if(nodes[i]['ID']==id){
				return nodes[i]
			}
		}
		return null;
	}
	function relateNode(nodes,links){
		var linkLength = links.length,nodeLength = nodes.length,resultData = [];
		for(var i = 0;i<linkLength;i++){
			resultData[i] = {};
			resultData[i]['Ancestor'] = getNodeById(links[i]['Ancestor'],nodes);
			resultData[i]['Descendant'] = getNodeById(links[i]['Descendant'],nodes);
			resultData[i]['Ancestor']['relateName'] = links[i]['RelationName'];
		}
		return resultData ;
	}

	function findBaseNode(links){
		var len = links.length;
		for(var i = 0; i<len; i++){
			for(var j = 0;j<len;j++){
				if(links[i]['Descendant'] == links[j]['Ancestor']){
					break;
				}
				if(j==len-1){
					links[i]['Descendant']['v'] = links[i]['Descendant']['v']?links[i]['Descendant']['v']:1;
					links[i]['Ancestor']['v'] = links[i]['Descendant']['v']+1;
					links[i]['Descendant']['children'] = links[i]['Descendant']['children'] instanceof Array ? links[i]['Descendant']['children']:[];
					links[i]['Descendant']['children'].push(links[i]['Ancestor']);
					return i;
				}
			}
		}
	}
	function setNodesLevel(links){
		var baseNodeIndex = findBaseNode(links);
		newLinks.push(links.splice(baseNodeIndex,1)[0]['Descendant']);
		if(links.length){
			setNodesLevel(links)
		}
	}

	console.time('获取层级');
	var linkNodes = relateNode(jsonNodes,jsonRelates);
	setNodesLevel(linkNodes);
	console.timeEnd('获取层级');
	return newLinks[0];
}
var rootData = getTreeData(jsonData);
console.log(rootData);

function setAxisX(nodeItem){
	console.log(nodeItem.ID)
	if(nodeItem.children&&nodeItem.children.length){
		nodeItem.children.forEach(function(node){
			setAxisX(node)
		});
	}else{
		//console.log('else  '+nodeItem.ID);
	}
}
setAxisX(rootData);













var margin = {top: 20, right: 120, bottom: 20, left:100},
		width = 800 - margin.right - margin.left,
		height = 800 - margin.top - margin.bottom;
		
var i = 0,
		duration = 750;
var svg = d3.select("body").append("svg");
var svgGroup = svg.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");




// console.log(d3.hierarchy(rootData));
// var nodes = d3.hierarchy(rootData).descendants();

// var map = d3.map();
// for(var i = 0;i<nodes.length;i++){
// 	map.set(nodes[i].data.ID,nodes[i]);
// }
// nodes = map.values();



function creatTree(rootData){
	var root = rootData;
	var tree = d3.tree().size([width,height]);
	tree.nodeSize([170,90])
	var treeNodes = tree(root);
	root.each(function(d) {
	    d.y = d.depth * 180;
	    //d.x = d.x + 80; 
	  });//层级间的间距

	var treeNode = svgGroup.selectAll("g.node").data(root.descendants(), function(d) { 
    return d.id || (d.id = ++i); 
  });//为了enter出g.node标签,但为什么添加上id呢

  // Enter any new nodes at the parent's previous position.
  var treeNodeEnter = treeNode.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        return "translate(" + d.x + "," + (height-d.y) + ")"; //因为整体移动了,所以每个节点元素都需要添加上整体移动的值,source是root节点对象
      });
 //添加节点 
  treeNodeEnter.append("rect")
      .attr("width", 150)
      .attr("height", 30)
      .attr('x',-75)
      .style("fill", function(d) { return d._children ? "#ccff99" : "#ff0"; });//为有无子节点的节点添加不同的填充色
  treeNodeEnter.append("rect")
      .attr("width", 150)
      .attr("height", 55)
      .attr('y',30)
      .attr('x',-75)
      .style("fill", function(d) { return '#fff'; })
      .style("stroke", function(d) { return '#dedede'; });//为有无子节点的节点添加不同的填充色
      //添加节点描述
  treeNodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.data.ID; });

	var zoom = d3.zoom()
	      .scaleExtent([0.5, 10])
	      .on("zoom", zoomed);

	function zoomed() {
	  svgGroup.attr("transform", 
	    "translate(" + d3.event.transform.x+","+d3.event.transform.y + ") scale(" + d3.event.transform.k + ")");
	}
	svg.call(zoom);
}