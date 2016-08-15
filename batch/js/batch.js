var nodes = [{ name: "桂林",id:"gl"}, { name: "广州",id:"gz" }, { name: "厦门",id:"xm" }, { name: "杭州",id:"hz" }, { name: "上海",id:"sh" }, { name: "青岛" ,id:"qd"}, { name: "天津",id:"tj" }];
var links = [
	{ source :"gl", target:"gz"  }, 
	{ source :"gl", target:"xm"  },
	{ source :"gl", target:"hz"  }, 
	{ source :"gz", target:"sh"  },
	{ source :"gz", target:"qd"  }, 
	{ source :"gz", target:"tj"  }
];

/**
 * 根据id获取当前节点的父节点,子节点
 * @method      getNodeParent
 * @author      三生
 * @anotherdate 2016-07-22
 * @param       {[type]}      nodeId [description]
 * @return      {[type]}             [description]
 */
function getNodeParent(nodeId){
	var l = edges.length,parents = [],children = [];
	for(var i = 0;i<l;i++){
		if(edges[i].target==nodeId){
			parents.push(edges[i].source);
		}
		if(edges[i].source==nodeId){
			children.push(edges[i].source);
		}
	}
}

var svg = d3.select('body').append('svg').attr('width',800).attr('height',800),
	svgGroup = svg.append('g'),
	svgNodes = svgGroup.selectAll('g.nodes').data(nodes).enter().append('g').attr('class','nodes').append('rect'),
	svgLinks = svgGroup.selectAll('g.links').data(nodes).enter().append('g').attr('class','links').append('path');

var currentNode = 'gz';

function getNodeById(id){
	var nodeLength = nodes.length;
	for(var i = 0;i<nodeLength;i++){
		if(nodes[i].id==id){
			return nodes[i]
		}
	}
	return null;
}
function relateNode(){
	var linkLength = links.length,nodeLength = nodes.length;
	for(var i = 0;i<linkLength;i++){
		links[i].source = getNodeById(links[i].source);
		links[i].target = getNodeById(links[i].target);
	}
	nodes = null;
}

relateNode();

/**
 * 根据关系图,生成树结构数据
 * @method      generateTreeData
 * @author      三生
 * @anotherdate 2016-07-22
 * @return      {[type]}         [description]
 */
function generateTreeDataBySpec(){
	var links = relateNode();
	
}