// TODO: Verify these types are correct
type Roadall = [string|null, number|null, number|null][]
type Datapoint = [string, number, string]
type UnixDatapoint = [number, number]
type Goal = {
  runits: "h" | "d" | "w" | "m" | "y",
  roadall: Roadall,
  datapoints: Datapoint[]
}
