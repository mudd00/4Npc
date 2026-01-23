import dotenv from 'dotenv';
import path from 'path';

// 루트 .env 파일 로드 - 다른 모듈 import 전에 먼저 실행
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import express from 'express';
import cors from 'cors';
import chatRouter from './routes/chat';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api', chatRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 프로덕션: 클라이언트 정적 파일 서빙
const clientDistPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

// SPA 폴백 - API가 아닌 모든 요청은 index.html로
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
