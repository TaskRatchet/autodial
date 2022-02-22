export type RoadTime = number;
export type RoadGoal = number;
export type RoadRate = number;
export type SparseSegment = [RoadTime | null, RoadGoal | null, RoadRate | null]
export type DenseSegment = [RoadTime, RoadGoal, RoadRate]
export type Roadall = SparseSegment[]
export type Fullroad = DenseSegment[]
export type Datapoint = {
  daystamp: string,
  timestamp: number
  value: number
}
export type UnixDatapoint = [number, number];

// https://help.beeminder.com/article/97-custom-goals#aggday
export type Aggday =
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

export type Goal = {
  rate: number | null;
  slug: string,
  title: string,
  aggday: Aggday,
  kyoom: boolean,
  yaw: 1|-1,
  runits: "h" | "d" | "w" | "m" | "y",
  roadall: Roadall,
  fullroad: Fullroad
  fineprint: string | null
  // eslint-disable-next-line camelcase
  weekends_off: boolean
  mathishard: DenseSegment
}

export type GoalVerbose = {
  datapoints: Datapoint[]
} & Goal

export type User = {
  "beeminder_token": string,
  "beeminder_user": string
}


