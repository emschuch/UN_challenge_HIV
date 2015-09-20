(function(){

    var currentyear = 1990;

    var years = [];
    for (var i = 1990; i <= 2013; i++) {
        years.push(i);
    };

    var margin = {heat: {top: 30, right: 0, bottom: 0, left: 135}},
        width = 980,
        height = 600,
        w_heat = width - margin.heat.right - margin.heat.left,
        h_heat = height - margin.heat.top - margin.heat.bottom;


    /// SET UP HEATMAP
    var n_countries = 20;

    var colors = d3.scale.linear()
        .domain([0, 4, 6])
        .range(['#FFF', '#F62217', '#9F000F']);

    var h_scale = d3.scale.linear()
        .domain([0, n_countries])
        .range([0, h_heat]);

    var w_scale = d3.scale.linear()
        .domain([0, 24])
        .range([0, w_heat]);

    var svgheat = d3.select('#heatmap').insert('svg:svg')
        .attr('class', 'slidecolor2')
        .attr('width', width)
        .attr('height', height);


    /// SET-UP MAP
    var projection = d3.geo.equirectangular()
        .center([6, 12])
        .scale(230);

    var path = d3.geo.path()
        .projection(projection);

    var svgmap = d3.select("#map").insert("svg:svg")
        .attr('class', 'bg-graylt')
        .attr("width", width)
        .attr("height", height);

    var countries = svgmap.append("svg:g")
        .attr("class", "countries");

    var circles = svgmap.append("svg:g")
        .attr("id", "circles");

    var labels = svgmap.append("svg:g")
        .attr("id", "labels");

    var radius = d3.scale.sqrt()
        .domain([0, 6])
        .range([0, 35]);


    d3.select('#year').text(currentyear);


    queue()
        .defer(d3.json, 'js/world.json')
        .defer(d3.csv, 'js/hiv_incidence.csv')
        .await(ready);


////////// LOAD THE DATA
    function ready(error, world, hiv) {
        if (error) return console.error(error);


        var world_data = d3.map( hiv, function(d) { return d.id; });

        console.log(world_data);

        /// MAKE HEATMAP
        var heatdata = hiv.slice(0,n_countries)

        var heatcountries = svgheat.append('g')
            .attr('class', 'heat-y-labels');

        heatcountries.selectAll('county-labels')
            .data(heatdata)
          .enter().append('text')
            .attr('class', 'heat-country')
            .text(function (d) { 
                if (d.name === 'United Republic of Tanzania') {
                    return 'Tanzania'
                } if (d.name === 'Central African Republic') {
                    return 'Central\n African Rep'
                } else { return d.name; }
            })
            .attr('x', 0)
            .attr('y', function (d, i) { return h_scale(i) + h_scale(1) - 6; })
            .attr('transform', 'translate(' + (margin.heat.left - 15) + ',' + margin.heat.top + ')')
            .style('text-anchor', 'end');

        var heatyears = svgheat.append('g')
            .attr('class', 'heat-x-labels');

        heatyears.selectAll('year-labels')
            .data(years)
          .enter().append('text')
            .attr('class', 'heat-year')
            .text(function (d) { return "'" + String(d).slice(2,4); })
            .attr('x', function (d, i) { return w_scale(i); })
            .attr('transform', 'translate(' + (margin.heat.left + w_scale(0.5)) 
                                            + ',' + (margin.heat.top - 15) + ')')
            .attr('text-anchor', 'middle');

        var heatmap = svgheat.append('g')
            .attr('class', 'heat-map')
            .attr('transform', 'translate(' + margin.heat.left + ',' + margin.heat.top + ')')
            .style('cursor', 'crosshair');


        for (var j = 0; j < years.length; j++) {

            var year = years[j]

            heatmap.append('g')
                .attr('class', 'y' + String(year))
              .selectAll('rects')
                .data(heatdata)
              .enter().append('rect')
                .attr('class', 'heat-cell')
                .attr('x', function (d) { return j * w_scale(1); })
                .attr('y', function (d, i) { return h_scale(i); })
                .attr('width', w_scale(1))
                .attr('height', h_scale(1))
                .style('fill', function (d) {
                    if ( d[year] !== "" ) {
                        return colors(d[year])
                    } else {
                        return '#B6B6B4'
                    }
                });

            d3.select('.y' + String(years[j]))
              .selectAll('texts')
                .data(heatdata)
              .enter().append('text')
                .attr('class', 'heat-text hidden')
                .attr('x', function (d) { return j * w_scale(1); })
                .attr('y', function (d, i) { return h_scale(i); })
                .text(function (d) { 
                    var num = +d[year]
                    if (num === 0) {
                        return 'NA'
                    } else {
                        return num.toFixed(2);
                    }
                })
                .attr('transform', 'translate(' + (w_scale(0.5)) + ',' + (h_scale(0.7)) + ')' )
                .attr('text-anchor', 'middle')
                .style('fill', function (d) {
                    if ( +d[year] > 2.5 ) {
                        return '#FFF'
                    } else {
                        return '#000'
                    }
                });

        };

        var cells = d3.selectAll('.heat-cell')

        var texts = d3.selectAll('.heat-text')


        texts.on('mouseover', function () {
                d3.select(this).classed('hidden', false)
            })
            .on('mouseout', function () {
                d3.select(this).classed('hidden', true)
            });



        /// MAKE MAP
        countries.selectAll(".countries")
            .data(topojson.feature(world, world.objects.subunits).features)
          .enter().append("path")
            .attr("class", function(d) { return "subunit " + d.id; })
            .attr("d", path);

        countries.append("path")
            .datum(topojson.mesh(world, world.objects.subunits, function(a, b) { return a !== b; }))
            .attr("d", path)
            .attr("class", "countries-boundary");


        function draw_circles(year) {

            svgmap.append("g")
                .attr("class", "bubblegroup")
              .selectAll("circle")
                .data(topojson.feature(world, world.objects.subunits).features)
              .enter().append("circle")
                .attr('class', 'bubble')
                .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
                .attr("r", function(d) { 
                    try { return radius(world_data.get(d.id)[currentyear]); }
                    catch(err) { return 0; }
                });

        }

        draw_circles(currentyear);

        var bubbles = d3.selectAll('.bubble')

        d3.select('#slider')
          .call(
            d3.slider()
               .value(currentyear)
               .min(1990)
               .max(2013)
               .step(1)
               .axis(true)
               .on("slide", function(evt,value) {
                    d3.select('#year').text(value);
                    currentyear = value;

                    bubbles
                        .attr("r", function(d) { 
                            try {  return radius(world_data.get(d.id)[currentyear]); }
                            catch(err) { return 0; }
                        });

               })
        );


        bubbles
          .call(d3.helper.tooltip(
            function (d) {
                return "<b>" 
                + world_data.get(d.id)['name']
                + "</b><br/>Rate: "
                // + d.properties.hiv
                + world_data.get(d.id)[currentyear]
                + "%";
                }
          ));


    };

    ///// END DATA CALL


    // add tooltip rollovers
    d3.helper = {};

    d3.helper.tooltip = function(accessor){
      return function(selection){
          var tooltipDiv;
          var bodyNode = d3.select('body').node();
          selection.on("mouseover", function(d, i){
              // Clean up lost tooltips
              d3.select('body').selectAll('div.tooltip').remove();
              // Append tooltip
              tooltipDiv = d3.select('body').append('div').attr('class', 'tooltip');
              var absoluteMousePos = d3.mouse(bodyNode);
              tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                  .style('top', (absoluteMousePos[1] - 15)+'px')
                  .style('position', 'absolute') 
                  .style('z-index', 1001);
              // Add text using the accessor function
              var tooltipText = accessor(d, i) || '';
          })
          .on('mousemove', function(d, i) {
              // Move tooltip
              var absoluteMousePos = d3.mouse(bodyNode);
              tooltipDiv.style('left', (absoluteMousePos[0] + 10)+'px')
                  .style('top', (absoluteMousePos[1] - 15)+'px');
              var tooltipText = accessor(d, i) || '';
              tooltipDiv.html(tooltipText);
          })
          .on("mouseout", function(d, i){
              // Remove tooltip
              tooltipDiv.remove();
          });

      };
    };

})();
