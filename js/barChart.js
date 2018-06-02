BarChart = function (_element, _data, _x, _y, _title, _xs, _ys) {
    this.element = _element;
    this.parent = $(_element)
    this.data = _data;
    this.xv = _x;
    this.yv = _y;
    this.title = _title;
    this.xs = _xs;
    this.ys = _ys;
    this.initVis()
}
BarChart.prototype.initVis = function() {
    var vis = this;
    vis.margin = {
        left: 50,
        right: 20,
        top: 50,
        bottom: 70
    };
    // console.log(vis.parent.getAttribute("height"));
    vis.height = +$(vis.element).height() - vis.margin.top - vis.margin.bottom;
    vis.width = +$(vis.element).width() - vis.margin.left - vis.margin.right;
    vis.svg = d3.select(vis.element)
        .append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom);
    vis.g = vis.svg.append("g")
        .attr("transform", "translate(" + vis.margin.left +
            ", " + vis.margin.top + ")");
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .html(function (d) {
            var keys = Array.from(Object.keys(d))
            var text = "<strong>" + vis.xv + ": </strong> " + d[vis.xv] + "<br> <strong>" + vis.yv + ": </strong> " + d[vis.yv];
            return text;
        })
    //   .direction('nw')
    //   .offset([0, 3])
    vis.g.call(vis.tip);

    vis.t = function () {
        return d3.transition().duration(1000);
    }
    vis.x = d3.scaleBand().range([0, vis.width]);
    vis.y = d3.scaleLinear()
        .range([vis.height, 0])
    vis.yAxisCall = d3.axisLeft()
    vis.xAxisCall = d3.axisBottom()
        .ticks(4);
    vis.xAxis = vis.g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.g.append("g")
        .attr("class", "y axis");
    vis.titleElement = vis.g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", vis.width / 2)
        .attr("y", -15)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text(vis.title)
    vis.xlabel = vis.g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", vis.width / 2)
        .attr("y", vis.height + vis.margin.bottom)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .text(vis.xv)
    vis.ylabel = vis.g.append("text")
        .attr("class", "x-axis-label")
        .attr("x", -(vis.height / 2))
        .attr("y", -40)
        .attr("font-size", "20px")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .text(vis.yv)
    vis.wrangleData(vis.xv, vis.yv)
}
BarChart.prototype.wrangleData = function(_xv, _yv) {
    var vis = this;
    vis.xv = _xv;
    vis.yv = _yv;
    vis.updateVis();
}
BarChart.prototype.updateVis = function() {
    var vis = this;

    // Update scales
    try {
        vis.x.domain(vis.data.map(function (d) {
            return d[vis.xv];
        }));
        vis.y.domain([0, d3.max(vis.data, function (d) {
            return d[vis.yv];
        }) * 1.005]);
    } catch (e) {
        vis.x.domain(vis.data[vis.xv].map(function (d) {
            return d
        }));
        vis.y.domain([0, d3.max(vis.data[vis.yv], function (d) {
            return d;
        }) * 1.005]);
    }
    vis.xAxisCall.scale(vis.x);
    vis.xAxis.transition(vis.t())
        .call(vis.xAxisCall)
        .selectAll("text")
        .attr("y", "10")
        .attr("x", "-5")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-40)");
    vis.yAxisCall.scale(vis.y);
    vis.yAxis.transition(vis.t()).call(vis.yAxisCall);
    vis.ylabel.text(vis.yv)
    vis.xlabel.text(vis.xv)
    vis.rectangles = vis.g.selectAll("rect")
        .data(vis.data);
    vis.rectangles.exit()
        .attr("fill", "green")
        .transition(vis.t)
        .attr("y", vis.y(0))
        .attr("height", 0)
    vis.rectangles.transition(vis.t)
        .attr("x", function (d, i) {
            return vis.x(d[vis.xv][i]);
        })
        .attr("y", function(d, i) {
            console.log(d)
            vis.y(d[vis.yv][i])
        })
        .attr("height", function (d, i) {
            return vis.height - vis.y(d[vis.yv]);
        })
        .attr("width", function(d)  {
            return vis.x.bandwidth() - 7;
        })
    // Enter
    vis.rectangles.enter()
        .append("rect")
        .attr("x", function (d, i) {
            return vis.x(d[vis.xv]) + 5;
        })
        .attr("height", function(d)  {
            return vis.height - vis.y(d[vis.yv]);
        })
        .attr("fill", function(d, i)  {
            return "green";
        })
        .attr("y", vis.y(0))
        .on("mouseover", vis.tip.show)
        .on("mouseout", vis.tip.hide)
        .transition(vis.t)
        .attr("y", function(d) {return vis.y(d[vis.yv])})
        .attr("fill", "green")
        .attr("width", function(d) {
            return vis.x.bandwidth() - 7;
        })
}