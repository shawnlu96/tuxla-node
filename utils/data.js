// data.js

const data = new Map();

function get(key) {
    return data.get(key);
}

function set(key, value) {
    data.set(key, value);
}

function remove(key) {
    data.delete(key);
}

function getAll() {
    const result = [];
    for (const [key, value] of data.entries()) {
        result.push({ key, value });
    }
    return result;
}

module.exports = {
    get,
    set,
    remove,
    getAll,
};