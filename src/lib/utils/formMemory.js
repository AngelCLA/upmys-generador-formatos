const FORM_PREFIX = 'upmys.form.';
const SUGGESTIONS_KEY = 'upmys.formSuggestions.v1';
const MAX_SUGGESTIONS = 10;

function hasStorage() {
  return typeof localStorage !== 'undefined';
}

function readJson(key, fallback) {
  if (!hasStorage()) return fallback;

  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  if (!hasStorage()) return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota/private mode failures; form generation should still work.
  }
}

function normalizeSuggestion(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function loadFormMemory(formKey, defaults) {
  const saved = readJson(`${FORM_PREFIX}${formKey}`, null);
  if (!saved || typeof saved !== 'object') return defaults;

  return { ...defaults, ...saved };
}

export function saveFormMemory(formKey, form) {
  writeJson(`${FORM_PREFIX}${formKey}`, form);
}

export function getFieldSuggestions(fieldKey) {
  const suggestions = readJson(SUGGESTIONS_KEY, {});
  const values = suggestions[fieldKey];
  return Array.isArray(values) ? values : [];
}

export function rememberFieldValue(fieldKey, value) {
  const normalized = normalizeSuggestion(value);
  if (!fieldKey || normalized.length < 2) return;

  const suggestions = readJson(SUGGESTIONS_KEY, {});
  const current = Array.isArray(suggestions[fieldKey]) ? suggestions[fieldKey] : [];
  suggestions[fieldKey] = [normalized, ...current.filter((item) => item !== normalized)].slice(0, MAX_SUGGESTIONS);
  writeJson(SUGGESTIONS_KEY, suggestions);
}

export function rememberFormValues(form, fieldMap) {
  for (const [fieldName, fieldKey] of Object.entries(fieldMap)) {
    rememberFieldValue(fieldKey, form[fieldName]);
  }
}
