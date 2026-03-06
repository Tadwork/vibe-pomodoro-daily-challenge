(function (global) {
  const PREFERENCES_KEY = "pomodoroPreferences";
  const SOUND_PRESETS = ["chime", "bell", "digital"];

  function parseValidMinutes(rawValue, min, max) {
    const trimmed = String(rawValue).trim();
    if (!/^\d+$/.test(trimmed)) return null;

    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isFinite(parsed)) return null;
    if (parsed < min || parsed > max) return null;

    return parsed;
  }

  function formatMinutesLabel(minutes) {
    return `${minutes}m`;
  }

  function normalizeSoundPreset(rawValue, fallback) {
    return SOUND_PRESETS.includes(rawValue) ? rawValue : fallback;
  }

  function loadPreferences(storage, defaults) {
    if (!storage) return defaults;

    try {
      const raw = storage.getItem(PREFERENCES_KEY);
      if (!raw) return defaults;
      const parsed = JSON.parse(raw);
      const focusMinutes = parseValidMinutes(parsed.focusMinutes, 1, 120) ?? defaults.focusMinutes;
      const breakMinutes = parseValidMinutes(parsed.breakMinutes, 1, 60) ?? defaults.breakMinutes;
      const soundPreset = normalizeSoundPreset(parsed.soundPreset, defaults.soundPreset);

      return {
        focusMinutes,
        breakMinutes,
        soundPreset
      };
    } catch (_error) {
      return defaults;
    }
  }

  function savePreferences(storage, preferences) {
    if (!storage) return false;

    try {
      storage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
      return true;
    } catch (_error) {
      return false;
    }
  }

  const api = {
    parseValidMinutes,
    formatMinutesLabel,
    normalizeSoundPreset,
    loadPreferences,
    savePreferences,
    SOUND_PRESETS
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  global.PomodoroUtils = api;
})(typeof window !== "undefined" ? window : globalThis);
