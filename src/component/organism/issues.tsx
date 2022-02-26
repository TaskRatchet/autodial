import React from "react";

export default function Issues(): JSX.Element {
  return <>
    <h2>Known Issues & Limitations</h2>
    <ul>
      <li>
        Not all <a
          href="https://help.beeminder.com/article/97-custom-goals#aggday">aggregation
        methods</a> are
        supported. Unsupported methods include mode, trimmean, clocky, and
        skatesum.
      </li>
      <li>The aggregated value of a goal's initial day is considered the
        starting value of the road and does not
        otherwise influence dialing.
      </li>
      <li>
        This tool assumes the akrasia horizon is eight days instead of seven in
        order to avoid needing to take the
        user's timezone into account.
      </li>
      <li>
        Logging into the autodialer in one window will log you out in all
        other windows.
      </li>
      <li>
        The end state of a dialed goal will always be in terms of date and
        rate, regardless of how the goal's end was originally defined.
      </li>
    </ul>
  </>;
}
