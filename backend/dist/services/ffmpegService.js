"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startRtspToHls = startRtspToHls;
exports.stopStream = stopStream;
exports.isStreamActive = isStreamActive;
exports.startRtmpPush = startRtmpPush;
exports.stopRtmpPush = stopRtmpPush;
exports.isRtmpPushActive = isRtmpPushActive;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const activeStreams = new Map();
const activeRtmpPushes = new Map();
function startRtspToHls(streamId, rtspUrl) {
    const outputDir = path_1.default.join(__dirname, '..', '..', 'public', 'streams', streamId);
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const outputPath = path_1.default.join(outputDir, 'stream.m3u8');
    stopStream(streamId);
    const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
        '-rtsp_transport', 'tcp',
        '-i', rtspUrl,
        '-c:v', 'h264_qsv',
        '-an',
        '-f', 'hls',
        '-hls_time', '2',
        '-hls_list_size', '6',
        '-hls_flags', 'delete_segments',
        outputPath,
    ]);
    ffmpeg.stderr.on('data', (data) => {
        console.log(`[ffmpeg:${streamId}] ${data.toString()}`);
    });
    ffmpeg.on('close', (code) => {
        console.log(`[ffmpeg:${streamId}] process exited with code ${code}`);
        activeStreams.delete(streamId);
    });
    activeStreams.set(streamId, ffmpeg);
    return `/streams/${streamId}/stream.m3u8`;
}
function stopStream(streamId) {
    const existing = activeStreams.get(streamId);
    if (existing) {
        existing.kill('SIGKILL');
        activeStreams.delete(streamId);
        return true;
    }
    return false;
}
function isStreamActive(streamId) {
    return activeStreams.has(streamId);
}
function startRtmpPush(streamId, rtspUrl, rtmpUrl, streamKey) {
    stopRtmpPush(streamId);
    const fullRtmpTarget = `${rtmpUrl.replace(/\/$/, '')}/${streamKey}`;
    const drawtextFilter = "drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:text='RONNIE OSULLIVAN 2 - 1 JUDD TRUMP':fontcolor=white:fontsize=18:box=1:boxcolor=black@0.7:boxborderw=8:x=(w-text_w)/2:y=h-40";
    const ffmpeg = (0, child_process_1.spawn)('ffmpeg', [
        '-rtsp_transport', 'tcp',
        '-i', rtspUrl,
        '-vf', drawtextFilter,
        '-c:v', 'h264_qsv',
        '-g', '60',
        '-keyint_min', '60',
        '-b:v', '2500k',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-ar', '44100',
        '-f', 'flv',
        fullRtmpTarget,
    ]);
    ffmpeg.stderr.on('data', (data) => {
        console.log(`[rtmp:${streamId}] ${data.toString()}`);
    });
    ffmpeg.on('close', (code) => {
        console.log(`[rtmp:${streamId}] process exited with code ${code}`);
        activeRtmpPushes.delete(streamId);
    });
    activeRtmpPushes.set(streamId, ffmpeg);
}
function stopRtmpPush(streamId) {
    const existing = activeRtmpPushes.get(streamId);
    if (existing) {
        existing.kill('SIGKILL');
        activeRtmpPushes.delete(streamId);
        return true;
    }
    return false;
}
function isRtmpPushActive(streamId) {
    return activeRtmpPushes.has(streamId);
}
