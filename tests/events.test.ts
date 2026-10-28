import test from "node:test";
import assert from "node:assert/strict";
import { getUpcomingEvents, isUpcomingDate } from "../src/lib/events";

test("upcoming events exclude the past conference and undated communities", () => {
  assert.deepEqual(
    getUpcomingEvents(new Date("2026-10-28T12:00:00Z")).map((event) => event.key),
    ["base44-workshop"],
  );
  assert.equal(isUpcomingDate(undefined), false);
});

test("events expire at midnight in Israel, regardless of the server timezone", () => {
  assert.equal(isUpcomingDate("2026-12-23", new Date("2026-12-23T21:59:59Z")), true);
  assert.equal(isUpcomingDate("2026-12-23", new Date("2026-12-23T22:00:00Z")), false);
  assert.deepEqual(getUpcomingEvents(new Date("2026-12-23T22:00:00Z")), []);
});

test("confirmed future events are ordered by date", () => {
  assert.deepEqual(
    getUpcomingEvents(new Date("2026-10-01T12:00:00Z")).map((event) => event.key),
    ["future-of-ai", "base44-workshop"],
  );
});
