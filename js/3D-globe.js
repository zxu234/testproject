  var width = 400,
      height = 400,
      scale = 200,
      origin = {
        x: 55,
        y: -40
      };
  var world;
// 选择body、div确定绘制地球位置和宽高
  var svg = d3.select('body').select('#map').append('svg')
    .attr('width', width)
    .attr('height', height);

  var group = svg.append("g").datum({
    x: 0,
    y: 0
  });
// 定义投影坐标系统
  var projection = d3.geoOrthographic()
    .scale(scale)
    .translate([width / 2, height / 2])
    .rotate([origin.x, origin.y])
    .center([0, 0])
    .clipAngle(90);
// 生成地理投影路径
  var geoPath = d3.geoPath()
    .projection(projection);
// 创建地球网格
  var graticule = d3.geoGraticule();

  // 地球缩放和拖拽
  svg.call(d3.zoom().on('zoom', zoomed));

  group.call(d3.drag().on('drag', dragged));

  // code snippet from http://stackoverflow.com/questions/36614251
  var lambda = d3.scaleLinear()
    .domain([-width, width])
    .range([-180, 180])

  var phi = d3.scaleLinear()
    .domain([-height, height])
    .range([90, -90]);
// 给地球添加网格并定义样式
  group.append('path')
    .datum(graticule)
    .attr('class', 'graticule')
    .attr('d', geoPath);

  function dragged(d) {
    var r = {
      x: lambda((d.x = d3.event.x)),
      y: phi((d.y = d3.event.y))
    };
    projection.rotate([origin.x + r.x, origin.y + r.y]);
    updatePaths(svg, graticule, world, geoPath);
  };

  function zoomed() {
    var transform = d3.event.transform;
    var k = Math.sqrt(100 / projection.scale());
    projection.scale(scale * transform.k)
    updatePaths(svg, graticule, world, geoPath);
  };

  function updatePaths(svg, graticule, world, geoPath) {
     svg.selectAll('path.graticule').datum(graticule).attr('d', geoPath);
     svg.selectAll('path.land').datum(world).attr('d', geoPath);
  };
// 加载全球json数据，绘制陆地
  d3.json("https://s3-us-west-2.amazonaws.com/s.cdpn.io/95802/world-110m.json", function(error, worldJSON) {
     if (error) throw error;
     world = topojson.feature(worldJSON, worldJSON.objects.land),
     borders = topojson.mesh(worldJSON, worldJSON.objects.countries, function(a, b) {
            return a !== b;
        }),
     group.append("path")
      .datum(world)
      .attr("class", "land")
      .attr("d", geoPath);
  });

  var i=0;

  function redraw(){
      let proj = projection.rotate([0.2 * i, 0, 0]),
          path = d3.geoPath().projection(projection)

      group.selectAll("path")
          .datum(world)
          .attr("class", "land")
          .attr("d", geoPath);

      group.select("path")
          .datum(graticule)
          .attr("class", "graticule")
          .attr("d", geoPath);

      i ++

      window.requestAnimationFrame(redraw)
  }
