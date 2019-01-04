class HttpRequestError extends Error {
    constructor(public status: number, public message: string) {
        super(message);
        Object.setPrototypeOf(this, HttpRequestError.prototype);
    }
}