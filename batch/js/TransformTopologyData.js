d3.json('data/traceNodes.json',function(error,jsonData){
	if (error) throw error;

	var graph = jsonData.rows[0],
		nodes = graph.NodeList,
      	links = graph.RelationList,
      	bilinks = [];
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
	 * 将links与nodes关联起来
	 * @method
	 * @author      三生
	 * @anotherdate 2016-08-15
	 * @param       {[type]}   d) {            return d.ID; } [description]
	 * @return      {[type]}      [description]
	 */
	var nodeById = d3.map(nodes, function(d) { return d.ID; })

	links.forEach(function(link) {
		link.source = nodeById.get(link.Ancestor),
		link.target = nodeById.get(link.Descendant); // intermediate node
	});
	
	
	
    function setNodeLeave(linkArr){
        //给任意点设置一个初始层级
        nodes[0]['v'] = 10;
        var setLeaveState = true,n = 0;
        do{
            n++;
            if(n>10){
                break;
            }
            for(var i = 0;i<linkArr.length;i++){
                n++;
                setLeaveState = false;
                if(linkArr[i]['target']['v']){
                    linkArr[i]['source']['v'] = linkArr[i]['target']['v']+1;
                }else if(linkArr[i]['source']['v']){
                    linkArr[i]['target']['v'] = linkArr[i]['source']['v']-1;
                }else{
                    setLeaveState = true;
                }
            }
        } while (setLeaveState);
    }
    setNodeLeave(links);
});