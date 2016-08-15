var nodes = [
	{name:'aa',id:'a',type:'1'},
	{name:'bb',id:'b',type:'1'},
	
	{name:'cc',id:'c',type:'2'},
	{name:'ee',id:'e',type:'1'},
	{name:'ff',id:'f',type:'3'},
	{name:'gg',id:'g',type:'1'},
	{name:'ll',id:'l',type:'4'},
	{name:'hh',id:'h',type:'1'},

	{name:'dd',id:'d',type:'1'},
	{name:'ii',id:'i',type:'1'}
];
var links = [
	{s:'g',t:'h'},
	{s:'a',t:'f'},
	{s:'e',t:'g'},
	{s:'h',t:'i'},
	{s:'f',t:'h'},
	
	{s:'b',t:'f'},
	{s:'c',t:'g'},
	{s:'d',t:'g'},
	{s:'l',t:'h'}
];







function getTreeData(nodes,links){
	var newLinks = [];

	function getNodeById(id,nodes){
		var nodeLength = nodes.length;
		for(var i = 0;i<nodeLength;i++){
			if(nodes[i].id==id){
				return nodes[i]
			}
		}
		return null;
	}
	function relateNode(nodes,links){
		var linkLength = links.length,nodeLength = nodes.length,resultData = [];
		for(var i = 0;i<linkLength;i++){
			resultData[i] = {};
			resultData[i]['s'] = getNodeById(links[i].s,nodes);
			resultData[i]['t'] = getNodeById(links[i].t,nodes);
		}
		return resultData ;
	}

	function findBaseNode(links){
		var len = links.length;
		for(var i = 0; i<len; i++){
			for(var j = 0;j<len;j++){
				if(links[i].t == links[j].s){
					break;
				}
				if(j==len-1){
					links[i]['t']['v'] = links[i]['t']['v']?links[i]['t']['v']:1;
					links[i]['s']['v'] = links[i]['t']['v']+1;
					links[i]['t']['children'] = links[i]['t']['children'] instanceof Array ? links[i]['t']['children']:[];
					links[i]['t']['children'].push(links[i]['s']);
					return i;
				}
			}
		}
	}

	function setNodesLevel(links){
		var baseNodeIndex = findBaseNode(links),baseNode =links[baseNodeIndex].t;
		newLinks.push(links.splice(baseNodeIndex,1)[0]);
		if(links.length>0){
			setNodesLevel(links)
		}
	}

	console.time('获取层级');
	var linkNodes = relateNode(nodes,links);
	setNodesLevel(linkNodes);
	console.timeEnd('获取层级');
	nodes = nodes.sort(function(a,b){
		return a.v-b.v;
	});
	return nodes[0];
}
var rootData = getTreeData(nodes,links)

// training.js
var margin = {top: 20, right: 120, bottom: 20, left:100},
		width = 1000 - margin.right - margin.left,
		height = 800 - margin.top - margin.bottom;
		
var i = 0,
		duration = 750,
		root;

//初始化树结构

//设置两点间的贝塞尔曲线函数,[d.x, d.y]即保持原坐标不变,此处则是[d.y, d.x],即交换
//但只影响到连接线的坐标
//给#tree元素添加svg标签,并设置宽高,再添加g标签,并变换挪动位置
var svg = d3.select("body").append("svg");
var svgGroup = svg.attr("width", width + margin.right + margin.left)
		.attr("height", height + margin.top + margin.bottom)
		.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

function update(source) {

}
update(rootData);


var root = d3.hierarchy(rootData);
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
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6)
      .attr("class", function(d) {
            if (d.url != null) { return 'hyper'; } 
       });