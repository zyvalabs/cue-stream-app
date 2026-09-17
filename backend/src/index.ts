import express from 'express';
import cors from 'cors';
import path from 'path';
import streamRoutes from './routes/stream';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/streams', express.static(path.join(__dirname, '..', 'public', 'streams')));

app.use('/api/stream', streamRoutes);

app.get('/', (req, res) => {
  res.send('Cue Stream backend is running');
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});