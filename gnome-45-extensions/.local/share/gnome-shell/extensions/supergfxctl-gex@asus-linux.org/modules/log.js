export function parseLog(text, prefix = '', obj = null) {
    if (obj !== null)
        return `supergfxctl-gex: ${prefix}${text}\nobj:\n${JSON.stringify(obj)}`;
    return `supergfxctl-gex: ${prefix}${text}`;
}

export function raw(text, obj = null) {
    console.log(parseLog(text, obj));
}

export function info(text, obj = null) {
    console.info(parseLog(text, '[INFO] ', obj));
}

export function error(text, e = null) {
    console.error(parseLog(text, '[ERROR] ', e));
}

export function warn(text, obj = null) {
    console.warn(parseLog(text, '[WARN] ', obj));
}

export function debug(text, obj = null) {
    console.debug(parseLog(text, '[DEBUG] ', obj));
}
