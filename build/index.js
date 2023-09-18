"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const setupServer_1 = require("./setupServer");
const setupDB_1 = __importDefault(require("./setupDB"));
const config_1 = require("./config");
class Application {
    init() {
        this.loadConfig();
        (0, setupDB_1.default)();
        const app = (0, express_1.default)();
        const server = new setupServer_1.MidCloudServer(app);
        server.start();
    }
    loadConfig() {
        config_1.config.validateConfigs();
    }
}
const application = new Application();
application.init();
//# sourceMappingURL=index.js.map