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

import { select } from 'd3-selection';
import {randomUniform} from 'd3-random';
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

const bootstrap = (app) => {
  return () => {
    try {
      const end = Date.now();
      const start = end - 1000 * 60 * 60;
      // generate and render 50 events in the last hour
      const events = generate(50, start, end);

      const chart = app.timeline();

      select('#root').call(chart.events(events).range(start, end));
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
