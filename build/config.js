"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const bunyan_1 = __importDefault(require("bunyan"));
dotenv_1.default.config({});
class Config {
    constructor() {
        this.defaultDBURL = 'mongodb://localhost:27017/midcloud';
        this.DATABASE_URL = process.env.DATABASE_URL || this.defaultDBURL;
        this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
        this.NODE_ENV = process.env.NODE_ENV || '';
        this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
        this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
        this.CLIENT_URL = process.env.CLIENT_URL || '';
        this.REDIS_HOST = process.env.REDIS_HOST || '';
    }
    createLogger(name) {
        return bunyan_1.default.createLogger({ name, level: 'debug' });
    }
    validateConfigs() {
        for (const [key, value] of Object.entries(this)) {
            if (value === undefined) {
                throw new Error(`Configuration ${key} is undefined.`);
            }
        }
    }
}
exports.config = new Config();
//# sourceMappingURL=config.js.map