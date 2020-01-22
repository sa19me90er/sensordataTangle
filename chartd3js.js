window.onload=run()

function run(){


var	parseDate = d3.time.format("%d/%m/%Y %I:%M:%S").parse;

// set the dimensions and margins of the graph
var margin = {top: 30, right: 0, bottom: 70, left: 60},
    width = 700 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")")

     
// Initialize the X axis
var x = d3.scaleBand()
  .range([0,width])
  .padding(1);



var xAxis = svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + height + ")")
  

// Initialize the Y axis
var y = d3.scaleLinear()
  .range([ height, 0]);
var yAxis = svg.append("g")
  .attr("class", "myYaxis")
 
var index=0;
// A function that create / update the plot for a given variable:
function update(selectedVar) {

  // Parse the Data
  d3.csv("data.csv", function(data) {
  <!-- data= oldData.slice(index, index + 20); -->
    <!-- update(data); -->
	
	data.forEach(function(d) {
		d.dateTime = parseDate(d.dateTime).toLocaleString();
	});
	
    //Add X axis
	//heeeeeeere
    x.domain(data.map(function(d) { return d.dateTime; }))
    xAxis.transition().duration(2000).call(d3.axisBottom(x))
        .selectAll('text')
        .style('text-anchor', 'start')
		.style("font", "6px arial")
        .attr('transform', 'translate(10,0) rotate(75 -2 2)' )

       
    // Add Y axis
    y.domain([0, d3.max(data, function(d) { return +d[selectedVar] }) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(y));

    // variable u: map data to existing circle
    var j = svg.selectAll(".myLine")
      .data(data)
    // update lines
    j
      .enter()
      .append("line")
      .attr("class", "myLine")
      .merge(j)
      .transition()
      .duration(1000)
        .attr("x1", function(d) { console.log((d.dateTime)) ; return x(d.dateTime); })
        .attr("x2", function(d) { return x(d.dateTime); })
        .attr("y1", y(0))
        .attr("y2", function(d) { return y(d[selectedVar]); })
        .attr("stroke", "gray")
		.attr("stroke-width", 5);


    // variable u: map data to existing circle
    var u = svg.selectAll("rect")
      .data(data)
	  
    // update bars
    u
      .enter()
      .append("rect")
      .merge(u)
      .transition()
      .duration(1000)
        .attr("cx", function(d) { return x(d.dateTime); })
        .attr("cy", function(d) { return y(d[selectedVar]); })
        .attr("r", 8)
        .attr("fill", "#69b3a2");
  })
}

document.getElementById('humidity').addEventListener("click", function(){
update('humidity')
document.getElementById('title').innerHTML = 'Luchtvochtigheid'
});

document.getElementById('temperature').addEventListener("click", function(){
update('temperature')
document.getElementById('title').innerHTML = 'Tempratuur'

});

document.getElementById('pressure').addEventListener("click", function(){
update('pressure')
document.getElementById('title').innerHTML = 'Luchtdrukte'
});


// Initialize plot
update('temperature')

}