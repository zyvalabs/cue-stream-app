import NodeMediaServer from 'node-media-server';

const config = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8000,
    allow_origin: '*',
  },
};

export function startMediaServer() {
  const nms = new NodeMediaServer(config);
  nms.run();
  console.log('RTMP ingest server running on port 1935 (HTTP on 8000)');
}