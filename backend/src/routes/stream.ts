import { Router, Request, Response } from 'express';
import {
  startRtspToHls,
  stopStream,
  isStreamActive,
  startRtmpPush,
  stopRtmpPush,
  isRtmpPushActive,
} from '../services/ffmpegService';

const router = Router();

router.post('/start', (req: Request, res: Response) => {
  const { streamId, rtspUrl } = req.body;

  if (!streamId || !rtspUrl) {
    return res.status(400).json({ error: 'streamId and rtspUrl are required' });
  }

  try {
    const hlsUrl = startRtspToHls(streamId, rtspUrl);
    return res.json({ success: true, hlsUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to start stream' });
  }
});

router.post('/stop', (req: Request, res: Response) => {
  const { streamId } = req.body;

  if (!streamId) {
    return res.status(400).json({ error: 'streamId is required' });
  }

  const stopped = stopStream(streamId);
  return res.json({ success: stopped });
});

router.get('/status/:streamId', (req: Request, res: Response) => {
  const streamId = req.params.streamId as string;
  return res.json({ active: isStreamActive(streamId) });
});

router.post('/push-rtmp', (req: Request, res: Response) => {
  const { streamId, rtspUrl, rtmpUrl, streamKey } = req.body;

  if (!streamId || !rtspUrl || !rtmpUrl || !streamKey) {
    return res.status(400).json({ error: 'streamId, rtspUrl, rtmpUrl, and streamKey are required' });
  }

  try {
    startRtmpPush(streamId, rtspUrl, rtmpUrl, streamKey);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to start RTMP push' });
  }
});

router.post('/stop-rtmp', (req: Request, res: Response) => {
  const { streamId } = req.body;

  if (!streamId) {
    return res.status(400).json({ error: 'streamId is required' });
  }

  const stopped = stopRtmpPush(streamId);
  return res.json({ success: stopped });
});

router.get('/rtmp-status/:streamId', (req: Request, res: Response) => {
  const streamId = req.params.streamId as string;
  return res.json({ active: isRtmpPushActive(streamId) });
});

export default router;