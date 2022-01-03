type RoadTime = number;
type RoadGoal = number;
type RoadRate = number;
type SparseSegment = [RoadTime | null, RoadGoal | null, RoadRate | null]
type DenseSegment = [RoadTime, RoadGoal, RoadRate]
type Roadall = SparseSegment[]
type Fullroad = DenseSegment[]
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
  // eslint-disable-next-line camelcase
  weekends_off: boolean
}

type GoalVerbose = {
  datapoints: Datapoint[]
} & Goal

type User = {
  "beeminder_token": string,
  "beeminder_user": string
}
