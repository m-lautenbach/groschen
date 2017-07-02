import xs from 'xstream';
import {run} from '@cycle/run';
import {div, input, h2, makeDOMDriver} from '@cycle/dom';

function main(sources) {
  const changeWeight$ = sources.DOM.select('.weight')
    .events('input')
    .map(ev => ev.target.value);

  const changeHeight$ = sources.DOM.select('.height')
    .events('input')
    .map(ev => ev.target.value);

  const weight$ = changeWeight$.startWith(70);
  const height$ = changeHeight$.startWith(170);

  const bmi$ = xs.combine(weight$, height$)
    .map(([weight, height]) => {
      const heightMeters = height * 0.01;
      return Math.round(weight / (heightMeters * heightMeters));
    });

  const vdom$ = bmi$.map(bmi =>
    div([
      div([
        'Weight ___kg',
        input('.weight', {attrs: {type: 'range', min: 40, max: 140}})
      ]),
      div([
        'Height ___cm',
        input('.height', {attrs: {type: 'range', min: 140, max: 210}})
      ]),
      h2('BMI is ' + bmi)
    ])
  );

  return {
    DOM: vdom$
  };
}

run(main, {
  DOM: makeDOMDriver('#app')
});
