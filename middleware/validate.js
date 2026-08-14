const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
  return typeof email === 'string' && EMAIL_RE.test(email.trim());
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
}

function isPositiveAmount(amount) {
  const n = Number(amount);
  return !Number.isNaN(n) && n > 0 && n < 100000000;
}

function isNonNegativeAmount(amount) {
  const n = Number(amount);
  return !Number.isNaN(n) && n >= 0 && n < 100000000;
}

function isValidDate(dateStr) {
  if (typeof dateStr !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  const d = new Date(dateStr);
  return !Number.isNaN(d.getTime());
}

function isNonEmptyString(str, maxLen = 255) {
  return typeof str === 'string' && str.trim().length > 0 && str.trim().length <= maxLen;
}

function sanitizeText(str) {
  return typeof str === 'string' ? str.trim().slice(0, 500) : '';
}

module.exports = {
  isValidEmail,
  isValidPassword,
  isPositiveAmount,
  isNonNegativeAmount,
  isValidDate,
  isNonEmptyString,
  sanitizeText,
};