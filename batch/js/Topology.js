d3.json('data/traceNodes.json',function(error,jsonData){
	if (error) throw error;

	var graph = jsonData.rows[0],
		nodes = graph.NodeList,
      	links = graph.RelationList,
      	bilinks = [];

    var svg = d3.select("svg"),
    	width = +svg.attr("width"),
    	height = +svg.attr("height");

    var simulation = d3.forceSimulation()
	    .force("charge", d3.forceManyBody().strength(-500))
	    .force("link", d3.forceLink().id(function(d) { return d.ID; }).distance(60))
	    .force("x", d3.forceCenter(width / 2,height / 2))
	    .force("fx", d3.forceX(20))
	    .force("fy", d3.forceY(0))
	    .force("collide", d3.forceCollide(100))
	    .on("tick", ticked);

	simulation.stop();

	var svgGroup = svg.append('g'),
		svgLink = svgGroup.selectAll(".link"),
    	svgNode = svgGroup.selectAll(".node");

	svg.append("g").append("marker")
	    .attr("id", "suit")
	    .attr("viewBox", "0 -5 10 10")
	    .attr("refX", 10)
	    .attr("refY", 0)
	    .attr("markerWidth", 6)
	    .attr("markerHeight", 6)
	    .attr("orient", "auto")
	    .append("path")
	    .attr("d", "M0,-5L10,0L0,5");

    /**
     * 设置节点间的两两关联项
     * @method      setNodesKins
     * @author      三生
     * @anotherdate 2016-08-15
     */
    function setNodesKins(){
    	for(var i = 0;i<nodes.length;i++){
    		nodes[i]['parents'] = nodes[i]['parents']?nodes[i]['parents']:'';
    		nodes[i]['children'] = nodes[i]['children']?nodes[i]['children']:'';
    		for(var j = 0;j<links.length;j++){
    			if(links[j].Ancestor==nodes[i].ID){
    				nodes[i]['children'] += links[j].Descendant+',';
    			}
    			if(links[j].Descendant==nodes[i].ID){
    				nodes[i]['parents'] += links[j].Ancestor+',';
    			}
    		}
    	}
    }
	/**
	 * 设置节点层级	 * @method      setNodeLeave
	 * @author      三生
	 * @anotherdate 2016-08-24
	 * @param       {[type]}     links [description]
	 */
	var nodeW = [],minW = 0;

	
	function setNodeLeave(linkArr){
        //给任意点设置一个初始层级
        nodes[0]['w'] = 10;
        var setLeaveState = true,n = 0;
        do{
        	n++;
        	//50次还没结束应该就是数据有误了，可以通过改变数字来再次确认
        	if(n>50){
        		break;
        	}
            for(var i = 0;i<linkArr.length;i++){
                n++;
                setLeaveState = false;
                var tempSource = linkArr[i]['source'],tempTarget = linkArr[i]['target'];
                if(typeof(tempSource)=='undefined'||typeof(tempTarget)=='undefined'){
					linkArr.splice(i,1);
					setLeaveState = true;
					break;
                }
                if(tempTarget['w']){
                    tempSource['w'] = tempTarget['w']-1;
                    nodeW.push(tempSource['w']);
                }else if(tempSource['w']){
                    tempTarget['w'] = tempSource['w']+1;
                }else{
                    setLeaveState = true;
                }
            }
        } while (setLeaveState);
    }
	/**
	 * 启动与重启力布局
	 * @method      reStartForce
	 * @author      三生
	 * @anotherdate 2016-08-15
	 * @return      {[type]}     [description]
	 */
	function reStartForce(){
		//setNodesKins();
		
		var resultLinks = links;//rebuildLinks(repeatArr,links);

		/**
		 * 将links与nodes关联起来
		 * @method
		 * @author      三生
		 * @anotherdate 2016-08-15
		 * @param       {[type]}   d) {            return d.ID; } [description]
		 * @return      {[type]}      [description]
		 */
		var nodeById = d3.map(nodes, function(d) { return d.ID; })
		resultLinks.forEach(function(link) {
			link.source = nodeById.get(link.Ancestor),
			link.target = nodeById.get(link.Descendant); // intermediate node
		});

		setNodeLeave(links)
		minW = nodeW.sort()[0]

		simulation.nodes(nodes);
		simulation.force("link").links(resultLinks);

		svgGroup.selectAll(".link").remove();
    	svgGroup.selectAll(".node").remove();

    	svgLink = svgGroup.selectAll(".link");
    	svgNode = svgGroup.selectAll(".node");

	  	svgLink = svgLink.data(resultLinks)
	    .enter().insert("polyline")
	    .attr("class", "link").attr("marker-end", 'url(#suit)');

	  	svgNode = svgNode.data(nodes)
	    	.enter().insert("g")
			.attr("class", "node")
			.attr("x", -75)
			.attr("r",function(d){
	      	if(d.ID.indexOf('tempRepeat-')<0){
	      		return 6;
	      	}else{
	      		return 1e-6;
	      	}
	      }).on('mouseover', function(obj) {
	      	if(obj.ID.indexOf('tempRepeat-')>-1){
	      		return;
	      	}
	      	svgNode.classed('opaci',function(d){
	      		var patt1 = new RegExp('^'+obj.ID+',|,'+obj.ID+',');
	      		return (obj !== d
	                     && !patt1.test(d.parents)
	                     && !patt1.test(d.children));
	      	});

	        svgLink.classed('opaci',function(d){
	        	return (obj !== d.source && obj !== d.target);
	        })
	    }).on('mouseout', function(obj) {
	      	svgNode.classed('opaci',false);
	      	svgLink.classed('opaci',false);
	    });
		//批次title
		svgNode.append("rect").attr('width',function(d){
				if(d.ID.indexOf('tempRepeat-')<0){
	      			return 150;
	      		}else{
	      			return 0;
	      		} 
		}).attr('height',function(d){
			if(d.ID.indexOf('tempRepeat-')<0){
	  			return 32;
	  		}else{
	  			return 0;
	  		} 
		}).attr('fill','#37cfad');

		svgNode.append("text")
			.attr("x", '2em')
			.attr("y", "1.5em")
			.attr("text-anchor", function(d) { return "start"})
			.text(function(d) { 
				if(d.ID.indexOf('tempRepeat-')<0){
	      			return d.ID+d.nodetitle;
	      		}else{
	      			return '';
	      		} 
	      	});
		//批次名稱
		svgNode.append("rect").attr('y',32).attr('width',function(d){
				if(d.ID.indexOf('tempRepeat-')<0){
	      			return 150;
	      		}else{
	      			return 0;
	      		} 
		}).attr('height',function(d){
			if(d.ID.indexOf('tempRepeat-')<0){
	  			return 55;
	  		}else{
	  			return 0;
	  		} 
		}).attr('fill','#fff').attr('stroke','#dedede').attr('stroke-width',1);

		svgNode.append("text")
			.attr("x", '2em')
			.attr("y", "4em")
			.attr("text-anchor", function(d) { return "start"})
			.text(function(d) { 
				if(d.ID.indexOf('tempRepeat-')<0){
	      			return d.ID+d.nodename;
	      		}else{
	      			return '';
	      		} 
	      	});

		svgNode.call(d3.drag()
	          .on("start", dragstarted)
	          .on("drag", dragged)
	          .on("end", dragended))
		simulation.restart();
	}

    


	reStartForce();
	


	
	function ticked() {
		for(var i = 0;i<nodes.length;i++){
			if(nodes[i].w){

				nodes[i].y=(nodes[i].w-minW-1)*200;
			}
		}
   		svgLink.attr('points',function(d){
   			var m = 87;
   			if(d.Descendant.indexOf('tempRepeat-')>-1){//d.Ancestor.indexOf('tempRepeat-')<0||
				return d.source.x+','+d.source.y+' '+
					d.source.x+','+d.target.y+' '+
					d.target.x+','+(d.target.y);
   			}
   			if(d.Ancestor.indexOf('tempRepeat-')>-1){
   				m = 0;
   			}
   			return d.source.x+','+(d.source.y+m)+' '+
					d.source.x+','+(d.source.y+m+d.target.y)*1/2+' '+
					d.target.x+','+(d.source.y+m+d.target.y)*1/2+' '+
					d.target.x+','+(d.target.y);
   			;
   		});
		svgNode.attr("transform", function(d) { 
			return "translate(" + (d.x-75) + "," + d.y + ")";; 
		});
	}

	var zoom = d3.zoom()
	      .scaleExtent([0.5, 10])
	      .on("zoom", zoomed);

	function zoomed() {
	  svgGroup.attr("transform", 
	    "translate(" + d3.event.transform.x+","+d3.event.transform.y + ") scale(" + d3.event.transform.k + ")");
	}
	svg.call(zoom);

	function dragstarted(d) {
	  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
	  d.fx = d.x, d.fy = d.y;
	}

	function dragged(d) {
	  d.fx = d3.event.x, d.fy = d3.event.y;
	}

	function dragended(d) {
	  if (!d3.event.active) simulation.alphaTarget(0);
	  d.fx = null, d.fy = null;
	}

	document.getElementById('add').onclick = function(){
		var addId = Math.floor(Math.random()*10)+20;
		var addNode = {
				"ID": addId+'', 
				"w":1,
				"nodeid": "596ce63e-f2b5-4a31-b4ee-21f6bdec9b38", 
				"nodename": "兰花指", 
				"nodetitle": "兰花在花篮"
			};
		var addLink = {
				"Descendant": "5", 
				"Ancestor": addId+'', 
				"RelationName": ""
			};
		nodes.push(addNode);
		links.push(addLink);
		reStartForce();
	};
});