var topic = "Applications";
var metric = "(D)Applications Submitted";
var filteredData;
var dt;
var linestates = ["Alabama", "Alaska"];
staticGraph(linestates)
Plotly.d3.json("data/bar.json", function(data){
    console.log(data)
    var enrolled = data["Enrolled"].map(function(d) {return parseInt(d)});
    var target = data["Target"].map(function (d) {return parseInt(d)});
    var dates = data["Date"]
    var bard = [];
    for (let i = 0; i < dates.length; i++) {
        var ds = {
            date: dates[i],
            enrolled: enrolled[i],
            target: target[i]
        }
        bard.push(ds)
    }
    console.log(dt);
    var bar = new BarChart("#bar",bard,"date","enrolled","Enrolled","time","linear")
})
function staticGraph(lnstates) {
    Plotly.d3.json('data/static.json', function (data) {
        var percents = data["Percent"].map(function(d){ return parseInt(d) })
        var states = data["State"]
        var statesf = [];
        for (var i = 0; i < states.length; i++) {
            if (statesf.indexOf(states[i]) < 0){
                statesf.push(states[i])
            }
            
        }
        console.log(statesf);
        var traces = [];
        var datesf = data["Date"]
        var dates = []
        datesf.forEach(function (v) { 
            if(dates.indexOf(v) < 0){
                dates.push(v)
            }
        })
        dates = dates.slice(dates.length - 4, dates.length)
        var dts = {};
        console.log("Nijs")
        console.log(statesf);
        for (let key = 0; key < statesf.length; key++) {
            dts[statesf[key]] = []
        }
        console.log("Dts")
        console.log(dts)
        for (let key = 0; key < percents.length; key++) {
            dts[states[key]].push(percents[key])
        }
        for (let i = 0; i < linestates.length; i++) {
            state = linestates[i]
            var trace = {
                x: dates,
                y: dts[state].slice(dts[state].length - 4, dts[state].length),
                type: 'scatter',
                name: state
            }
            traces.push(trace)
        }
        Plotly.newPlot('line', traces)
    });
}
Plotly.d3.json('data/choropleth.json', function (data) {
    var topics = Object.keys(data)
    topics.splice(topics.indexOf(""), 1)
    for (let key = 0; key < topics.length; key++) {
        var opt = document.createElement("li");
        opt.innerHTML = topics[key];
        if (topics[key] == "Applications") {
            opt.classList.add("active")
        }
        opt.onclick = topicOnclick;
        opt.classList.add("list-group-item")
        document.getElementById("topic-select").appendChild(opt);
    }
    // console.log(topics.includes("")
    choro(topic, metric, linestates)
})

