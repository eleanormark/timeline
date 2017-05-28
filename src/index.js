import {assign} from 'lodash/object';
import {isNumber} from 'lodash/lang';
import {scaleTime} from 'd3-scale';
import {axisTop, axisBottom} from 'd3-axis';
import {mouse} from 'd3-selection';

import {crosshair} from './crosshair';

const layout = (events) => {
  const rows = [];

  const layout = {
    events: events.map(event => {
      let index = rows.findIndex(row => event.start >= row);
      if (index === -1) {
        index = rows.length;
      }
      rows[index] = event.end;
      return {
        ...event,
        selected: false,
        row: index
      };
    })
  };

  layout.rowCount = rows.length;

  return layout;
};

const defaults = {
  mapper: events => events,
  height: 'auto',
  rowHeight: 16,
  rowSpacing: 4,
  crosshair: true,
  margin: {
    top: 20,
    right: 0,
    bottom: 20,
    left: 0
  }
};

export const timeline = (options) => {

  options = assign({}, defaults, options);

  const state = {
    cursor: null
  };

  let svg, group, scale;

  const render = () => {

    const {
      events,
      rowCount
    } = state.layout;

    let height = options.height;
    if (height === 'auto') {
      height = options.margin.top + options.margin.bottom +
        rowCount * (options.rowHeight + options.rowSpacing) + options.rowSpacing;
    }
    svg.attr('height', height);

    // TODO: optimize
    const clientRect = svg.node().getBoundingClientRect();

    scale.domain([state.start, state.end])
      .range([0, clientRect.width]);

    svg.select('g.axis-top')
      .attr('transform', `translate(0, ${options.margin.top})`)
      .call(axisTop(scale).tickSize(-4));

    svg.select('g.axis-bottom')
      .attr('transform', `translate(0, ${height - options.margin.bottom})`)
      .call(axisBottom(scale).tickSize(-3));

    let rect = null;

    if (options.crosshair && state.cursor) {
      const x = state.cursor.x;
      rect = {
        x: x,
        y: options.margin.top,
        width: 0,
        height: clientRect.height - options.margin.top - options.margin.bottom
      };
    }

    group.call(crosshair, rect);

    const update = group.selectAll('rect.event').data(events);

    const enter = update.enter().append('rect')
      .classed('event', true)
      .attr('x', event => scale(event.start))
      .attr('y', event => event.row * (options.rowHeight + options.rowSpacing) + options.rowSpacing + options.margin.top + 1)
      .attr('width', event => scale(event.end) - scale(event.start))
      .attr('height', event => options.rowHeight);

    enter.merge(update)
      .classed('selected', event => !!event.selected);
  };

  const instance = (selection) => {

    svg = selection.append('svg')
      .on('mouseleave', () => {
        state.cursor = null;

        state.layout.events.forEach(event => {
          event.selected = false;
        });

        render();
      })
      .on('mousemove', function() {
        const [mouseX, mouseY] = mouse(this);
        state.cursor = {
          x: mouseX,
          y: mouseY
        };
        const mouseTime = scale.invert(mouseX).getTime();

        state.layout.events.forEach(event => {
          event.selected = event.start <= mouseTime &&
            event.end >= mouseTime;
        });

        render();
      });

    group = svg.append('g');
    scale = scaleTime();

    // render the time axes
    svg.append('g')
      .classed('axis', true)
      .classed('axis-top', true);

    svg.append('g')
      .classed('axis', true)
      .classed('axis-bottom', true);

    render();
  };

  return assign(instance, {

    events(events) {
      state.layout = layout(options.mapper(events));
      return instance;
    },

    range(...args) {
      if (args.length === 0) {
        return options.start;
      }
      const [start, end] = args;
      state.start = isNumber(start) ? new Date(start) : start;
      state.end = isNumber(end) ? new Date(end) : end;
      return instance;
    },

    mapper(...args) {
      if (args.length === 0) {
        return options.height;
      }
      [options.mapper] = args;
      return instance;
    },

    height(...args) {
      if (args.length === 0) {
        return options.height;
      }
      [options.height] = args;
      return instance;
    },

    rowHeight(...args) {
      if (args.length === 0) {
        return options.rowHeight;
      }
      [options.rowHeight] = args;
      return instance;
    },

    rowSpacing(...args) {
      if (args.length === 0) {
        return options.rowSpacing;
      }
      [options.rowSpacing] = args;
      return instance;
    },

    crosshair(...args) {
      if (args.length === 0) {
        return options.crosshair;
      }
      [options.crosshair] = args;
      return instance;
    },

    render() {
      render();
      return instance;
    }

  });

};