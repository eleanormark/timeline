export default (selection, events, options, scale) => {
    const update = selection.selectAll('rect.event').data(events);

    const y = event => event.row * (options.rowHeight + options.rowSpacing) +
      options.rowSpacing + options.margin.top + 1;

    const enter = update.enter().append('rect')
      .classed('event', true)
      .attr('x', event => scale(event.start))
      .attr('y', y)
      .attr('width', event => scale(event.end) - scale(event.start))
      .attr('height', event => options.rowHeight);

    enter.merge(update)
      .classed('selected', event => !!event.selected);
};
