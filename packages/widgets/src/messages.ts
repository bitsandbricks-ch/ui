import { registerMessages } from '@bitsandbricks-ch/ui'

// The widgets' texts (from Floorbit's widgets and dashboard texts). Registered with the ui
// package, so an app's own translate function still wins for any key it knows.
export const en = {
  "widgets.kind.of": "of {{count}}",
  "widgets.kind.noData": "No data yet.",
  "widgets.kind.noRows": "Nothing here right now.",
  "widgets.kind.maxAvg": "max {{max}} · avg {{avg}}",
  "widgets.kind.graphLabel": "Graph: {{name}}",
  "widgets.kind.top": "top {{value}}",
  "widgets.kind.name": "Name",
  "widgets.kind.value": "Value",
  "widgets.kind.detail": "Detail",
  "widgets.kind.filter": "Filter",
  "widgets.kind.more": "+{{count}} more",
  "widgets.kind.rowsOf": "{{from}}–{{to}} of {{count}}",
  "widgets.kind.prev": "Previous page",
  "widgets.kind.next": "Next page",
  "widgets.kind.detailsNamed": "Details of {{name}}",
  "widgets.kind.other": "Other",
  "widgets.kind.gaugeLabel": "{{value}} of {{max}} ({{pct}} %)",
  "widgets.kind.pieLabel": "Pie: {{parts}}",
  "widgets.kind.columnsLabel": "Columns: {{name}}",
  "widgets.kind.histogramLabel": "Histogram: {{name}}, {{count}} values",
  "widgets.kind.binTip": "{{range}}: {{count}}",
  "widgets.kind.values_one": "{{count}} value",
  "widgets.kind.values_other": "{{count}} values",
  "widgets.kind.trend.linear": "Trend",
  "widgets.kind.trend.average": "Average",
  "widgets.kind.state": "State",
  "widgets.kind.changeHour": "vs an hour ago",
  "widgets.kind.changeSince": "since {{time}}",
  "widgets.kind.changeStart": "since the start",
  "widgets.state.up": "Up",
  "widgets.state.down": "Down",
  "widgets.state.warn": "Warning",
  "widgets.state.unknown": "Unknown",
  "widgets.calc.count": "Count",
  "widgets.calc.sum": "Sum",
  "widgets.calc.avg": "Average",
  "widgets.calc.min": "Min",
  "widgets.calc.max": "Max",
  "widgets.calc.first": "First",
  "widgets.calc.last": "Last",
  "dashboard.cantDraw": "This tile can't be drawn."
}

export const de = {
  "widgets.kind.of": "von {{count}}",
  "widgets.kind.noData": "Noch keine Daten.",
  "widgets.kind.noRows": "Gerade nichts da.",
  "widgets.kind.maxAvg": "max {{max}} · Ø {{avg}}",
  "widgets.kind.graphLabel": "Diagramm: {{name}}",
  "widgets.kind.top": "Spitze {{value}}",
  "widgets.kind.name": "Name",
  "widgets.kind.value": "Wert",
  "widgets.kind.detail": "Detail",
  "widgets.kind.filter": "Filtern",
  "widgets.kind.more": "+{{count}} weitere",
  "widgets.kind.rowsOf": "{{from}}–{{to}} von {{count}}",
  "widgets.kind.prev": "Vorherige Seite",
  "widgets.kind.next": "Nächste Seite",
  "widgets.kind.detailsNamed": "Details zu {{name}}",
  "widgets.kind.other": "Andere",
  "widgets.kind.gaugeLabel": "{{value}} von {{max}} ({{pct}} %)",
  "widgets.kind.pieLabel": "Kreis: {{parts}}",
  "widgets.kind.columnsLabel": "Säulen: {{name}}",
  "widgets.kind.histogramLabel": "Histogramm: {{name}}, {{count}} Werte",
  "widgets.kind.binTip": "{{range}}: {{count}}",
  "widgets.kind.values_one": "{{count}} Wert",
  "widgets.kind.values_other": "{{count}} Werte",
  "widgets.kind.trend.linear": "Trend",
  "widgets.kind.trend.average": "Durchschnitt",
  "widgets.kind.state": "Status",
  "widgets.kind.changeHour": "zu vor einer Stunde",
  "widgets.kind.changeSince": "seit {{time}}",
  "widgets.kind.changeStart": "seit Beginn",
  "widgets.state.up": "Läuft",
  "widgets.state.down": "Ausgefallen",
  "widgets.state.warn": "Warnung",
  "widgets.state.unknown": "Unbekannt",
  "widgets.calc.count": "Anzahl",
  "widgets.calc.sum": "Summe",
  "widgets.calc.avg": "Durchschnitt",
  "widgets.calc.min": "Min.",
  "widgets.calc.max": "Max.",
  "widgets.calc.first": "Erster",
  "widgets.calc.last": "Letzter",
  "dashboard.cantDraw": "Diese Kachel lässt sich nicht anzeigen."
}

let done = false
/** Registers the widgets' texts once. Called by the components that use them, not on import, so
 *  bundlers that drop side-effect imports keep them. */
export function registerWidgetMessages() {
  if (done) return
  done = true
  registerMessages('en', en)
  registerMessages('de', de)
}
