import { dial } from "./dial.ts";
import { makeGoal } from "../../functions/src/test/helpers.ts";
import { parseDate } from "./time.ts";
import { setNow } from "./test/helpers.tsx";
import { Roadall } from "./types.ts";
import {
  assertEquals,
  assertThrows,
  assertFalse,
  assertNotEquals,
  assertAlmostEquals,
  assertInstanceOf,
} from "https://deno.land/std@0.165.0/testing/asserts.ts";

function getRoadEnd(roadall: Roadall | false) {
  if (!roadall) {
    throw new Error("Rate not adjusted");
  }

  return roadall[roadall.length - 1];
}

const expectEndRate = (roadall: Roadall | false, expected: number) => {
  const end = getRoadEnd(roadall);

  assertEquals(end[2], expected);
};

const expectFuzzyEndRate = (roadall: Roadall | false, expected: number) => {
  if (!roadall) {
    throw new Error("Rate not adjusted");
  }

  const end = roadall[roadall.length - 1];

  if (end[2] === null) {
    throw new Error("Rate is null");
  }

  assertAlmostEquals(end[2], expected);
};

Deno.test("dials goal with no datapoints", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 1],
      ],
      datapoints: [],
    })
  );

  expectEndRate(r, 0);

  t.restore();
});

Deno.test("dials goal with less than 30d history", () => {
  const t = setNow(2021, 2, 1);

  try {
    const r = dial(
      makeGoal({
        aggday: "last",
        kyoom: false,
        runits: "d",
        roadall: [
          [parseDate("20210125"), 0, null],
          [parseDate("20210301"), null, 1],
        ],
        datapoints: [{ daystamp: "20210125", value: 1 }],
      })
    );

    expectFuzzyEndRate(r, 1 - 7 / 30);
  } finally {
    t.restore();
  }
});

Deno.test("dials goal with datapoint after a month", () => {
  const t = setNow(2021, 2, 24);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210124"), 0, null],
        [parseDate("20210324"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210124", value: 0 },
        {
          daystamp: "20210125",
          value: 1,
        },
      ],
    })
  );

  expectFuzzyEndRate(r, 1 / 30);

  t.restore();
});

Deno.test("dials goal with datapoint after a week with runits=weekly", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "w",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 2],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210126", value: 30 / 7 },
      ],
    })
  );

  expectFuzzyEndRate(r, 1);

  t.restore();
});

Deno.test("dials goal with min option", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      slug: "my_special_slug",
      aggday: "last",
      kyoom: false,
      runits: "w",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 1],
      ],
      datapoints: [{ daystamp: "20210126", value: 1 }],
    }),
    { min: 2 }
  );

  expectEndRate(r, 2);

  t.restore();
});

Deno.test("supports aggday last", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 2 },
      ],
    })
  );

  expectFuzzyEndRate(r, 2 / 30);

  t.restore();
});

Deno.test("supports aggday first", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "first",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 2 },
      ],
    })
  );

  expectFuzzyEndRate(r, 1 / 30);

  t.restore();
});

Deno.test("supports aggday sum", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "sum",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 2 },
      ],
    })
  );

  expectFuzzyEndRate(r, 3 / 30);

  t.restore();
});

Deno.test("supports aggday min", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "min",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 2 },
      ],
    })
  );

  expectFuzzyEndRate(r, 1 / 30);

  t.restore();
});

Deno.test("supports aggday max", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "max",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 2 },
        { daystamp: "20210201", value: 1 },
      ],
    })
  );

  expectFuzzyEndRate(r, 2 / 30);

  t.restore();
});

Deno.test("supports aggday count", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "count",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 5 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  // because data is not cumulative, initial day aggregates to 1,
  // and additional day aggregates to 2, so difference is 1
  expectFuzzyEndRate(r, 1 / 30);

  t.restore();
});

Deno.test("supports cumulative goals", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "count",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 5 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 2 / 30);

  t.restore();
});

Deno.test("supports aggday binary", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "binary",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 5 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 1 / 30);

  t.restore();
});

Deno.test("supports aggday nonzero", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "nonzero",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 0 },
        { daystamp: "20210202", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 1 / 30);

  t.restore();
});

