class Room {
    constructor(instance, host) {
        this.instance = instance;
        this.host = host;
    }

    isHost(hostId) {
        return this.host === hostId;
    }
}

module.exports = Room