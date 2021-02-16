function Queue() {
    this.messages = new Array();
    this.posInFirstMessage = 0;
    this.waitingRead = null;
}

Queue.prototype.write = function (message) {
    if (message.byteLength == 0) {
        return;
    }

    if (this.waitingRead == null) {
        this.messages.push(message);
        return;
    }

    // there is a waiter
    console.assert(this.messages.length == 0, `messages in queue ${this.messages.length}`);
    console.assert(this.posInFirstMessage == 0, `pos not zero: ${this.posInFirstMessage}`);

    if (this.waitingRead.buffer == null) {
        // waiter has nothing yet
        if (message.byteLength < this.waitingRead.length) {
            this.waitingRead.buffer = new ArrayBuffer(this.waitingRead.length);
            new Uint8Array(this.waitingRead.buffer).set(new Uint8Array(message));
            this.waitingRead.length -= message.byteLength;
            return;
        }
        if (message.byteLength != this.waitingRead.length) {
            this.posInFirstMessage = this.waitingRead.length;
            this.messages.push(message);
        }
        this.waitingRead.resolve(new DataView(message, 0, this.waitingRead.length));
        this.waitingRead = null;
        return;
    }

    // the waiter already has a partial amount
    const posInBuffer = this.waitingRead.buffer.byteLength - this.waitingRead.length;
    const buffer = new Uint8Array(this.waitingRead.buffer, posInBuffer);
    if (message.byteLength < this.waitingRead.length) {
        buffer.set(new Uint8Array(message));
        this.waitingRead.length -= message.byteLength;
        return;
    }

    // this message is enough to satisfy the waiter
    buffer.set(new Uint8Array(message, 0, this.waitingRead.length));
    if (message.byteLength > this.waitingRead.length) {
        // and there is some left
        this.posInFirstMessage = this.waitingRead.length;
        this.messages.push(message);
    }

    this.waitingRead.resolve(new DataView(this.waitingRead.buffer));
    this.waitingRead = null;
}

Queue.prototype.read = async function (length) {
    console.assert(this.waitingToRead == null, `more than one waiter`);
    if (this.messages.length == 0) {
        return new Promise((resolve, reject) => {
            this.waitingRead = { resolve: resolve, length: length, buffer: null };
        });
    }

    const firstMessage = this.messages[0];
    const firstMessageLength = firstMessage.byteLength - this.posInFirstMessage;
    if (firstMessageLength >= length) {
        // no copy needed
        const ret = new DataView(firstMessage, this.posInFirstMessage, length);
        if (firstMessageLength == length) {
            this.messages.shift();
            this.posInFirstMessage = 0;
        } else {
            this.posInFirstMessage += length;
        }

        return ret;
    }

    const buffer = new ArrayBuffer(length);
    const bufferView = new Uint8Array(buffer);
    const firstMessageView = new Uint8Array(this.messages.shift(), this.posInFirstMessage);
    this.posInFirstMessage = 0;
    bufferView.set(firstMessageView);
    let remaining = length - firstMessageView.length;

    while (this.messages.length > 0) {
        const message = new Uint8Array(this.messages[0]);

        if (message.length >= remaining) {
            bufferView.set(message.subarray(0, remaining), length - remaining);
            const ret = new DataView(buffer);
            if (message.length == remaining) {
                this.messages.shift();
                this.posInFirstMessage = 0;
            } else {
                this.posInFirstMessage = remaining;
            }
            return ret;
        }

        bufferView.set(message, length - remaining);
        this.messages.shift();
        remaining -= message.length;
    }

    return new Promise((resolve, reject) => {
        this.waitingRead = { resolve: resolve, length: remaining, buffer: buffer };
    });
}

try {
    // for tests with node.js
    exports.Queue = Queue;
} catch (e) { }
