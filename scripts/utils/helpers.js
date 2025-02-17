// Utility function to format numbers with commas as thousand separators
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Utility function to format dates to a readable string
export function formatDate(date) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(date).toLocaleDateString(undefined, options);
}

// Utility function to calculate the percentage change between two values
export function calculatePercentageChange(oldValue, newValue) {
  return ((newValue - oldValue) / oldValue) * 100;
}

// Utility function to deep clone an object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Utility function to debounce a function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Utility function to throttle a function
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Utility function to convert a string to title case
export function toTitleCase(str) {
  return str.replace(/\w\S*/g, function (txt) {
    return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
  });
}

// Utility function to generate a unique ID
export function generateUniqueId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

// Utility function to check if an object is empty
export function isEmptyObject(obj) {
  return Object.keys(obj).length === 0 && obj.constructor === Object;
}

// Utility function to sort an array of objects by a key
export function sortByKey(array, key) {
  return array.sort((a, b) => {
    const x = a[key];
    const y = b[key];
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

// Utility function to group an array of objects by a key
export function groupBy(array, key) {
  return array.reduce((result, currentValue) => {
    (result[currentValue[key]] = result[currentValue[key]] || []).push(currentValue);
    return result;
  }, {});
}

// Utility function to find the maximum value in an array of objects by a key
export function findMaxByKey(array, key) {
  return array.reduce((max, obj) => (obj[key] > max[key] ? obj : max), array[0]);
}

// Utility function to find the minimum value in an array of objects by a key
export function findMinByKey(array, key) {
  return array.reduce((min, obj) => (obj[key] < min[key] ? obj : min), array[0]);
}

// Utility function to calculate the sum of values in an array of objects by a key
export function sumByKey(array, key) {
  return array.reduce((sum, obj) => sum + obj[key], 0);
}

// Utility function to capitalize the first letter of a string
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
