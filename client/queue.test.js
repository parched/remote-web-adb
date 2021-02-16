const queue = require('./queue.js');

console.assert = (statement, message) => {
    if (!statement) throw new Error(message);
};

const range = function (begin, end) {
    const result = new ArrayBuffer(end - begin);
    for (let i = begin; i < end; ++i) {
        new Uint8Array(result)[i - begin] = i;
    }
    return result;
}

expect.extend({
    toBeUint8Range(received, begin, end) {
        if (received.byteLength != end - begin) {
            return {
                message: () =>
                    `expected length ${received.byteLength} to be ${end - begin}`,
                pass: false,
            };
        }
        for (let i = 0; i < end - begin; ++i) {
            // TODO:
            if (received.getUint8(i) != begin + i) {
                return {
                    message: () =>
                        `expected element ${i} to be ${begin + i} but was ${received.getUint8(i)}`,
                    pass: false,
                };
            }

        }
        return {
            message: () =>
                `expected range [${begin}, ${end})`,
            pass: true,
        };
    },
});


test('queue write then read', async () => {
    const q = new queue.Queue();

    q.write(range(0, 5));

    expect(await q.read(5)).toBeUint8Range(0, 5);
});

test('queue write then read 2 parts', async () => {
    const q = new queue.Queue();

    q.write(range(0, 5));

    expect(await q.read(2)).toBeUint8Range(0, 2);
    expect(await q.read(3)).toBeUint8Range(2, 5);
});

test('queue write 2 parts then read', async () => {
    const q = new queue.Queue();

    q.write(range(0, 2));
    q.write(range(2, 5));

    expect(await q.read(5)).toBeUint8Range(0, 5);
});

test('queue write 3 parts then read', async () => {
    const q = new queue.Queue();

    q.write(range(0, 2));
    q.write(range(2, 5));
    q.write(range(5, 9));

    expect(await q.read(9)).toBeUint8Range(0, 9);
});

test('queue write 2 parts extra then read', async () => {
    const q = new queue.Queue();

    q.write(range(0, 2));
    q.write(range(2, 9));

    expect(await q.read(5)).toBeUint8Range(0, 5);
    expect(await q.read(4)).toBeUint8Range(5, 9);
});

test('queue read then write', () => {
    const q = new queue.Queue();
    const result = expect(q.read(5)).resolves.toBeUint8Range(0, 5);

    q.write(range(0, 5));

    return result;
});

test('queue write then read then write', () => {
    const q = new queue.Queue();

    q.write(range(0, 2));

    const result = expect(q.read(5)).resolves.toBeUint8Range(0, 5);

    q.write(range(2, 5));

    return result;
});

test('queue read then write 2 parts', () => {
    const q = new queue.Queue();

    const result = expect(q.read(5)).resolves.toBeUint8Range(0, 5);

    q.write(range(0, 2));
    q.write(range(2, 5));

    return result;
});

test('queue read then write 2 parts with extra', () => {
    const q = new queue.Queue();

    const result = expect(q.read(5)).resolves.toBeUint8Range(0, 5);

    q.write(range(0, 2));
    q.write(range(2, 9));

    return result;
});

test('queue read then write 3 parts', () => {
    const q = new queue.Queue();

    const result = expect(q.read(10)).resolves.toBeUint8Range(0, 10);

    q.write(range(0, 2));
    q.write(range(2, 5));
    q.write(range(5, 10));

    return result;
});


test('queue read 2 parts then write', () => {
    const q = new queue.Queue();

    const result = q.read(2).then(result => {
        expect(result).toBeUint8Range(0, 2);
        return q.read(3);
    }).then(result => {
        expect(result).toBeUint8Range(2, 5);
    });

    q.write(range(0, 5));

    return result;
});