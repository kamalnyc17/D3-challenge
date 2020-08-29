// Set up SVG definitions and chart parameters
const svgWidth = 960;
const svgHeight = 620;
const margin = {
  top: 20,
  right: 40,
  bottom: 100,
  left: 100
};
const width = svgWidth - margin.right - margin.left;
const height = svgHeight - margin.top - margin.bottom;

// updating DOM to plot the chart
const chart = d3.select('#scatter')
  .append('div')
  .classed('chart', true);
const svg = chart.append('svg')
  .attr('width', svgWidth)
  .attr('height', svgHeight);
const chartGroup = svg.append('g')
  .attr('transform', `translate(${margin.left}, ${margin.top})`);
// initialization of axis
let chosenXAxis = 'poverty';
let chosenYAxis = 'healthcare';

//updating the x-scale variable upon click of label
const xScale = (healthData, chosenXAxis) => d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
      d3.max(healthData, d => d[chosenXAxis]) * 1.2
    ]).range([0, width]);

//updating y-scale variable upon click of label
const yScale = (healthData, chosenYAxis) => d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
      d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ]).range([height, 0]);
    
//updating the xAxis upon click
renderXAxis = (newXScale, xAxis) => {
  let bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

//updating yAxis variable upon click
renderYAxis = (newYScale, yAxis) => {
  let leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

//updating the circles with a transition to new circles 
const renderCircles = (circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) => {
  
  circlesGroup.transition()
    .duration(1000)
    .attr('cx', data => newXScale(data[chosenXAxis]))
    .attr('cy', data => newYScale(data[chosenYAxis]))
  return circlesGroup
}

//updating STATE labels
const renderText = (textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) => {

  textGroup.transition()
    .duration(1000)
    .attr('x', d => newXScale(d[chosenXAxis]))
    .attr('y', d => newYScale(d[chosenYAxis]));

  return textGroup
}
//stylize x-axis values for tooltips
const styleX = (value, chosenXAxis) => `${value}%`

//funtion for updating circles group
const updateToolTip = (chosenXAxis, chosenYAxis, circlesGroup) => {
  // setting up Axis labels
  let xLabel = (chosenXAxis === 'poverty') ? 'Poverty:' : (chosenXAxis === 'income') ? 'Median Income:' : 'Age:'
  let yLabel = (chosenYAxis === 'healthcare') ? 'No Healthcare:' : (chosenYAxis === 'obesity') ? 'Obesity:' : 'Smokers:'
  
  //create tooltip
  let toolTip = d3.tip()
    .attr('class', 'tooltip')
    .offset([-8, 0])
    .html((d) => (`${d.state}<br>${xLabel} ${styleX(d[chosenXAxis], chosenXAxis)}<br>${yLabel} ${d[chosenYAxis]}%`));

  circlesGroup.call(toolTip);

  //add
  circlesGroup.on('mouseover', toolTip.show)
    .on('mouseout', toolTip.hide);

  return circlesGroup;
}
//retrieve data
d3.csv('./assets/data/data.csv').then(function (healthData) {

  //Parse data to convert text to number
  healthData.map((data) => {
    data.obesity = +data.obesity;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.age = +data.age;
    data.healthcare = +data.healthcare;
    data.poverty = +data.poverty;
  });

  //create linear scales
  let xLinearScale = xScale(healthData, chosenXAxis);
  let yLinearScale = yScale(healthData, chosenYAxis);

  //create x axis
  let bottomAxis = d3.axisBottom(xLinearScale);
  let leftAxis = d3.axisLeft(yLinearScale);

  //append X
  let xAxis = chartGroup.append('g')
    .classed('x-axis', true)
    .attr('transform', `translate(0, ${height})`)
    .call(bottomAxis);

  //append Y
  let yAxis = chartGroup.append('g')
    .classed('y-axis', true)
    //.attr
    .call(leftAxis);

  //append Circles
  let circlesGroup = chartGroup.selectAll('circle')
    .data(healthData)
    .enter()
    .append('circle')
    .classed('circleStyle', true)
    .attr('cx', d => xLinearScale(d[chosenXAxis]))
    .attr('cy', d => yLinearScale(d[chosenYAxis]))
    .attr('r', 14)
    .attr('opacity', '.5');

  //append Initial Text
  let textGroup = chartGroup.selectAll('.stateText')
    .data(healthData)
    .enter()
    .append('text')
    .classed('stateText', true)
    .attr('x', d => xLinearScale(d[chosenXAxis]))
    .attr('y', d => yLinearScale(d[chosenYAxis]))
    .attr('dy', 3)
    .attr('font-size', '10px')
    .text((d) => d.abbr);

  //create a group for the x axis labels
  let xLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${width / 2}, ${height + 10 + margin.top})`);

  const povertyLabelClass = xLabelsGroup.append('text')
    .classed('labelText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 20)
    .attr('value', 'poverty')
    .text('In Poverty (%)');

  const ageLabelClass = xLabelsGroup.append('text')
    .classed('labelText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 40)
    .attr('value', 'age')
    .text('Age (Median)');

  const incomeLabelClass = xLabelsGroup.append('text')
    .classed('labelText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 60)
    .attr('value', 'income')
    .text('Household Income (Median)')

  //create a group for Y labels
  let yLabelsGroup = chartGroup.append('g')
    .attr('transform', `translate(${0 - margin.left/4}, ${height/2})`);

  const healthcareLabelClass = yLabelsGroup.append('text')
    .classed('labelText', true)
    .classed('active', true)
    .attr('x', 0)
    .attr('y', 0 - 20)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'healthcare')
    .text('Without Healthcare (%)');

  const smokesLabelClass = yLabelsGroup.append('text')
    .classed('labelText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 40)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'smokes')
    .text('Smoker (%)');

  const obesityLabelClass = yLabelsGroup.append('text')
    .classed('labelText', true)
    .classed('inactive', true)
    .attr('x', 0)
    .attr('y', 0 - 60)
    .attr('dy', '1em')
    .attr('transform', 'rotate(-90)')
    .attr('value', 'obesity')
    .text('Obese (%)');

  //update the toolTip
  circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  //x axis event listener
  xLabelsGroup.selectAll('text')
    .on('click', function () {
      let value = d3.select(this).attr('value');

      if (value != chosenXAxis) {
        chosenXAxis = value
        xLinearScale = xScale(healthData, chosenXAxis)
        xAxis = renderXAxis(xLinearScale, xAxis)
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup)

        //change of classes changes text
        if (chosenXAxis === 'poverty') {
          povertyLabelClass.classed('active', true).classed('inactive', false);
          ageLabelClass.classed('active', false).classed('inactive', true);
          incomeLabelClass.classed('active', false).classed('inactive', true);
        } else if (chosenXAxis === 'age') {
          povertyLabelClass.classed('active', false).classed('inactive', true);
          ageLabelClass.classed('active', true).classed('inactive', false);
          incomeLabelClass.classed('active', false).classed('inactive', true);
        } else {
          povertyLabelClass.classed('active', false).classed('inactive', true);
          ageLabelClass.classed('active', false).classed('inactive', true);
          incomeLabelClass.classed('active', true).classed('inactive', false);
        }
      }
    });
  //y axis lables event listener
  yLabelsGroup.selectAll('text')
    .on('click', function () {
      let value = d3.select(this).attr('value');

      if (value != chosenYAxis) {
        chosenYAxis = value
        yLinearScale = yScale(healthData, chosenYAxis)
        yAxis = renderYAxis(yLinearScale, yAxis)
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis)
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        //Change of the classes changes text
        if (chosenYAxis === 'obesity') {
          obesityLabelClass.classed('active', true).classed('inactive', false);
          smokesLabelClass.classed('active', false).classed('inactive', true);
          healthcareLabelClass.classed('active', false).classed('inactive', true);
        } else if (chosenYAxis === 'smokes') {
          obesityLabelClass.classed('active', false).classed('inactive', true);
          smokesLabelClass.classed('active', true).classed('inactive', false);
          healthcareLabelClass.classed('active', false).classed('inactive', true);
        } else {
          obesityLabelClass.classed('active', false).classed('inactive', true);
          smokesLabelClass.classed('active', false).classed('inactive', true);
          healthcareLabelClass.classed('active', true).classed('inactive', false);
        }
      }
    });
});