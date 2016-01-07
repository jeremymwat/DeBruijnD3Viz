function make_kmers(dna, ksize) {
  // read is the string to be read, ksize is the kmer size requested
  var read = dna[0].value;
  var kmer_list = [];

  for (var start = 0; start <= read.length-ksize; start++) {
    kmer_list.push(read.slice(start,start+ksize));
}
return kmer_list;

}

function find_node_index(arr, obj) {
  var i = 0
  for (i; i < arr.length; i++) {

    if (arr[i].name == obj) {
      return i;
  }
}
return -1;
}



function find_edge_index(arr, obj) {
  var i = 0


  for (i; i < arr.length; i++) {
    if (arr[i].source == obj.source && arr[i].target == obj.target ) {
      return i;
  }
}
return -1;
}



function make_dataset(kmer_list) {

  dataset = {nodes:[], edges:[], edge_counter:[]};

  dataset.nodes.push({name: kmer_list[0]});

  var i = 1;

  for (i = 1; i < kmer_list.length; i++) {

    var ind = find_node_index(dataset.nodes,kmer_list[i]); 
    var ind_edge = 0
  
    if (ind == -1) {
      // Not in the node list yet
      dataset.nodes.push({name: kmer_list[i]});
     
      var source_ind = find_node_index(dataset.nodes,kmer_list[i-1]);
      var target_ind = find_node_index(dataset.nodes,kmer_list[i]);

      ind_edge = find_edge_index(dataset.edges,{source: source_ind, target: target_ind})
     
      if (ind_edge == -1) {
        // add edge
        dataset.edges.push({source: source_ind, target: target_ind, counter:1});
    } else {
        // edge exists, increment edge counter
        dataset.edges[ind_edge].counter++;
    }

} else {
      // Node is already in list

      var source_ind = find_node_index(dataset.nodes,kmer_list[i-1]);

      ind_edge = find_edge_index(dataset.edges,{source: source_ind, target: ind})
     
      if (ind_edge == -1) {
        // add edge
        dataset.edges.push({source: source_ind, target: ind, counter:1});
    } else {
        // edge exists, increment edge counter
      dataset.edges[ind_edge].counter++;

    }
  }
} 
return dataset;
}


function draw_thing(dataset) {

    var w = 720;
    var h = 600;
    var linkDistance=200;

    var colors = d3.scale.category10();

    d3.select("svg").remove();

    var svg = d3.select("#graph").append("svg").attr({"width":w,"height":h});

    var force = d3.layout.force()
    .nodes(dataset.nodes)
    .links(dataset.edges)
    .size([w,h])
    .linkDistance([linkDistance])
    .charge([-500])
    .theta(0.1)
    .gravity(0.05)
    .start();



    var edges = svg.selectAll("line")
    .data(dataset.edges)
    .enter()
    .append("line")
    .attr("id",function(d,i) {return 'edge'+i})
    .attr('marker-end','url(#arrowhead)')
    .style("stroke","#ccc")
    .style("pointer-events", "none");
    
    var nodes = svg.selectAll("circle")
    .data(dataset.nodes)
    .enter()
    .append("circle")
    .attr({"r":15})
    .style("fill",function(d,i){return colors(i);})
    .call(force.drag)


    var nodelabels = svg.selectAll(".nodelabel") 
    .data(dataset.nodes)
    .enter()
    .append("text")
    .attr({"x":function(d){return d.x;},
      "y":function(d){return d.y;},
      "class":"nodelabel",
      "stroke":"black"})
    .text(function(d){return d.name;});

    var edgepaths = svg.selectAll(".edgepath")
    .data(dataset.edges)
    .enter()
    .append('path')
    .attr({'d': function(d) {return 'M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y},
     'class':'edgepath',
     'fill-opacity':0,
     'stroke-opacity':0,
     'fill':'blue',
     'stroke':'red',
     'id':function(d,i) {return 'edgepath'+i}})
    .style("pointer-events", "none");

    var edgelabels = svg.selectAll(".edgelabel")
    .data(dataset.edges)
    .enter()
    .append('text')
    .style("pointer-events", "none")
    .attr({'class':'edgelabel',
     'id':function(d,i){return 'edgelabel'+i},
     'dx':80,
     'dy':0,
     'font-size':10,
     'fill':'#aaa'});

    edgelabels.append('textPath')
    .attr('xlink:href',function(d,i) {return '#edgepath'+i})
    .style("pointer-events", "none")
    .text(function(d,i){return d.counter});


    svg.append('defs').append('marker')
    .attr({'id':'arrowhead',
     'viewBox':'-0 -5 10 10',
     'refX':25,
     'refY':0,
               //'markerUnits':'strokeWidth',
               'orient':'auto',
               'markerWidth':10,
               'markerHeight':10,
               'xoverflow':'visible'})
    .append('svg:path')
    .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
    .attr('fill', '#ccc')
    .attr('stroke','#ccc');

    force.on("tick", function(){

        edges.attr({"x1": function(d){return d.source.x;},
            "y1": function(d){return d.source.y;},
            "x2": function(d){return d.target.x;},
            "y2": function(d){return d.target.y;}
        });

        nodes.attr({"cx":function(d){return d.x;},
            "cy":function(d){return d.y;}
        });

        nodelabels.attr("x", function(d) { return d.x; }) 
        .attr("y", function(d) { return d.y; });

        edgepaths.attr('d', function(d) { var path='M '+d.source.x+' '+d.source.y+' L '+ d.target.x +' '+d.target.y;
                                               //console.log(d)
                                               return path});       

        edgelabels.attr('transform',function(d,i){
            if (d.target.x<d.source.x){
                bbox = this.getBBox();
                rx = bbox.x+bbox.width/2;
                ry = bbox.y+bbox.height/2;
                return 'rotate(180 '+rx+' '+ry+')';
            }
            else {
                return 'rotate(0)';
            }
        });
    });

}

var dna_t = document.querySelectorAll("#dna");
var kmer_size_t = document.querySelectorAll("#kmers");
var kmer_list_t = make_kmers(dna_t,Number(kmer_size_t[0].value));
var dataset = make_dataset(kmer_list_t);
draw_thing(dataset);

var button = document.querySelector("button") ;

button.addEventListener ("click", function () {
  var dna = document.querySelectorAll("#dna");
  var kmer_size = document.querySelectorAll("#kmers");
  var kmer_list = make_kmers(dna,Number(kmer_size[0].value));
  var dataset_v = make_dataset(kmer_list);
  draw_thing(dataset_v);
});



