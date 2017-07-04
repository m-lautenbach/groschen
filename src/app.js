import xs from 'xstream'
import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
import Papa from 'papaparse'
import hash from 'object-hash'
import { get } from 'lodash/fp'

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
        .map(fileContent =>
          <ul>
            {
              Papa.parse(fileContent, { header: true })
                .data
                .filter(get('Betrag'))
                .map(
                  transaction =>
                    <li>{hash.sha1(transaction)} {transaction.Verwendungszweck} {transaction.Betrag} {JSON.stringify(transaction)}</li>
                )
            }
          </ul>)
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
