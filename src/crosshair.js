export default (selection, rect) => {
  const crosshair = selection.selectAll('g.crosshair').data(rect ? [rect] : []);

  crosshair.exit().remove();

  crosshair.enter()
    .append('g')
    .classed('crosshair', true)
    .append('line');

  crosshair.select('line')
    .attr('x1', rect => rect.x)
    .attr('x2', rect => rect.x)
    .attr('y1', rect => rect.y)
    .attr('y2', rect => rect.y + rect.height);
};
