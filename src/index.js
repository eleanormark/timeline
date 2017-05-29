import {assign} from 'lodash/object';
import {isNumber, cloneDeep} from 'lodash/lang';
import {scaleTime} from 'd3-scale';
import {axisTop, axisBottom} from 'd3-axis';
import {mouse} from 'd3-selection';
import {factory} from '@buzzalt/tooltip';

import crosshairRenderer from './crosshair';
import eventRenderer from './events';

const layout = (events) => {
  const rows = [];

  events = cloneDeep(events);

  const layout = {
    events: events
      .sort((a, b) => a.start - b.start)
      .map(event => {
        let index = rows.findIndex(row => event.start >= row);
        if (index === -1) {
          index = rows.length;
        }
        rows[index] = event.end;
        event.selected = false;
        event.row = index;
        return event;
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

  let svg, group, scale, tooltip;

  const render = () => {

    const {
      events,
      rowCount
    } = state.layout;

    let height = options.height;
    if (height === 'auto') {
      height = options.margin.top + options.margin.bottom +
        rowCount * (options.rowHeight + options.rowSpacing) + options.rowSpacing + 1;
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

    // TODO: refactor
    let crosshairRect = null;

    if (options.crosshair && state.cursor) {
      const x = state.cursor.x;
      crosshairRect = {
        x: x,
        y: options.margin.top,
        width: 0,
        height: clientRect.height - options.margin.top - options.margin.bottom
      };

      if (tooltip) {
        tooltip.hide();
      }
      tooltip = factory()
        .template(data => {
          const date = new Date(data.time);
          return `
            <span>${date.getMonth()}/${date.getDate()}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}</span>
            <br>
            <span>Events: ${data.selectedCount}</span>
          `;
        })
        .client('#root')
        .create('south-east')
        .anchor('top', 'right')
        .fallback('south-west')
        .anchor('top', 'left');
    }

    group
      .call(crosshairRenderer, crosshairRect, tooltip, {
        time: state.time,
        selectedCount: state.selectedCount
      })
      .call(eventRenderer, events, options, scale);
  };

  const instance = (selection) => {

    selection.select('svg').remove();

    svg = selection.append('svg')
      .on('mouseleave', () => {
        state.cursor = null;

        state.layout.events.forEach(event => {
          event.selected = false;
        });

        state.selectedCount = 0;
        state.time = null;

        render();
      })
      .on('mousemove', function() {
        const [mouseX, mouseY] = mouse(this);
        state.cursor = {
          x: mouseX,
          y: mouseY
        };
        const mouseTime = scale.invert(mouseX).getTime();

        state.selectedCount = selectEvents(state.layout.events, mouseTime);
        state.time = mouseTime;
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

  const selectEvents = (events, time) => {
    let selectedCount = 0;
    events.forEach(event => {
      event.selected = event.start <= time &&
        event.end >= time;
      selectedCount += event.selected;
    });
    return selectedCount;
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