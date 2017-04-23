import * as app from './src';

const render = (message) => {
  document.body.innerHTML = message;
};

render(app.greeting('Maxim'));

if (module.hot) {

  module.hot.accept('./src', () => {
    const next = require('./src');
    render(next.greeting('Maxim'));
  });

}
