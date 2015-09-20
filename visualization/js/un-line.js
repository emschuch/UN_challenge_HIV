(function(){

    var margin = {line: {top: 20, right: 40, bottom: 40, left: 60}},
        width = 980,
        height = 600,
        w_line = width * 0.7 - margin.line.right - margin.line.left,
        h_line = height * 0.8 - margin.line.top - margin.line.bottom;


    /// SET-UP LINE CHART
    var x = d3.time.scale()
        .range([0, w_line]);

    var y = d3.scale.linear()
        .range([h_line, 0]);

    var svgline = d3.select('#linechart').insert("svg:svg")
        .attr('class', 'bg-graylt')
        .attr("width", width * 0.7)
        .attr("height", height * 0.8);

    var line = d3.svg.line()
        .x(function (d) { return x(d.year); })
        .y(function (d) { return y(d.rate); });

    var formatAsPercentage = d3.format(".1%");

    var parse_date = d3.time.format("%Y%m%d").parse;

    var color = d3.scale.category10();


////////// CSV CALL

    d3.csv('js/hiv_byregion.csv', function (error, byregion) {
            if (error) return console.error(error);


        /// MAKE LINE CHART
        color.domain(d3.keys(byregion[0]).filter(function (key) { return key !== 'year'; }));

        byregion.forEach(function (d) {
            d.year = parse_date(d.year);
        });

        var regions = color.domain().map(function (name) {
            return {
              name: name,
              values: byregion.map(function (d) {
                return {year: d.year, rate: +d[name]};
              })
            };
        });

        x.domain(d3.extent(byregion, function (d) { return d.year; }));
        y.domain([0, 0.013]).nice();

        svgline.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(" + (margin.line.left + 10) + "," 
                                        + (h_line + margin.line.top) + ")")
          .call(d3.svg.axis()
            .scale(x)
            .orient("bottom"));

        svgline.append("g")
          .attr("class", "axis axis--y")
          .attr("transform", "translate(" + margin.line.left + "," 
                                            + margin.line.top + ")")
          .call(d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(6, '%')
          );

        var region = svgline.selectAll(".region")
            .data(regions)
          .enter().append("g")
            .attr("class", "region");

        region.append("path")
            .attr('class', function (d) {
                if (d.name === 'Sub-Saharan Africa') {
                    return 'region--selected line'; 
                }
                else if (d.name === 'Worldwide Mean') {
                    return 'world--selected line'
                }
                else { return 'line'; }
            })
            .attr("d", function (d) { return line(d.values); })
            .attr("transform", function(d) { return "translate(" + (margin.line.left +10)
                    + "," + margin.line.top + ")"; });

        region.append("text")
            .datum(function (d) { return {name: d.name, value: d.values[d.values.length - 17]}; })
            .attr('class', function (d) {
                if (d.name === 'Sub-Saharan Africa') {
                    return 'region-text'
                } 
                else if (d.name === 'Worldwide Mean') { 
                    return 'world-text'}      
            })
            .attr("transform", function(d) { return "translate(" 
                + x(d.value.year) + "," + y(d.value.rate) + ")"; })
            .attr("x", 30)
            .attr("y", 0)
            .attr('text-anchor', 'middle')
            .text(function (d) { 
                if (d.name === 'Sub-Saharan Africa' || d.name === 'Worldwide Mean') {
                    return d.name; 
                }
            });


        var lines = d3.selectAll('.line')
        lines
          .call(d3.helper.tooltip(
            function (d) {
                return "<b>" 
                + d.name
                + "</b>"
                }
          ));

    });

})();