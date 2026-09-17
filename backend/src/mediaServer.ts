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
    mediaroot: './media',
    allow_origin: '*',
  },
  trans: {
    ffmpeg: '/usr/bin/ffmpeg',
    tasks: [
      {
        app: 'live',
        hls: true,
        hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
      },
    ],
  },
};

export function startMediaServer() {
  const nms = new NodeMediaServer(config);

  nms.on('prePublish', (id: string, StreamPath: string, args: object) => {
    console.log('[NMS] prePublish', id, StreamPath, args);
  });

  nms.on('postPublish', (id: string, StreamPath: string, args: object) => {
    console.log('[NMS] postPublish', id, StreamPath, args);
  });

  nms.on('donePublish', (id: string, StreamPath: string, args: object) => {
    console.log('[NMS] donePublish', id, StreamPath, args);
  });

  nms.run();
  console.log('RTMP ingest server running on port 1935 (HTTP on 8000)');
}