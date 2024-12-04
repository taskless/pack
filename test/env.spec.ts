import { vi, test, afterEach, describe } from "vitest";

describe("Taskless environment and importing (requires build)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test("This project is able to accept tests", ({ expect }) => {
    expect(true).toBe(true);
  });
});
