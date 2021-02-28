export default class TrainArrival {
    constructor(line, destination, time) {
        this.line = line;
        this.destination = destination;
        this.time = time;
    }

    toString() {
        return "" + this.line + " " + this.destination + " " + this.time;
    }
}
