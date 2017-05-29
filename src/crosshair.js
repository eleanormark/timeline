export default (selection, rect, tooltip, tooltipData) => {
  const crosshair = selection.selectAll('g.crosshair').data(rect ? [rect] : []);

  crosshair.exit().remove();

  crosshair.enter()
    .append('g')
    .classed('crosshair', true)
    .append('line');

  const line = crosshair.select('line')
    .attr('x1', rect => rect.x)
    .attr('x2', rect => rect.x)
    .attr('y1', rect => rect.y)
    .attr('y2', rect => rect.y + rect.height).node();

  // TODO: refactor
  if (line) {
    tooltip.show(line, tooltipData);
  }
  else if (tooltip) {
    tooltip.hide();
  }

};
