"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const stream_1 = __importDefault(require("./routes/stream"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/streams', express_1.default.static(path_1.default.join(__dirname, '..', 'public', 'streams')));
app.use('/api/stream', stream_1.default);
app.get('/', (req, res) => {
    res.send('Cue Stream backend is running');
});
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
