/*
 * Copyright 2017 Buzzalt, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {select, selectAll} from 'd3-selection';
import {randomUniform} from 'd3-random';
import {csvParse} from 'd3-dsv';
import moment from 'moment';
import 'd3-transition';

import './styles/common.css';
import './styles/timeline.css';

import * as app from '../src';

const alertEl = select('.alert');

const generate = (number, rangeStart, rangeEnd) => {
  const events = [];
  for (let i = 0; i < number; i++) {
    const start = Math.floor(randomUniform(rangeStart, rangeEnd)());
    const end = Math.floor(randomUniform(start, rangeEnd)());
    events[i] = {
      start,
      end
    };
  }
  return events;
};

const dateFormat = 'MM/DD/YYYY HH:mm:ss';

const startEl = document.getElementById('start');
const endEl = document.getElementById('end');
// last hour
const end = Date.now();
const start = end - 1000 * 60 * 60;
startEl.value = moment(start).format(dateFormat);
endEl.value = moment(end).format(dateFormat);
let events = generate(50, start, end);

const fakeDataEl = document.getElementById('fakeData');
const rowHeightEl = document.getElementById('rowHeight');
const rowSpacingEl = document.getElementById('rowSpacing');

const bootstrap = (app) => {
  return ({
    start = startEl.value,
    end = endEl.value,
    rowHeight = rowHeightEl.value,
    rowSpacing = rowSpacingEl.value
  } = {}) => {
    try {
      start = moment(start, dateFormat).toDate();
      end = moment(end, dateFormat).toDate();

      const chart = app.timeline()
        .mapper(events => events.map(({start, end}) => {
          start = +start;
          end = +end;
          return {start, end};
        }))
        .events(events)
        .rowSpacing(Number(rowSpacing))
        .rowHeight(Number(rowHeight))
        .range(start, end);

      select('#root').call(chart);
    }
    catch (err) {
      console.error(err.message);
      alertEl.html(err.message).transition().duration(200).style('opacity', 1);
    }
  }
};

let update = bootstrap(app);
update();

window.addEventListener('resize', () => {
  update();
});

if (module.hot) {
  module.hot.accept('../src', () => {
    const next = require('../src');
    update = bootstrap(next);
    update();
  });
}

const fileEl = document.getElementById('file');

fileEl.addEventListener('change', () => {
  alertEl.transition().duration(300).style('opacity', 0);
  try {
    const file = fileEl.files[0];
    const textType = /text.*/;

    if (file.type.match(textType)) {
      const reader = new FileReader();

      reader.addEventListener('load', () => {
        events = csvParse(reader.result);
        fakeDataEl.checked = false;
        update();
      });

      reader.readAsText(file);
    }
    else {
      throw new Error("File type is not supported!");
    }
  }
  catch (err) {
    console.error(err.message);
    alertEl.html(err.message).transition().duration(200).style('opacity', 1);
  }
});

selectAll('#start, #end, #rowHeight, #rowSpacing')
  .on('keydown', () => {
    const isVisible = alertEl.style('opacity') === '1';
    if (isVisible) {
      alertEl.transition().duration(300).style('opacity', 0);
    }
  })
  .on('change', function() {
    update({
      [this.id]: event.target.value
    });
  });

select('#fakeData')
  .on('change', function() {
    const isFakeData = event.target.checked;
    if (isFakeData) {
      const start = moment(startEl.value, dateFormat).toDate();
      const end = moment(endEl.value, dateFormat).toDate();
      events = generate(50, start, end);
    }
    else {
      events = [];
    }
    update();
  });
