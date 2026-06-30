class ExpressError extends Error {
    constructor() {
        super();
        this.statusCode = this.statusCode;
        this.message = this.message;
    }
}
module.exports = ExpressError;