/**
 * Smart assign.
 * 
 * 1. merge nested plain Object instead replace it.
 * 2. otherwise all behaviors is same with `Object.assign` method.
 *  
 * var o1 = {k1: 'v1', k2: {k21: 'v21'}}
 * 
 * smartAssign({}, o1, {k1: 'nv1', k2: {k22: 'v22'}}):
 * 
 * {
 *   k1: : 'nv1', 
 *   k2: {k21: 'v21', k22: 'v22'}
 * }
 */
function isPlainObject(o) {
  return typeof (o) === 'object' && o !== null && o.constructor.name === 'Object';
}

/**
 * Deep copy source to target with specific rules.
 * 
 * It will mutate the target object but without any mutation on the source and its nested plain object.
 * This means deep copy.
 * 
 * Merge rules up to the key's value type:
 * 
 * | Sn | targetValue | sourceValue | mergeValue
 * |----|-------------|-------------|------------
 * | 1  | -           | s:is{...}   | merge({}, s)
 * | 2  | -           | s:other     | s
 * | 3  | t:is{...}   | s:is{...}   | t merge s
 * | 4  | t:is{...}   | s:not{...}  | prop ? merge(t, {prop: s}) ： s
 * | 5  | t:not{...}  | s:is{...}   | prop ? merge({prop: t}, s) : merge({}, s)
 * | 6  | t:not{...}  | s:not{...}  | s
 * 
 * @return target
 */
const merge = function (target, source, prop) {
  if (!target || !source) return target;
  Object.keys(source).forEach(key => {
    if (target.hasOwnProperty(key)) {
      const t = isPlainObject(target[key]);
      const s = isPlainObject(source[key]);
      if (t) {
        if (s) merge(target[key], source[key], prop); // merge
        else {
          if (prop) target[key][prop] = source[key]; // as prop value
          else target[key] = source[key];            // replace
        }
      } else {
        if (s) {
          if (prop) {
            const c = {};
            c[prop] = target[key];
            target[key] = merge(c, source[key], prop);       // as prop value then merge source
          } else target[key] = merge({}, source[key], prop); // replace with deep copy
        }
        else target[key] = source[key];                      // replace
      }
    } else {
      if (isPlainObject(source[key])) target[key] = merge({}, source[key], prop);
      else target[key] = source[key];
    }
  });

  return target;
}

const deepAssign = function (target, ...sources) {
  sources.forEach(source => merge(target, source));
  return target;
}

export {merge, deepAssign};
export default deepAssign;