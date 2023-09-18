"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoiRequestValidationError = exports.ServerError = exports.FileTooLargeError = exports.NotAuthorizedError = exports.NotFoundError = exports.BadRequestError = exports.CustomError = void 0;
const http_status_codes_1 = __importDefault(require("http-status-codes"));
class CustomError extends Error {
    constructor(message) {
        super(message);
    }
    serializeErrors() {
        return {
            message: this.message,
            code: this.code,
            status: this.status
        };
    }
}
exports.CustomError = CustomError;
class BadRequestError extends CustomError {
    constructor(message) {
        super(message);
        this.code = http_status_codes_1.default.BAD_REQUEST;
        this.status = 'error';
    }
}
exports.BadRequestError = BadRequestError;
class NotFoundError extends CustomError {
    constructor(message) {
        super(message);
        this.code = http_status_codes_1.default.NOT_FOUND;
        this.status = 'error';
    }
}
exports.NotFoundError = NotFoundError;
class NotAuthorizedError extends CustomError {
    constructor(message) {
        super(message);
        this.code = http_status_codes_1.default.UNAUTHORIZED;
        this.status = 'error';
    }
}
exports.NotAuthorizedError = NotAuthorizedError;
class FileTooLargeError extends CustomError {
    constructor(message) {
        super(message);
        this.code = http_status_codes_1.default.REQUEST_TOO_LONG;
        this.status = 'error';
    }
}
exports.FileTooLargeError = FileTooLargeError;
class ServerError extends CustomError {
    constructor(message) {
        super(message);
        this.code = http_status_codes_1.default.SERVICE_UNAVAILABLE;
        this.status = 'error';
    }
}
exports.ServerError = ServerError;
class JoiRequestValidationError extends CustomError {
    constructor(message) {
        super(message);
        this.code = http_status_codes_1.default.BAD_REQUEST;
        this.status = 'error';
    }
}
exports.JoiRequestValidationError = JoiRequestValidationError;
//# sourceMappingURL=error-handler.js.map