Deno.test("supports aggday truemean", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "truemean",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 5 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 5 / 30);

  t.restore();
});

Deno.test("supports aggday mean", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "mean",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 5 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 5 / 30);

  t.restore();
});

Deno.test("supports aggday uniquemean", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "uniqmean",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 5 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 5 / 30);

  t.restore();
});

Deno.test("supports aggday median", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "median",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 4 },
        { daystamp: "20210201", value: 5 },
      ],
    })
  );

  expectFuzzyEndRate(r, 4 / 30);
  t.restore();
});

Deno.test("supports aggday cap1", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "cap1",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 1 },
      ],
    })
  );

  expectFuzzyEndRate(r, 1 / 30);
  t.restore();
});

Deno.test("supports aggday square", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "square",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 2 },
      ],
    })
  );

  expectFuzzyEndRate(r, 9 / 30);
  t.restore();
});

Deno.test("supports aggday triangle", () => {
  const t = setNow(2021, 2, 29);

  const r = dial(
    makeGoal({
      aggday: "triangle",
      kyoom: true,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210401"), null, 1],
      ],
      datapoints: [
        { daystamp: "20210125", value: 0 },
        { daystamp: "20210201", value: 1 },
        { daystamp: "20210201", value: 1 },
      ],
    })
  );

  expectFuzzyEndRate(r, 3 / 30);
  t.restore();
});

Deno.test("protects akrasia horizon", () => {
  const t = setNow(2021, 3, 1);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 1],
      ],
      datapoints: [],
    })
  );

  assertEquals(r && r[1], [parseDate("20210309"), null, 1]);
  t.restore();
});

Deno.test("does not add row if last segment starts after horizon", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210305"), null, 1],
        [parseDate("20210325"), null, 1],
      ],
      datapoints: [],
    })
  );

  assertEquals(r && r.length, 3);
  t.restore();
});

Deno.test("uses fullroad to decide if akrasia boundary needed", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [null, 40, 1],
        [parseDate("20210325"), null, 1],
      ],
      datapoints: [],
    })
  );

  assertEquals(r && r.length, 3);
  t.restore();
});

Deno.test("does not dial goal if new rate ~= old rate", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 0.000000000000000000001],
      ],
      datapoints: [],
    })
  );

  assertFalse(r);
  t.restore();
});

Deno.test("takes weekends off into account", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      rate: 5,
      weekends_off: true,
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 5],
      ],
      datapoints: [
        {
          daystamp: "20210125",
          value: 0,
        },
        {
          daystamp: "20210220",
          value: (30 * 5) / 7,
        },
      ],
    })
  );

  expectFuzzyEndRate(r, 1);
  t.restore();
});

Deno.test("adjusts rate slowly for new do-less goal", () => {
  const t = setNow(2021, 2, 1);

  const r = dial(
    makeGoal({
      rate: 5,
      weekends_off: true,
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 5],
      ],
      datapoints: [],
    })
  );

  expectFuzzyEndRate(r, 5 - (7 / 30) * 5);
  t.restore();
});

Deno.test("does not use future datapoints when calculating rate", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [parseDate("20210325"), null, 0.000000000000000000001],
      ],
      datapoints: [
        {
          daystamp: "20210226",
          value: 100000,
        },
      ],
    })
  );

  assertFalse(r);
  t.restore();
});

Deno.test("does not dial goal without end rate", () => {
  const t = setNow(2021, 2, 25);

  const fn = () =>
    dial(
      makeGoal({
        aggday: "last",
        kyoom: false,
        runits: "d",
        roadall: [
          [parseDate("20210125"), 0, null],
          [parseDate("20220125"), 10, null],
        ],
        datapoints: [],
      })
    );

  assertThrows(fn);
  t.restore();
});

Deno.test("does not make strict goal easier", () => {
  const t = setNow(2021, 2, 24);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      rate: 5,
      runits: "d",
      roadall: [
        [parseDate("20210124"), 0, null],
        [parseDate("20210324"), null, 5],
      ],
      datapoints: [
        { daystamp: "20210124", value: 0 },
        {
          daystamp: "20210125",
          value: 1,
        },
      ],
    }),
    { strict: true }
  );

  assertFalse(r);
  t.restore();
});

