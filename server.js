const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'renderer')));

// API routes
app.get('/api/records', (req, res) => {
  const { search, category, tag } = req.query;
  res.json(db.listRecords({
    search: search || undefined,
    category: category || undefined,
    tag: tag || undefined,
  }));
});

app.get('/api/records/:id', (req, res) => {
  const record = db.getRecord(Number(req.params.id));
  if (!record) return res.status(404).json({ error: 'not found' });
  res.json(record);
});

app.post('/api/records', (req, res) => {
  const { title, content, category, tags, record_date } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'title is required' });
  const id = db.createRecord({ title: title.trim(), content, category, tags, record_date });
  res.status(201).json({ id: Number(id) });
});

app.put('/api/records/:id', (req, res) => {
  const ok = db.updateRecord(Number(req.params.id), req.body);
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

app.delete('/api/records/:id', (req, res) => {
  const ok = db.deleteRecord(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'not found' });
  res.json({ ok: true });
});

app.get('/api/stats', (req, res) => {
  res.json(db.getStats());
});

app.get('/api/export/json', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="grad-journal-export.json"');
  res.type('application/json').send(db.exportJson());
});

app.get('/api/export/markdown', (req, res) => {
  res.setHeader('Content-Disposition', 'attachment; filename="grad-journal-export.md"');
  res.type('text/markdown').send(db.exportMarkdown());
});

app.get('/api/categories', (req, res) => {
  res.json(db.CATEGORIES);
});

// For standalone dev mode
if (require.main === module) {
  db.initDb().then(() => {
    const port = 3000;
    app.listen(port, () => {
      console.log(`研究生工作记录 - http://localhost:${port}`);
    });
  });
}

module.exports = app;
