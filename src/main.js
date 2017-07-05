import xs from 'xstream'
import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
import Papa from 'papaparse'
import hash from 'object-hash'
import { get, mapKeys, mapValues } from 'lodash/fp'
import { invert, fromPairs } from 'lodash'

const idLabelPairs = [
  ['auftragskonto', 'Auftragskonto'],
  ['buchungstag', 'Buchungstag'],
  ['valutadatum', 'Valutadatum'],
  ['buchungstext', 'Buchungstext'],
  ['verwendungszweck', 'Verwendungszweck'],
  ['glaeubiger', 'Glaeubiger ID'],
  ['mandatsreferenz', 'Mandatsreferenz'],
  ['kundenreferenz', 'Kundenreferenz (End-to-End)'],
  ['sammlerreferenz', 'Sammlerreferenz'],
  ['lastschriftUrsprungsbetrag', 'Lastschrift Ursprungsbetrag'],
  ['auslagenersatzRuecklastschrift', 'Auslagenersatz Ruecklastschrift'],
  ['beguenstigter', 'Beguenstigter/Zahlungspflichtiger'],
  ['iban', 'Kontonummer/IBAN'],
  ['bic', 'BIC (SWIFT-Code)'],
  ['betrag', 'Betrag'],
  ['waehrung', 'Waehrung'],
  ['info', 'Info'],
]

const keyToLabel = fromPairs(idLabelPairs)
const labelToKey = invert(keyToLabel)

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
              // TODO: Map transaction keys to something reasonable and save in local storage
              Papa.parse(fileContent, { header: true })
                .data
                .filter(get('betrag'))
        		.map(mapKeys(label => labelToKey[label]))
                .map(
                  transaction =>
                    <li>{hash.sha1(transaction)} {JSON.stringify(transaction)}</li>
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

export default main
