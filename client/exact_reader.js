function ExactReader(reader) {
    this.reader = reader;
    this.leftover = null;
}

ExactReader.prototype.read = async function (length) {
    console.assert(length > 0, "length must be positive");

    const getChunk = async (leftover) => {
        while (leftover == null) {
            const buffer = await this.reader.read();
            if (buffer.done) {
                throw new Error("End: TODO: handle this differently")
            }
            if (buffer.value.byteLength > 0) {
                leftover = new Uint8Array(buffer.value);
            }
        }
        return leftover;
    }

    const chunk = await getChunk(this.leftover);

    console.assert(chunk.length > 0, "leftover should not be empty");
    console.assert(chunk.buffer.byteLength == chunk.byteOffset + chunk.byteLength, "leftover not at end of buffer");

    if (chunk.length > length) {
        this.leftover = chunk.subarray(length);
    } else {
        this.leftover = null;
    }

    if (chunk.length >= length) {
        return new DataView(chunk.buffer, chunk.byteOffset, length);
    }

    const buffer = new ArrayBuffer(length);
    const bufferView = new Uint8Array(buffer);

    let pos = 0;
    let next = chunk;
    while (next.length < length - pos) {
        bufferView.set(next, pos);
        pos += next.length;
        next = await getChunk(null);
    }

    const remaining = length - pos;
    bufferView.set(next.subarray(0, remaining), pos);
    if (next.length > remaining) {
        this.leftover = next.subarray(remaining);
    }
    return new DataView(buffer);
}

try {
    // for tests with node.js
    exports.ExactReader = ExactReader;
} catch (e) { }
