// Utility function to validate if a value is a number
export function isNumber(value) {
  return typeof value === 'number' && !isNaN(value);
}

// Utility function to validate if a value is a string
export function isString(value) {
  return typeof value === 'string' || value instanceof String;
}

// Utility function to validate if a value is an object
export function isObject(value) {
  return value && typeof value === 'object' && value.constructor === Object;
}

// Utility function to validate if a value is an array
export function isArray(value) {
  return Array.isArray(value);
}

// Utility function to validate if a value is a boolean
export function isBoolean(value) {
  return typeof value === 'boolean';
}

// Utility function to validate if a value is a function
export function isFunction(value) {
  return typeof value === 'function';
}

// Utility function to validate if an object has a required property
export function hasProperty(obj, property) {
  return obj != null && Object.prototype.hasOwnProperty.call(obj, property);
}

// Utility function to validate if an array is not empty
export function isNotEmptyArray(array) {
  return Array.isArray(array) && array.length > 0;
}

// Utility function to validate if a string is not empty
export function isNotEmptyString(string) {
  return isString(string) && string.trim().length > 0;
}

// Utility function to validate if an object is not empty
export function isNotEmptyObject(obj) {
  return isObject(obj) && Object.keys(obj).length > 0;
}

// Utility function to validate if a value is a valid date
export function isValidDate(value) {
  return !isNaN(Date.parse(value));
}

// Utility function to validate if a value is a valid email
export function isValidEmail(value) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return isString(value) && emailPattern.test(value);
}

// Utility function to validate if a value is a valid URL
export function isValidURL(value) {
  try {
    new URL(value);
    return true;
  } catch (_) {
    return false;
  }
}

// Utility function to validate if a value is a valid JSON string
export function isValidJSON(value) {
  try {
    JSON.parse(value);
    return true;
  } catch (e) {
    return false;
  }
}

// Utility function to validate if a number is within a specified range
export function isNumberInRange(value, min, max) {
  return isNumber(value) && value >= min && value <= max;
}

// Utility function to validate if a string matches a regular expression
export function matchesRegex(string, regex) {
  return isString(string) && regex.test(string);
}
