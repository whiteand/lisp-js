export function log(...args) {
  console.log(...args);
}
export function get(prop, obj) {
  if (arguments.length <= 0) {
    return get;
  }
  if (arguments.length <= 1) {
    return function partialGet(obj) {
      return get(prop, obj);
    };
  }
  if (arguments.length > 2) {
    throw new Error("get: too many arguments");
  }
  if (obj == null) return undefined;
  return obj[prop];
}

export function panic(error) {
  throw error
}

export function _eq_(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false
  if (typeof a === 'function') return false
  if (!a || !b) return false
  if (typeof a.equals === 'function') return a.equals(b)
  if (typeof b.equals === 'function') return b.equals(a)

  if (Array.isArray(a)) {
    if (!Array.isArray(b)) {
      return false
    }
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (!_eq_(a[i], b[i])) return false
    }
    return true
  }

  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  aKeys.sort()
  bKeys.sort()
  if (!_eq_(aKeys, bKeys)) return false
  for (let i = 0; i < aKeys.length; i++) {
    const key = aKeys[i]
    if (!_eq_(a[key], b[key])) return false
  }
  return true
}