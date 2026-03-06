const {
  parseValidMinutes,
  formatMinutesLabel,
  normalizeSoundPreset,
  loadPreferences,
  savePreferences
} = require("../public/timer-utils");

describe("parseValidMinutes", () => {
  it("keeps valid minute values", () => {
    expect(parseValidMinutes("30", 1, 120)).toBe(30);
  });

  it("returns null for non-numeric input", () => {
    expect(parseValidMinutes("abc", 1, 120)).toBe(null);
  });

  it("returns null for values below minimum", () => {
    expect(parseValidMinutes("0", 1, 120)).toBe(null);
  });

  it("returns null for values above maximum", () => {
    expect(parseValidMinutes("500", 1, 120)).toBe(null);
  });

  it("returns null for mixed numeric text", () => {
    expect(parseValidMinutes("10minutes", 1, 120)).toBe(null);
  });
});

describe("formatMinutesLabel", () => {
  it("formats minute labels for cards", () => {
    expect(formatMinutesLabel(15)).toBe("15m");
  });
});

describe("normalizeSoundPreset", () => {
  it("returns valid preset values", () => {
    expect(normalizeSoundPreset("bell", "chime")).toBe("bell");
  });

  it("falls back for unsupported preset values", () => {
    expect(normalizeSoundPreset("unknown", "chime")).toBe("chime");
  });
});

describe("preferences persistence", () => {
  function createMockStorage() {
    const store = {};
    return {
      getItem(key) {
        return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
      },
      setItem(key, value) {
        store[key] = value;
      }
    };
  }

  it("saves preferences to storage", () => {
    const storage = createMockStorage();
    const saved = savePreferences(storage, {
      focusMinutes: 30,
      breakMinutes: 10,
      soundPreset: "digital"
    });

    expect(saved).toBe(true);
  });

  it("loads valid preferences from storage", () => {
    const storage = createMockStorage();
    savePreferences(storage, {
      focusMinutes: 40,
      breakMinutes: 8,
      soundPreset: "bell"
    });

    const loaded = loadPreferences(storage, {
      focusMinutes: 25,
      breakMinutes: 5,
      soundPreset: "chime"
    });

    expect(loaded).toEqual({
      focusMinutes: 40,
      breakMinutes: 8,
      soundPreset: "bell"
    });
  });

  it("falls back to defaults for invalid stored values", () => {
    const storage = createMockStorage();
    savePreferences(storage, {
      focusMinutes: 0,
      breakMinutes: 99,
      soundPreset: "bad"
    });

    const defaults = {
      focusMinutes: 25,
      breakMinutes: 5,
      soundPreset: "chime"
    };

    const loaded = loadPreferences(storage, defaults);
    expect(loaded).toEqual(defaults);
  });
});
