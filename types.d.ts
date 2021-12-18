type Roadall = [number | null, number | null, number | null][]
type Fullroad = [number, number, number][]
type Datapoint = {
  daystamp: string,
  timestamp: number
  value: number
}
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
  rate: number;
  slug: string,
  aggday: Aggday,
  kyoom: boolean,
  runits: "h" | "d" | "w" | "m" | "y",
  roadall: Roadall,
  fullroad: Fullroad
  fineprint: string | null
}

type GoalVerbose = {
  datapoints: Datapoint[]
} & Goal

type User = {
  "beeminder_token": string,
  "beeminder_user": string
}
