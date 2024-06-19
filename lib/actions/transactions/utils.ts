export function ensure<T>(argument: T | undefined | null): T {
    if (argument === undefined || argument === null) {
        throw new TypeError("This value was promised to be there.");
    }

    return argument;
}

export function hexToBytes(hex: any) {
    let bytes = [];
    for (let c = 0; c < hex.length; c += 2) {
        bytes.push(parseInt(hex.substr(c, 2), 16));
    }
    return new Uint8Array(bytes);
}