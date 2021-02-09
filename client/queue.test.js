const queue = require('./queue.js');

test('queue write then read', async () => {
    const q = new queue.Queue();
    q.write(new ArrayBuffer(5));
    const result = await q.read(5);
    expect(result.byteLength).toBe(5);
});

test('queue write then read 2 parts', async () => {
    const q = new queue.Queue();
    q.write(new ArrayBuffer(5));

    const result = await q.read(2);
    expect(result.byteLength).toBe(2);
    const result1 = await q.read(3);
    expect(result1.byteLength).toBe(3);
});

test('queue write 2 parts then read', async () => {
    const q = new queue.Queue();
    q.write(new ArrayBuffer(2));
    q.write(new ArrayBuffer(3));

    const result = await q.read(5);
    expect(result.byteLength).toBe(5);
});

test('queue write 3 parts then read', async () => {
    const q = new queue.Queue();
    q.write(new ArrayBuffer(2));
    q.write(new ArrayBuffer(3));
    q.write(new ArrayBuffer(4));

    const result = await q.read(9);
    expect(result.byteLength).toBe(9);
});

test('queue write 2 parts extra then read', async () => {
    const q = new queue.Queue();
    q.write(new ArrayBuffer(2));
    q.write(new ArrayBuffer(7));

    const result = await q.read(5);
    expect(result.byteLength).toBe(5);
    const result1 = await q.read(4);
    expect(result1.byteLength).toBe(4);
});

test('queue read then write', async (done) => {
    const q = new queue.Queue();
    q.read(5).then(result => {
        expect(result.byteLength).toBe(5);
        done();
    });

    q.write(new ArrayBuffer(5));
});

test('queue write then read then write', async (done) => {
    const q = new queue.Queue();

    q.write(new ArrayBuffer(2));

    q.read(5).then(result => {
        expect(result.byteLength).toBe(5);
        done();
    });

    q.write(new ArrayBuffer(3));
});

test('queue read then write 2 parts', async (done) => {
    const q = new queue.Queue();
    q.read(5).then(result => {
        expect(result.byteLength).toBe(5);
        done();
    });

    q.write(new ArrayBuffer(2));
    q.write(new ArrayBuffer(3));
});

test('queue read then write 2 parts with extra', async (done) => {
    const q = new queue.Queue();
    q.read(5).then(result => {
        expect(result.byteLength).toBe(5);
        done();
    });

    q.write(new ArrayBuffer(2));
    q.write(new ArrayBuffer(7));
});

test('queue read then write 3 parts', async (done) => {
    const q = new queue.Queue();
    q.read(10).then(result => {
        expect(result.byteLength).toBe(10);
        done();
    });

    q.write(new ArrayBuffer(2));
    q.write(new ArrayBuffer(3));
    q.write(new ArrayBuffer(5));
});


test('queue read 2 parts then write', async (done) => {
    const q = new queue.Queue();
    q.read(2).then(result => {
        expect(result.byteLength).toBe(2);
        return q.read(3);
    }).then(result => {
        expect(result.byteLength).toBe(3);
        done();
    });

    q.write(new ArrayBuffer(5));
});