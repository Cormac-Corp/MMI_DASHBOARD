d3.json("data/bar.json").then(function(data){
    var enrolled = data["Enrolled"].map((d) => parseInt(d));
    var target = data["Target"].map((d) => parseInt(d));
    var dates = data["Date"]
    var dt = [];
    for (let i = 0; i < dates.length; i++) {
        var ds = {
            date: dates[i],
            enrolled: enrolled[i],
            target: target[i]
        }
        dt.push(ds)
    }
    console.log(dt);
    var bar = new BarChart("#bar",dt,"date","enrolled","Enrolled","time","linear")
})
// // $("#bar-select").on("change",function(){
// //     bar1.wrangleData("name",$("#var-select").val())
// // })