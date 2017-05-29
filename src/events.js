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
