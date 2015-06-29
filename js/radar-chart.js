    var datastudents = [];
    var studentList;
    var currentStudent;


    //haal de data uit de json file
    function getData(){
      d3.json("data.json", function(error, json){
        studentList = json;
        fillDropdown();
      })
    }

    //zet de data om in een leesbare structuur voor de radarchart
    function getRadar(name){
      currentStudent = getObj(name);
      var axes1 = [];
      for( var key in currentStudent) {
        var temp = {axis: key, value: currentStudent[key]};
        axes1.push(temp);
      }
      
      var student = {
        className: name,
        axes: axes1
      }
      
      datastudents = [student];
    }


    function drawRadar(){
      d3.select("svg").remove();
      var chart = RadarChart.chart();
      
      var svg = d3.select('#radar').append('svg')
              .attr('width', 600)
              .attr('height', 800);
            svg.append('g').classed('focus', 1).datum(datastudents).call(chart);

    }
    
    //vul de dropdown menu 
    function fillDropdown(){

      var drop = document.getElementById('studentdropdown');

      for(var i = 0; i<studentList.length; i++){
        var opt = document.createElement("option");
        opt.innerHTML = studentList[i].name;
        opt.value = studentList[i].name;

        drop.appendChild(opt);
      }

    }

    //haal de student uit de "database"
    function getObj(Name){

      for(var i = 0; i <studentList.length; i++){
        if(studentList[i].name == Name){
          return studentList[i].values;
        }
      }
    }

    
    function clickhandler(){
      var name = document.getElementById("studentdropdown").value
      getRadar(name);
      drawRadar();
      renderBarchart();
      return false;
    }


    function renderBarchart(){
      var pData = currentStudent;
      var lValues = [pData.length];
      var lNames  = [pData.length];
      var i = 0;
      for (var key in pData) { //elke key in cijfer lijst
        lValues[i]  = pData[key]; //cijfer bij elke key
        lNames[i] = key;  //subj naam
        i++;
      }

      //Create elements for each data object
      d3.select("#chart").selectAll("div.h-bar")
      .data(lValues)
      .enter()
      .append("div")
      .attr("class", "h-bar")
      .append("span");

      //delete elements not associated with data element
      d3.select("#chart").selectAll("div.h-bar")
      .data(lValues)
      .exit().remove();


      d3.select("#chart").selectAll("div.h-bar") 
      .data(lValues)
      .attr("class", "h-bar")
      .style("width", function (d) {
        return ( d * 50) + "px";
      }

      )
      .select("span")
      .text(function (d, i ) {
        return lNames[i] + " " +  d.toFixed(2);
      });

    }