function choro(topic, metric, linestates) {
    Plotly.d3.json('data/choropleth.json', function (data) {
        function unpack(data, key) {
            return data.map(function(d) { return d[key] })
        }
        $("#metric-select").empty();
        var dlist = [];
        filteredData = data[topic];
        var metricss = new Set();
        metric = (metric == "") ? filteredData[0]["Metric"] : metric;
        for (let i = 0; i < filteredData.length; i++) {
            if (filteredData[i]["Metric"] == metric) {
                dlist.push(filteredData[i])
            }
            metricss.add(filteredData[i]["Metric"])
        }
        var metrics = []
        metricss.forEach(function(d){metrics.push(d)})
        metrics.splice(metrics.indexOf(""), 1)
        for (let key = 0; key < metrics.length; key++) {
            var opt = document.createElement("li");
            if (metrics[key] == metric) {
                opt.classList.add("active")
            }
            opt.classList.add("list-group-item")
            opt.onclick = metricOnclick;
            opt.innerHTML = metrics[key];
            document.getElementById("metric-select").appendChild(opt);
        }
        var textarr = [];
        var states = unpack(dlist, 'State')
        var statesfil = [];
        states.forEach(function (v) { 
            if(statesfil.indexOf(v) < 0){
                statesfil.push(v)
            }
        })
        var shtp = unpack(dlist, 'Shop Type')
        var mde = unpack(dlist, 'Medical Expansion')
        var exc = unpack(dlist, 'Exchange')
        var values = unpack(dlist, 'Value');
        var datesf = unpack(dlist, 'Date')
        var dates = [];
        datesf.forEach(function (v) {
            if (dates.indexOf(v) < 0) {
                dates.push(v)
            }
        })
        var valsD = {}
        var vals = []
        $("#state-select").empty()
        for (let i = 0; i < statesfil.length; i++) {
            var li = document.createElement("li")
            li.innerHTML = statesfil[i];
            li.classList.add("list-group-item");
            if (linestates.indexOf(statesfil[i]) >= 0) {
                li.classList.add("active")
            }
            li.onclick = stateOnClick;
            document.getElementById("state-select").appendChild(li)
            valsD[statesfil[i]] = [];
        }
        for (let i = 0; i < states.length; i++) {
            valsD[states[i]].push(values[i])
        }
        for (var i in valsD) {
            vals.push(valsD[i].reduce(function(a, b) { return a + b }))
        }
        console.log(vals)
        for (let v = 0; v < statesfil.length; v++) {
            var st = "";
            st += "State: " + states[v] + "<br>"
            st += "Medical Expansion: " + mde[v] + "<br>"
            st += "Shop Type: " + shtp[v] + "<br>"
            st += "Exchange: " + exc[v] + "<br>"
            textarr.push(st)
        }
        var traces = [];
        for (let i = 0; i < linestates.length; i++) {
            var trace = {
                type: 'scatter',
                name: linestates[i],
                x: dates,
                y: valsD[linestates[i]]
            };
            traces.push(trace);
        }
        console.log(traces)
        // console.log(unpack(filteredData,"Value"))
        $("choropleth").empty();
        var data = [{
            type: 'choropleth',
            locationmode: 'USA-states',
            locations: unpack(dlist, 'Code'),
            z: vals,
            text: textarr,
            zmin: 0,
            zmax: d3.max(dlist, function(d) { return d["Value"] }),
            autocolorscale: true,
            showscale: false,
            hoverinfo: 'location+z+text',
            marker: {
                line: {
                    color: 'rgb(255,255,255)',
                    width: 2
                }
            }
        }]
        var layout = {
            title: '',
            geo: {
                scope: 'usa',
                showlakes: true,
                lakecolor: 'rgb(0,0,255)'
            }
        };
        Plotly.plot('choropleth', data, layout, {
            showLink: false
        });
        Plotly.newPlot('line2', traces)

    });
}
// $("#topic-select").on("change", function () {
//     topic = $("#topic-select").val();
//     metric = "";
//     choro(topic, metric);
// })
// $("#metric-select").on("change", function () {
//     topic = $("#topic-select").val();
//     metric = $("#metric-select").val();
//     choro(topic, metric);
// })
var tps = document.getElementById("topic-select").getElementsByTagName("li")

function topicOnclick() {
    topic = this.innerHTML;
    metric = ""
    for (let i = 0; i < tps.length; i++) {
        tps[i].classList.remove("active");
    }
    this.classList.add("active")
    choro(topic, metric, linestates)
}
var mps = document.getElementById("metric-select").getElementsByTagName("li")

function metricOnclick() {
    metric = this.innerHTML;
    for (let i = 0; i < mps.length; i++) {
        mps[i].classList.remove("active");
    }
    this.classList.add("active")
    choro(topic, metric, linestates)
}

var sps = document.getElementById("state-select").getElementsByTagName("li")

function stateOnClick() {
    linestates = []
    for (let k = 0; k < sps.length; k++) {
        if (sps[k].classList.contains("active")) {
            linestates.push(sps[k].innerHTML)
        }
    }
    if (!$(this).hasClass("active")) {
        if (linestates.indexOf(this.innerHTML) < 0) {
            linestates.push(this.innerHTML);
            $(this).addClass("active")
        }
    } else {
        $(this).removeClass("active")
        var index = linestates.indexOf(this.innerHTML)
        if (index > -1) {
            linestates.splice(index, 1);
        }
    }
    console.log(linestates)
    choro(topic, metric, linestates);
    staticGraph(linestates);
}