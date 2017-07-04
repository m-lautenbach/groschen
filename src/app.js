import xs from 'xstream';
import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { html } from 'snabbdom-jsx'

function main(sources) {
  const files$ = sources.DOM
    .select('.csv-input')
    .events('change')
    .map(evt => evt.target.files)
    .startWith([])

  const vdom$ = files$
    .map(files => {
      const file = files[0]
      const stream = xs.create()
      if (file) {
        var reader = new FileReader();

        reader.onload = evt => stream.shamefullySendNext(evt.target.result)

        reader.readAsText(file, 'iso-8859-1')
      }
      return stream
        .map(fileContent => <div>{fileContent}</div>)
        .startWith(null)
        .map(fileElement => <div>
          <input type="file" className="csv-input" />
          {fileElement || ''}
        </div>)
    })
    .flatten()

  return {
    DOM: vdom$
  };
}

run(main, {
  DOM: makeDOMDriver('#app')
});
