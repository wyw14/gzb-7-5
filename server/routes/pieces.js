const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readJSON, writeJSON } = require('../utils/storage');

const router = express.Router();

router.get('/', (req, res) => {
  const pieces = readJSON('pieces.json', []);
  const users = readJSON('users.json', []);
  const { instrument, difficulty, style, userId, keyword } = req.query;

  let result = pieces;

  if (instrument) {
    result = result.filter(p => p.instrument === instrument);
  }
  if (difficulty) {
    result = result.filter(p => p.difficulty === difficulty);
  }
  if (style) {
    result = result.filter(p => p.style === style);
  }
  if (userId) {
    result = result.filter(p => p.userId === userId);
  }
  if (keyword) {
    const kw = keyword.toLowerCase();
    result = result.filter(p =>
      p.title.toLowerCase().includes(kw) ||
      p.composer.toLowerCase().includes(kw) ||
      p.instrument.toLowerCase().includes(kw) ||
      p.painPoints.toLowerCase().includes(kw) ||
      p.lookingFor.toLowerCase().includes(kw)
    );
  }

  const resultWithUser = result.map(piece => ({
    ...piece,
    user: users.find(u => u.id === piece.userId) || null
  }));

  resultWithUser.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(resultWithUser);
});

router.get('/:id', (req, res) => {
  const pieces = readJSON('pieces.json', []);
  const users = readJSON('users.json', []);
  const piece = pieces.find(p => p.id === req.params.id);

  if (!piece) {
    return res.status(404).json({ error: '曲目不存在' });
  }

  const buddies = pieces
    .filter(p => p.title === piece.title && p.userId !== piece.userId)
    .map(p => ({
      ...p,
      user: users.find(u => u.id === p.userId) || null
    }));

  const result = {
    ...piece,
    user: users.find(u => u.id === piece.userId) || null,
    buddies
  };

  res.json(result);
});

router.post('/', (req, res) => {
  const pieces = readJSON('pieces.json', []);
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(401).json({ error: '请先登录' });
  }

  const { title, composer, instrument, difficulty, style, painPoints, lookingFor, progress } = req.body;

  if (!title || !instrument || !difficulty || !style) {
    return res.status(400).json({ error: '请填写完整信息' });
  }

  const newPiece = {
    id: 'p' + uuidv4().slice(0, 8),
    userId,
    title,
    composer: composer || '',
    instrument,
    difficulty,
    style,
    painPoints: painPoints || '',
    lookingFor: lookingFor || '',
    practiceDays: 1,
    progress: progress || 0,
    createdAt: new Date().toISOString()
  };

  pieces.push(newPiece);
  writeJSON('pieces.json', pieces);

  res.json({ success: true, piece: newPiece });
});

router.put('/:id', (req, res) => {
  const pieces = readJSON('pieces.json', []);
  const userId = req.headers['x-user-id'];
  const idx = pieces.findIndex(p => p.id === req.params.id);

  if (idx === -1) {
    return res.status(404).json({ error: '曲目不存在' });
  }

  if (pieces[idx].userId !== userId) {
    return res.status(403).json({ error: '无权限修改' });
  }

  pieces[idx] = { ...pieces[idx], ...req.body, id: pieces[idx].id, userId: pieces[idx].userId };
  writeJSON('pieces.json', pieces);

  res.json({ success: true, piece: pieces[idx] });
});

router.delete('/:id', (req, res) => {
  const pieces = readJSON('pieces.json', []);
  const userId = req.headers['x-user-id'];
  const piece = pieces.find(p => p.id === req.params.id);

  if (!piece) {
    return res.status(404).json({ error: '曲目不存在' });
  }

  if (piece.userId !== userId) {
    return res.status(403).json({ error: '无权限删除' });
  }

  const filtered = pieces.filter(p => p.id !== req.params.id);
  writeJSON('pieces.json', filtered);

  res.json({ success: true });
});

module.exports = router;
