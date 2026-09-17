import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import Scoreboard from './Scoreboard';
import './App.css';

const BACKEND_URL = 'http://localhost:3001';

function App() {
  const [rtspUrl, setRtspUrl] = useState('');
  const [rtmpUrl, setRtmpUrl] = useState('rtmp://a.rtmp.youtube.com/live2');
  const [streamKey, setStreamKey] = useState('');
  const [status, setStatus] = useState('');
  const [rtmpStatus, setRtmpStatus] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      hlsRef.current?.destroy();
    };
  }, []);

  const handleGetFeed = async () => {
    if (!rtspUrl) return;
    setStatus('Starting stream...');

    try {
      const res = await fetch(`${BACKEND_URL}/api/stream/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: 'table1', rtspUrl }),
      });
      const data = await res.json();

      if (!data.success) {
        setStatus('Failed to start stream');
        return;
      }

      const hlsUrl = `${BACKEND_URL}${data.hlsUrl}`;

      setStatus('Waiting for stream to buffer...');
      setTimeout(() => {
        playHls(hlsUrl);
      }, 4000);
    } catch (err) {
      console.error(err);
      setStatus('Error contacting backend');
    }
  };

  const playHls = (hlsUrl: string) => {
    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    video.removeAttribute('src');
    video.load();

    if (Hls.isSupported()) {
      const hls = new Hls({
        liveSyncDurationCount: 4,
        liveMaxLatencyDurationCount: 8,
        maxBufferLength: 15,
        highBufferWatchdogPeriod: 1,
        nudgeMaxRetry: 10,
      });
      hlsRef.current = hls;

      hls.loadSource(hlsUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        console.log('[HLS] Manifest parsed, starting playback');
        video.play().catch((e) => console.warn('[HLS] autoplay blocked', e));
        setStatus('Playing');
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        console.error('[HLS ERROR]', data.type, data.details, 'fatal:', data.fatal);

        if (!data.fatal) {
          if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
            setStatus('Buffering...');
            video.currentTime += 0.1;
          }
          return;
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            console.log('[HLS] Fatal network error, retrying load...');
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('[HLS] Fatal media error, attempting recovery...');
            hls.recoverMediaError();
            break;
          default:
            console.log('[HLS] Unrecoverable error, rebuilding player...');
            hls.destroy();
            hlsRef.current = null;
            setStatus(`Fatal error: ${data.details} — click Get Feed to retry`);
            break;
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = hlsUrl;
      video.play();
      setStatus('Playing');
    } else {
      setStatus('HLS not supported in this browser');
    }
  };

  const handleFullscreen = () => {
    containerRef.current?.requestFullscreen();
  };

  const handleStartStreaming = async () => {
    if (!rtspUrl || !rtmpUrl || !streamKey) {
      setRtmpStatus('rtspUrl, rtmpUrl, and streamKey are all required');
      return;
    }
    setRtmpStatus('Starting RTMP push...');

    try {
      const res = await fetch(`${BACKEND_URL}/api/stream/push-rtmp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: 'table1', rtspUrl, rtmpUrl, streamKey }),
      });
      const data = await res.json();
      setRtmpStatus(data.success ? 'Streaming to YouTube...' : 'Failed to start RTMP push');
    } catch (err) {
      console.error(err);
      setRtmpStatus('Error contacting backend');
    }
  };

  const handleStopStreaming = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/stream/stop-rtmp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ streamId: 'table1' }),
      });
      const data = await res.json();
      setRtmpStatus(data.success ? 'Stream stopped' : 'Nothing was running');
    } catch (err) {
      console.error(err);
      setRtmpStatus('Error contacting backend');
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2>Cue Stream — Feed Test</h2>

      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="rtsp://user:pass@ip:554/stream1"
          value={rtspUrl}
          onChange={(e) => setRtspUrl(e.target.value)}
          style={{ width: '400px', padding: '0.5rem', marginRight: '0.5rem' }}
        />
        <button onClick={handleGetFeed} style={{ padding: '0.5rem 1rem' }}>
          Get Feed
        </button>
      </div>

      <p>Status: {status}</p>

      <div ref={containerRef} style={{ position: 'relative', width: '640px', maxWidth: '100%', background: '#000' }}>
        <video
          ref={videoRef}
          controls
          muted
          style={{ width: '100%', background: '#000', display: 'block' }}
        />
        <Scoreboard />
        <button
          onClick={handleFullscreen}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10,
            padding: '4px 10px',
            fontSize: '12px',
          }}
        >
          Fullscreen
        </button>
      </div>

      <hr style={{ margin: '2rem 0' }} />

      <h3>Push to YouTube</h3>
      <div style={{ marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="rtmp://a.rtmp.youtube.com/live2"
          value={rtmpUrl}
          onChange={(e) => setRtmpUrl(e.target.value)}
          style={{ width: '400px', padding: '0.5rem', marginRight: '0.5rem' }}
        />
      </div>
      <div style={{ marginBottom: '0.5rem' }}>
        <input
          type="text"
          placeholder="YouTube stream key"
          value={streamKey}
          onChange={(e) => setStreamKey(e.target.value)}
          style={{ width: '400px', padding: '0.5rem', marginRight: '0.5rem' }}
        />
      </div>
      <button onClick={handleStartStreaming} style={{ padding: '0.5rem 1rem', marginRight: '0.5rem' }}>
        Start Streaming
      </button>
      <button onClick={handleStopStreaming} style={{ padding: '0.5rem 1rem' }}>
        Stop Streaming
      </button>

      <p>RTMP Status: {rtmpStatus}</p>
    </div>
  );
}

export default App;