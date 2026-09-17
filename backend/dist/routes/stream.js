"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ffmpegService_1 = require("../services/ffmpegService");
const router = (0, express_1.Router)();
router.post('/start', (req, res) => {
    const { streamId, rtspUrl } = req.body;
    if (!streamId || !rtspUrl) {
        return res.status(400).json({ error: 'streamId and rtspUrl are required' });
    }
    try {
        const hlsUrl = (0, ffmpegService_1.startRtspToHls)(streamId, rtspUrl);
        return res.json({ success: true, hlsUrl });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to start stream' });
    }
});
router.post('/stop', (req, res) => {
    const { streamId } = req.body;
    if (!streamId) {
        return res.status(400).json({ error: 'streamId is required' });
    }
    const stopped = (0, ffmpegService_1.stopStream)(streamId);
    return res.json({ success: stopped });
});
router.get('/status/:streamId', (req, res) => {
    const streamId = req.params.streamId;
    return res.json({ active: (0, ffmpegService_1.isStreamActive)(streamId) });
});
router.post('/push-rtmp', (req, res) => {
    const { streamId, rtspUrl, rtmpUrl, streamKey } = req.body;
    if (!streamId || !rtspUrl || !rtmpUrl || !streamKey) {
        return res.status(400).json({ error: 'streamId, rtspUrl, rtmpUrl, and streamKey are required' });
    }
    try {
        (0, ffmpegService_1.startRtmpPush)(streamId, rtspUrl, rtmpUrl, streamKey);
        return res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to start RTMP push' });
    }
});
router.post('/stop-rtmp', (req, res) => {
    const { streamId } = req.body;
    if (!streamId) {
        return res.status(400).json({ error: 'streamId is required' });
    }
    const stopped = (0, ffmpegService_1.stopRtmpPush)(streamId);
    return res.json({ success: stopped });
});
router.get('/rtmp-status/:streamId', (req, res) => {
    const streamId = req.params.streamId;
    return res.json({ active: (0, ffmpegService_1.isRtmpPushActive)(streamId) });
});
exports.default = router;