Deno.test("does not make strict do-less goal easier", () => {
  const t = setNow(2021, 2, 24);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      yaw: -1,
      rate: 0,
      runits: "d",
      roadall: [
        [parseDate("20210124"), 0, null],
        [parseDate("20210324"), null, 0],
      ],
      datapoints: [
        { daystamp: "20210124", value: 0 },
        {
          daystamp: "20210125",
          value: 1,
        },
      ],
    }),
    { strict: true }
  );

  assertFalse(r);
  t.restore();
});

Deno.test("preserves end value", () => {
  const t = setNow(2021, 2, 25);

  const r = dial(
    makeGoal({
      aggday: "last",
      kyoom: false,
      runits: "d",
      roadall: [
        [parseDate("20210125"), 0, null],
        [null, 300, 1],
      ],
      datapoints: [],
    })
  );

  const end = getRoadEnd(r);

  assertEquals(end, [null, 300, 0]);
  t.restore();
});

Deno.test("does not dial odometer goals", () => {
  const t = setNow(2021, 2, 25);

  const fn = () =>
    dial(
      makeGoal({
        odom: true,
        roadall: [
          [parseDate("20210125"), 0, null],
          [null, 300, 1],
        ],
      })
    );

  assertThrows(fn);
  t.restore();
});

Deno.test("uses average of `from` goal", () => {
  const t = setNow(2021, 2, 24);

  const g1 = makeGoal({
    slug: "to",
    roadall: [
      [parseDate("20210124"), 0, null],
      [parseDate("20210325"), null, 1],
    ],
    datapoints: [{ daystamp: "20210124", value: 0 }],
  });
  const g2 = makeGoal({
    slug: "from",
    roadall: [
      [parseDate("20210124"), 0, null],
      [parseDate("20210325"), null, 1],
    ],
    datapoints: [
      { daystamp: "20210124", value: 0 },
      {
        daystamp: "20210224",
        value: 1,
      },
    ],
  });

  const r = dial(g1, { fromGoal: g2 });

  expectFuzzyEndRate(r, 1 / 30);
  t.restore();
});

Deno.test("uses `times` option", () => {
  const t = setNow(2021, 2, 24);

  const g = makeGoal({
    aggday: "last",
    kyoom: false,
    runits: "d",
    roadall: [
      [parseDate("20210124"), 0, null],
      [parseDate("20210324"), null, 1],
    ],
    datapoints: [
      { daystamp: "20210124", value: 0 },
      {
        daystamp: "20210125",
        value: 1,
      },
    ],
  });

  const r = dial(g, { times: 2 });

  expectFuzzyEndRate(r, 2 / 30);
  t.restore();
});

Deno.test("uses min of two goals ages when using from option", () => {
  const t = setNow(2021, 2, 24);

  const g1 = makeGoal({
    slug: "to",
    roadall: [
      [parseDate("20210124"), 0, null],
      [parseDate("20210325"), null, 0],
    ],
    datapoints: [{ daystamp: "20210124", value: 0 }],
  });
  const g2 = makeGoal({
    slug: "from",
    roadall: [
      [parseDate("20210223"), 0, null],
      [parseDate("20210325"), null, 0],
    ],
    datapoints: [
      { daystamp: "20210223", value: 0 },
      {
        daystamp: "20210224",
        value: 1,
      },
    ],
  });

  const r = dial(g1, { fromGoal: g2 });

  expectFuzzyEndRate(r, 0.001111111111);
  t.restore();
});

Deno.test("does not add row with date after end row", () => {
  const t = setNow(2021, 2, 24);

  const g = makeGoal({
    aggday: "last",
    kyoom: false,
    runits: "d",
    roadall: [
      [parseDate("20210124"), 0, null],
      [parseDate("20210224"), null, 1],
    ],
    datapoints: [
      { daystamp: "20210124", value: 0 },
      {
        daystamp: "20210125",
        value: 1,
      },
    ],
  });

  const fn = () => dial(g, { times: 2 });

  assertThrows(fn);
  t.restore();
});

// TODO:
// support odom goals
