class Backoff {
    private max = 10000;
    private min = 1000;
    private factor = 2;

    private current;

    constructor() {
        this.current = this.min;
    }

    next() {
        let next = Math.min(this.max, this.current * this.factor);

        // add some jitter
        next = next + Math.floor(Math.random() * 1000);

        this.current = next;
        
        return next;
    }
}

export default Backoff;