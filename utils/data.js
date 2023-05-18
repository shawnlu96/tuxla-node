// data.js

const data = new Map();

export function get(key) {
    return data.get(key);
}

export function set(key, value) {
    data.set(key, value);
}

export function remove(key) {
    data.delete(key);
}

export function getAll() {
    const result = [];
    for (const [key, value] of data.entries()) {
        result.push({ key, value });
    }
    return result;
}