//Radar chart code begint hier
var RadarChart = {
  defaultConfig: {
    containerClass: 'radar-chart',
    w: 600,
    h: 600,
    factor: 0.95,
    factorLegend: 1,
    levels: 10,
    levelTick: false,
    TickLength: 10,
    maxValue: 10,
    radians: 2 * Math.PI,
    color: d3.scale.category10(),
    axisLine: true,
    axisText: true,
    circles: true,
    radius: 5,
    backgroundTooltipColor: "#555",
    backgroundTooltipOpacity: "0.7",
    tooltipColor: "white",
    axisJoin: function(d, i) {
      return d.className || i;
    },
    transitionDuration: 300
  },




  chart: function() {
    // default config
    var cfg = Object.create(RadarChart.defaultConfig);
    var toolip;
    function setTooltip(msg){
      if(msg == false){
        tooltip.classed("visible", 0);
        tooltip.select("rect").classed("visible", 0);
      }else{
        tooltip.classed("visible", 1);

        var x = d3.event.x;
        y = d3.event.y;

        tooltip.select("text").classed('visible', 1).style("fill", cfg.tooltipColor);
        var padding=5;
        var bbox = tooltip.select("text").text(msg).node().getBBox();

        tooltip.select("rect")
        .classed('visible', 1).attr("x", 0)
        .attr("x", bbox.x - padding)
        .attr("y", bbox.y - padding)
        .attr("width", bbox.width + (padding*2))
        .attr("height", bbox.height + (padding*2))
        .attr("rx","5").attr("ry","5")
        .style("fill", cfg.backgroundTooltipColor).style("opacity", cfg.backgroundTooltipOpacity);
        tooltip.attr("transform", "translate(" + x + "," + y + ")")
      }
    }
    function radar(selection) {
      selection.each(function(data) {
        var container = d3.select(this);
        tooltip = container.append("g");
        tooltip.append('rect').classed("tooltip", true);
        tooltip.append('text').classed("tooltip", true);

        // allow simple notation
        data = data.map(function(datum) {
          if(datum instanceof Array) {
            datum = {axes: datum};
          }
          return datum;
        });

        var maxValue = Math.max(cfg.maxValue, d3.max(data, function(d) {
          return d3.max(d.axes, function(o){ return o.value; });
        }));

        var allAxis = data[0].axes.map(function(i, j){ return {name: i.axis, xOffset: (i.xOffset)?i.xOffset:0, yOffset: (i.yOffset)?i.yOffset:0}; });
        var total = allAxis.length;
        var radius = cfg.factor * Math.min(cfg.w / 2, cfg.h / 2);
        var radius2 = Math.min(cfg.w / 2, cfg.h / 2);

        container.classed(cfg.containerClass, 1);

        function getPosition(i, range, factor, func){
          factor = typeof factor !== 'undefined' ? factor : 1;
          return range * (1 - factor * func(i * cfg.radians / total));
        }
        function getHorizontalPosition(i, range, factor){
          return getPosition(i, range, factor, Math.sin);
        }
        function getVerticalPosition(i, range, factor){
          return getPosition(i, range, factor, Math.cos);
        }

        function refresh(subject, grade){
          
          for(var k in currentStudent){
          
            if(k == subject){
              currentStudent[k] = grade;
            }
          }

          renderBarchart();


          polygon.attr('points',function(d) {
            return d.axes.map(function(p) {

              return [p.x, p.y].join(',');
            }).join(' ');
          })
        }

        // levels && axises
        var levelFactors = d3.range(0, cfg.levels).map(function(level) {
          return radius * ((level + 1) / cfg.levels);
        });

        var levelGroups = container.selectAll('g.level-group').data(levelFactors);

        levelGroups.enter().append('g');
        levelGroups.exit().remove();

        levelGroups.attr('class', function(d, i) {
          return 'level-group level-group-' + i;
        });

        var levelLine = levelGroups.selectAll('.level').data(function(levelFactor) {
          return d3.range(0, total).map(function() { return levelFactor; });
        });

        levelLine.enter().append('line');
        levelLine.exit().remove();

        if (cfg.levelTick){
          levelLine
          .attr('class', 'level')
          .attr('x1', function(levelFactor, i){
            if (radius == levelFactor) {
              return getHorizontalPosition(i, levelFactor);
            } else {
              return getHorizontalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
            }
          })
          .attr('y1', function(levelFactor, i){
            if (radius == levelFactor) {
              return getVerticalPosition(i, levelFactor);
            } else {
              return getVerticalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
            }
          })
          .attr('x2', function(levelFactor, i){
            if (radius == levelFactor) {
              return getHorizontalPosition(i+1, levelFactor);
            } else {
              return getHorizontalPosition(i, levelFactor) - (cfg.TickLength / 2) * Math.cos(i * cfg.radians / total);
            }
          })
          .attr('y2', function(levelFactor, i){
            if (radius == levelFactor) {
              return getVerticalPosition(i+1, levelFactor);
            } else {
              return getVerticalPosition(i, levelFactor) + (cfg.TickLength / 2) * Math.sin(i * cfg.radians / total);
            }
          })
          .attr('transform', function(levelFactor) {
            return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
          });
        }
        else{
          levelLine
          .attr('class', 'level')
          .attr('x1', function(levelFactor, i){ return getHorizontalPosition(i, levelFactor); })
          .attr('y1', function(levelFactor, i){ return getVerticalPosition(i, levelFactor); })
          .attr('x2', function(levelFactor, i){ return getHorizontalPosition(i+1, levelFactor); })
          .attr('y2', function(levelFactor, i){ return getVerticalPosition(i+1, levelFactor); })
          .attr('transform', function(levelFactor) {
            return 'translate(' + (cfg.w/2-levelFactor) + ', ' + (cfg.h/2-levelFactor) + ')';
          });
        }
        var i = 0
        if(cfg.axisLine || cfg.axisText) {

          var axis = container.selectAll('.axis').data(allAxis);

          var newAxis = axis.enter().append('g');
          if(cfg.axisLine) {
            newAxis.append('line');
          }
          if(cfg.axisText) {
            newAxis.append('text');
          }

          axis.exit().remove();
          

          axis.attr('class', 'axis');
          i++;
          if(cfg.axisLine) {
            axis.select('line')
            .attr('x1', cfg.w/2)
            .attr('y1', cfg.h/2)
            .attr('x2', function(d, i) { return (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factor); })
            .attr('y2', function(d, i) { return (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factor); });
          }

          if(cfg.axisText) {
            axis.select('text')
            .attr('class', function(d, i){
              var p = getHorizontalPosition(i, 0.5);

              return 'legend ' +
              ((p < 0.4) ? 'left' : ((p > 0.6) ? 'right' : 'middle'));
            })
            .attr('dy', function(d, i) {
              var p = getVerticalPosition(i, 0.5);
              return ((p < 0.1) ? '1em' : ((p > 0.9) ? '0' : '0.5em'));
            })
            .text(function(d) { return d.name; })
            .attr('x', function(d, i){ return d.xOffset+ (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, cfg.factorLegend); })
            .attr('y', function(d, i){ return d.yOffset+ (cfg.h/2-radius2)+getVerticalPosition(i, radius2, cfg.factorLegend); });
          }
        }
        
        container.selectAll('.axis').each(function(d,i){
          var axisid = "axis" + i;
          d3.select(this).attr('id', axisid);
        })
        // content
        data.forEach(function(d){
          d.axes.forEach(function(axis, i) {
            axis.x = (cfg.w/2-radius2)+getHorizontalPosition(i, radius2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor);
            axis.y = (cfg.h/2-radius2)+getVerticalPosition(i, radius2, (parseFloat(Math.max(axis.value, 0))/maxValue)*cfg.factor);
          });
        });
        var polygon = container.selectAll(".area").data(data, cfg.axisJoin);

        polygon.enter().append('polygon')
        .classed({area: 1, 'd3-enter': 1})
        .on('mouseover', function (dd){
          d3.event.stopPropagation();
          container.classed('focus', 1);
          d3.select(this).classed('focused', 1);
          setTooltip(dd.className);
        })
        .on('mouseout', function(){
          d3.event.stopPropagation();
          container.classed('focus', 0);
          d3.select(this).classed('focused', 0);
          setTooltip(false);
        });

        polygon.exit()
          .classed('d3-exit', 1) // trigger css transition
          .transition().duration(cfg.transitionDuration)
          .remove();

          polygon
          .each(function(d, i) {
            var classed = {'d3-exit': 0}; // if exiting element is being reused
            classed['radar-chart-serie' + i] = 1;
            if(d.className) {
              classed[d.className] = 1;
            }
            d3.select(this).classed(classed);
          })
          // styles should only be transitioned with css
          .style('stroke', function(d, i) { return cfg.color(i); })
          .style('fill', function(d, i) { return cfg.color(i); })
          .transition().duration(cfg.transitionDuration)
            // svg attrs with js
            .attr('points',function(d) {
              return d.axes.map(function(p) {

                return [p.x, p.y].join(',');
              }).join(' ');
            })
            .each('start', function() {
              d3.select(this).classed('d3-enter', 0); // trigger css transition
            });

            if(cfg.circles && cfg.radius) {

              var circleGroups = container.selectAll('g.circle-group').data(data, cfg.axisJoin);

              circleGroups.enter().append('g').classed({'circle-group': 1, 'd3-enter': 1});
              circleGroups.exit()
            .classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();

            circleGroups
            .each(function(d) {
              var classed = {'d3-exit': 0}; // if exiting element is being reused
              if(d.className) {
                classed[d.className] = 1;
              }
              d3.select(this).classed(classed);
            })
            .transition().duration(cfg.transitionDuration)
            .each('start', function() {
                d3.select(this).classed('d3-enter', 0); // trigger css transition
              });

            var circle = circleGroups.selectAll('.circle').data(function(datum, i) {
              return datum.axes.map(function(d) { return [d, i]; });
            });

            // Define drag beavior
            var drag = d3.behavior.drag()
            .on("drag", dragmove);

            //dragmove functie
            function dragmove(d) {
              var x = d3.event.x;
              var y = d3.event.y;
              var cy = d3.select(this).attr('cy');
              var cx = d3.select(this).attr('cx'); 
              var x1 = d3.select(this).attr('x1');
              var x2 = d3.select(this).attr('x2');
              var y1 = d3.select(this).attr('y1');
              var y2 = d3.select(this).attr('y2');
              var dx = x1 -x2;
              var dy =  y2-y1;
              var slope = dx/dy;
              var expected = ((parseFloat(cy) - parseFloat(y)) * slope) + parseFloat(cx);


              var minx = Math.min(x1, x2);
              var maxx = Math.max(x1, x2);

              var miny = Math.min(y1, y2);

              var maxy = Math.max(y1, y2);

              if(expected < minx){
                expected = minx;
              }
              if(expected > maxx){
                expected = maxx;

              }
              if(y <miny){
                y = miny;
              }
              if(y>maxy){
                y=maxy;
              }

              var scale = d3.scale.linear().domain([y1, y2]).range([0, 10]);
              d3.select(this).attr("cy", y).attr("cx", expected);
              var circleindex = parseInt(d3.select(this).attr("id"));
              data[0].axes[circleindex].x = expected;
              data[0].axes[circleindex].y = y;
              data[0].axes[circleindex].value = scale(y);
              // console.log(currentStudent);
              // console.log(data[0].axes[circleindex]);

              refresh(data[0].axes[circleindex].axis, scale(y));
              
            }


            circle.enter().append('circle')
            .classed({circle: 1, 'd3-enter': 1})
            .on('mouseover', function(dd){

              d3.event.stopPropagation();
              setTooltip(dd[0].value);
              //container.classed('focus', 1);
              //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 1);
            })
            .on('mouseout', function(dd){
              d3.event.stopPropagation();
              setTooltip(false);
              container.classed('focus', 0);
              //container.select('.area.radar-chart-serie'+dd[1]).classed('focused', 0);
              //No idea why previous line breaks tooltip hovering area after hoverin point.
            }).attr("id", function(d,i){return i;})
            .call(drag);


            circle.exit()
            .classed('d3-exit', 1) // trigger css transition
            .transition().duration(cfg.transitionDuration).remove();

            circle
            .each(function(d) {
              var classed = {'d3-exit': 0}; // if exit element reused
              classed['radar-chart-serie'+d[1]] = 1;
              d3.select(this).classed(classed);
            })
            // styles should only be transitioned with css
            .style('fill', function(d) { return cfg.color(d[1]); })
            .transition().duration(cfg.transitionDuration)
              // svg attrs with js
              .attr('r', cfg.radius)
              .attr('cx', function(d) {
                return d[0].x;
              })
              .attr('cy', function(d) {
                return d[0].y;
              })
              .each('start', function() {
                d3.select(this).classed('d3-enter', 0); // trigger css transition
              });

              d3.selectAll('.circle').each(function(d, i){
                var nameaxis = "#axis"+i;
                var axis = d3.select(nameaxis).select('line');
                var x1 = axis.attr('x1');
                var x2 = axis.attr('x2');
                var y1 = axis.attr('y1');
                var y2 = axis.attr('y2');
                d3.select(this).attr('x1', x1).attr('x2', x2).attr('y1', y1).attr('y2', y2);
                

              })


              var tooltipEl = tooltip.node();
              tooltipEl.parentNode.appendChild(tooltipEl);
            }
          });
}

radar.config = function(value) {
  if(!arguments.length) {
    return cfg;
  }
  if(arguments.length > 1) {
    cfg[arguments[0]] = arguments[1];
  }
  else {
    d3.entries(value || {}).forEach(function(option) {
      cfg[option.key] = option.value;
    });
  }
  return radar;
};

return radar;
},
draw: function(id, d, options) {
  var chart = RadarChart.chart().config(options);
  var cfg = chart.config();

  d3.select(id).select('svg').remove();
  d3.select(id)
  .append("svg")
  .attr("width", cfg.w)
  .attr("height", cfg.h)
  .datum(d)
  .call(chart);
}
};