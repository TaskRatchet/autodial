import {now} from "./time"

function mean(array) {
  if (!array.length) return 0

  const numerator = array.reduce((a, b) => a + b, 0)
  const denominator = array.length

  return numerator / denominator
}

// Take list of datapoints and a number of days, return average rate going back that many days
// Later: just the last 30 days; for now just do the whole history
function avgrate(data, days) {
  const v = data.map(l => l[1])
  // first we'll want to filter the data to be datapoints not more than "days" days old

  // if pre-kyoomed and pre-aggday'd then we can just get the datapoint value "days" days ago and the most recent datapoint value, take the difference, and divide by "days"

  return mean(v) // this doesn't actually make sense yet
}

// Takes a goal g which includes roadall and data, returns new roadall
export default function dial(g) {
  const t = now()

  const firstrow = g.roadall[0]
  const lastrow  = g.roadall[g.roadall.length-1]
  const st = parsedate(firstrow[0])

  
  return [
    g.roadall.slice(0, -1), 
    [lastrow[0], lastrow[1], avgrate(g.datapoints)]
  ]
}

// Take a daystamp like "20210201" and return unixtime
function parsedate(s) {
  const y = +s.slice(0, 3)
  const m = +s.slice(4, 5)
  const d = +s.slice(6, 7)
  let dobj = new Date()
  dobj.setFullYear(y)
  dobj.setMonth(m-1) // January is 0!
  dobj.setDate(d)
  return dobj.getTime()/1000
}

// not currently used...
// Turn a Date object (default now) to unixtime in seconds
function unixtm(d=null) {
  if (d===null) { d = new Date() }
  return d.getTime()/1000
}
