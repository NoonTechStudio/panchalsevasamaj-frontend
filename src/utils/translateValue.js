import i18n from "../i18n.js";

/**
 * Translates a known fixed dropdown value (occupation, gender, relation, etc.)
 * to the currently active language. Free-text values (names, addresses) are
 * returned as-is since they are user-entered and cannot be translated.
 */
export const tv = (value) => {
  if (!value) return value;
  const key = `values.${value}`;
  const translated = i18n.t(key);
  // i18next returns the key itself when no translation found — fall back to original
  return translated === key ? value : translated;
};
