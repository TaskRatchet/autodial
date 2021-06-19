// TODO: Verify these types are correct
type Roadall = [string | null, number | null, number | null][]
type Datapoint = [string, number, string]
type UnixDatapoint = [number, number]

// https://help.beeminder.com/article/97-custom-goals#aggday
type Aggday =
  "last"
  | "first"
  | "min"
  | "max"
  | "truemean"
  | "mean"
  | "uniqmean"
  | "median"
  | "mode"
  | "trimmean"
  | "sum"
  | "binary"
  | "nonzero"
  | "triangle"
  | "square"
  | "clocky"
  | "count"
  | "skatesum"
  | "cap1"

type Goal = {
  aggday: Aggday,
  kyoom: boolean,
  runits: "h" | "d" | "w" | "m" | "y",
  roadall: Roadall,
  datapoints: Datapoint[]
}

type User = {
  "beeminder_token": string,
  "beeminder_user": string
}
