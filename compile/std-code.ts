export const STD: string = `
export function log() {
    console.log.apply(console, arguments);
}
export function get(prop, obj) {
    if (arguments.length <= 0) {
        return get
    }
    if (arguments.length <= 1) {
        return function partialGet(obj){ return get(prop, obj) }
    }
    if (arguments.length > 2) {
        throw new Error("get: too many arguments")
    }
    if (obj == null) return undefined
    return obj[prop]
}
`.trim();
