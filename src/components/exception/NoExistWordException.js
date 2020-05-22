export default class NoExistWordException {
    constructor() {
        this.message = 'Does not exist word.';
        this.name = 'NoExistWordException';
    }

    toString() {
        return `${this.name}: ${this.message}`;
    }
}
