import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import fs from 'fs';

const activeStreams = new Map<string, ChildProcessWithoutNullStreams>();
const activeRtmpPushes = new Map<string, ChildProcessWithoutNullStreams>();

export function startRtspToHls(streamId: string, rtspUrl: string): string {
  const outputDir = path.join(__dirname, '..', '..', 'public', 'streams', streamId);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'stream.m3u8');

  stopStream(streamId);

  const ffmpeg = spawn('ffmpeg', [
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

export function stopStream(streamId: string): boolean {
  const existing = activeStreams.get(streamId);
  if (existing) {
    existing.kill('SIGKILL');
    activeStreams.delete(streamId);
    return true;
  }
  return false;
}

export function isStreamActive(streamId: string): boolean {
  return activeStreams.has(streamId);
}

export function startRtmpPush(streamId: string, rtspUrl: string, rtmpUrl: string, streamKey: string): void {
  stopRtmpPush(streamId);

  const fullRtmpTarget = `${rtmpUrl.replace(/\/$/, '')}/${streamKey}`;
const drawtextFilter =
  "drawtext=fontfile=C\\\\:/Windows/Fonts/arialbd.ttf:text='RONNIE OSULLIVAN 2 - 1 JUDD TRUMP':fontcolor=white:fontsize=18:box=1:boxcolor=black@0.7:boxborderw=8:x=(w-text_w)/2:y=h-40";
  const ffmpeg = spawn('ffmpeg', [
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

export function stopRtmpPush(streamId: string): boolean {
  const existing = activeRtmpPushes.get(streamId);
  if (existing) {
    existing.kill('SIGKILL');
    activeRtmpPushes.delete(streamId);
    return true;
  }
  return false;
}

export function isRtmpPushActive(streamId: string): boolean {
  return activeRtmpPushes.has(streamId);
}