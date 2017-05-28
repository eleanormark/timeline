# timeline

```javascript
import {timeline} from '@buzzalt/timeline';

const events = [{
  start: '',
  end: ''
}, {
  start: '',
  end: ''
}]; 

d3.select('#root')
  .call(timeline().events(events));
```