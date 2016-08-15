// training.js

var margin = {top: 20, right: 120, bottom: 20, left:100},
    width = 950 - margin.right - margin.left,
    height = 800 - margin.top - margin.bottom;
    
var i = 0,
    duration = 750,
    root;

//初始化树结构
var tree = d3.layout.tree().size([height, width]);

//设置两点间的贝塞尔曲线函数,[d.x, d.y]即保持原坐标不变,此处则是[d.y, d.x],即交换
//但只影响到连接线的坐标
var diagonal = d3.svg.diagonal()
    .projection(function(d) { 
      return [d.y, d.x]; 
    });
//给#tree元素添加svg标签,并设置宽高,再添加g标签,并变换挪动位置
var svg = d3.select("#tree").append("svg");
var svgGroup = svg.attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

root = treeData[0];//treeData 只有一个内容
root.x0 = height / 2;//380
root.y0 = 0;// 0 定义根节点的初试坐标

update(root);

d3.select(self.frameElement).style("height", "800px");

function update(source) {

  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),//通过d3生成树节点,但为什么反转呢???,实验了不反转并不影响效果
      links = tree.links(nodes);//根据树节点,确定连接线的两点.
      tree.nodeSize = 14;
  // Normalize for fixed-depth.
  // 根据层级,确定节点在y轴的位置,规范统一了,因为连接线中的两点为对象引用,所以node点的坐标变了,links中的值也是改变的
  nodes.forEach(function(d) {
    d.y = d.depth * 180;
    //d.x = d.x + 80; 
  });//层级间的间距

  // Update the nodes…
  var node = svgGroup.selectAll("g.node")
      .data(nodes, function(d) { 
        return d.id || (d.id = ++i); 
      });//为了enter出g.node标签,但为什么添加上id呢

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { 
        return "translate(" + source.y0 + "," + source.x0 + ")"; //因为整体移动了,所以每个节点元素都需要添加上整体移动的值,source是root节点对象
      }).on("click", click);

    //添加节点 
  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "#ccff99" : "#ff0"; });//为有无子节点的节点添加不同的填充色
      //添加节点描述
  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? -13 : 13; })
      .attr("dy", ".35em")
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.name; })
      .style("fill-opacity", 1e-6)
      .attr("class", function(d) {
            if (d.url != null) { return 'hyper'; } 
       });

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 10)
      .style("fill", function(d) { return d._children ? "#ccff99" : "#ff0"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.x + "," + source.y + ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svgGroup.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}

// Toggle children on click.
function click(d) {
  if (d.children) {
    d._children = d.children;
    d.children = null;
  } else {
    d.children = d._children;
    d._children = null;
  }
  update(d);
}


var zoom = d3.behavior.zoom()
      .scaleExtent([1, 10])
      .on("zoom", zoomed);

function zoomed() {
  svgGroup.attr("transform", 
    "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
}
svg.call(zoom);