import xs from 'xstream'
import { run } from '@cycle/run'
import { makeDOMDriver } from '@cycle/dom'
import { html } from 'snabbdom-jsx'
import Papa from 'papaparse'
import hash from 'object-hash'
import { get, mapKeys, mapValues, keyBy, map, set, tap } from 'lodash/fp'
import { invert, fromPairs, first, bind, flow } from 'lodash'
import _ from 'lodash'

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

const functionFromMap = map => key => map[key]

const keyToLabel = functionFromMap(fromPairs(idLabelPairs))
const labelToKey = functionFromMap(invert(fromPairs(idLabelPairs)))


function main(sources) {
  const file$ = sources.DOM
    .select('.csv-input')
    .events('change')
    .map(evt => evt.target.files)
    .map(first)

  const transactions$ = file$
    .map(file => {
      const file$ = xs.create()
      var reader = new FileReader()
      reader.onload = evt => file$.shamefullySendNext(evt.target.result)
      reader.readAsText(file, 'iso-8859-1')
      return file$
    })
    .flatten()
    .map(flow(
      bind(Papa.parse, Papa, _, { header: true }),
      get('data'),
      map(flow(
        mapKeys(labelToKey),
        transaction => set('id', hash.sha1(transaction), transaction)
      ))
    ))

  // TODO: save transactions to local storage

  const vdom$ = transactions$
    .startWith([])
    .map(
      transactions =>
        <div>
          <input type="file" className="csv-input" />
          <ul>
            {transactions.map(transaction => <li>{JSON.stringify(transaction)}</li>)}
          </ul>
        </div>
    )

  return {
    DOM: vdom$
  }
}

export default main
