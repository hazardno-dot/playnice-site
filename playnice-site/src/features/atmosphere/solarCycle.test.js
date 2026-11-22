import { solarAltitude, atmosphere } from "./solarCycle";

describe("Living Sky solar cycle", () => {
  const lat = 42.4304;
  const lon = 18.6967;
  test("solar altitude distinguishes a spring midday and midnight in Tivat", () => {
    const noon = solarAltitude(new Date("2026-03-21T11:00:00Z"), lat, lon);
    const midnight = solarAltitude(new Date("2026-03-21T00:00:00Z"), lat, lon);
    expect(noon).toBeGreaterThan(30);
    expect(midnight).toBeLessThan(-20);
    // Longitude direction matters: Tivat solar noon is near 11:00 UTC, not 14:00 UTC.
    const afternoon = solarAltitude(new Date("2026-03-21T14:00:00Z"), lat, lon);
    expect(noon).toBeGreaterThan(afternoon);
    expect(solarAltitude(new Date("2026-03-21T06:00:00Z"), lat, lon)).toBeGreaterThan(0);
  });
  test("atmosphere has a plausible day and night palette", () => {
    const noon = atmosphere(new Date("2026-03-21T11:00:00Z"), lat, lon);
    const midnight = atmosphere(new Date("2026-03-21T00:00:00Z"), lat, lon);
    expect(noon.phase).toBe("day");
    expect(midnight.phase).toBe("night");
    expect(noon.colors.stars).toBe(0);
    expect(midnight.colors.stars).toBeGreaterThan(0);
  });
  test("dawn and sunset are distinct and interpolation does not jump", () => {
    const date = new Date("2026-03-21T00:00:00Z");
    const observed = new Set();
    let maxColorStep = 0;
    let prior = null;
    for (let minute = 0; minute < 1440; minute += 2) {
      const result = atmosphere(new Date(date.getTime()+minute*60000), lat, lon);
      observed.add(result.phase);
      if (prior) {
        const step = Math.max(...result.colors.base.map((channel,index) => Math.abs(channel-prior.colors.base[index])));
        maxColorStep = Math.max(maxColorStep,step);
      }
      prior = result;
    }
    expect(observed.has("dawn")).toBe(true);
    expect(observed.has("sunrise")).toBe(true);
    expect(observed.has("sunset")).toBe(true);
    expect(observed.has("blue")).toBe(true);
    expect(maxColorStep).toBeLessThan(12);
  });
});
