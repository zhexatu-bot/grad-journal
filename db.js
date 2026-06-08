const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const CATEGORIES = ['论文', '实验', '代码', '组会', '项目', '其他'];

let dbPath;
let db;
let saveTimer;

function scheduleSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(save, 500);
}

function save() {
  if (!db || !dbPath) return;
  const data = db.export();
  fs.writeFileSync(dbPath, Buffer.from(data));
}

async function initDb(customPath) {
  dbPath = customPath || path.join(__dirname, 'data.db');
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL DEFAULT '',
      category TEXT NOT NULL DEFAULT '其他',
      tags TEXT NOT NULL DEFAULT '',
      record_date TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);
  db.run('CREATE INDEX IF NOT EXISTS idx_records_category ON records(category)');
  db.run('CREATE INDEX IF NOT EXISTS idx_records_record_date ON records(record_date)');
  save();
  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

function now() {
  return new Date().toISOString().replace('T', ' ').slice(0, 19);
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function queryAll(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

function runSql(sql, params = []) {
  getDb().run(sql, params);
}

function getLastId() {
  return queryOne('SELECT last_insert_rowid() as id').id;
}

function listRecords({ search, category, tag } = {}) {
  let sql = 'SELECT * FROM records WHERE 1=1';
  const params = [];
  if (search) {
    sql += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (tag) {
    sql += ' AND tags LIKE ?';
    params.push(`%${tag}%`);
  }
  sql += ' ORDER BY record_date DESC, created_at DESC';
  return queryAll(sql, params);
}

function getRecord(id) {
  return queryOne('SELECT * FROM records WHERE id = ?', [id]);
}

function createRecord({ title, content = '', category = '其他', tags = '', record_date }) {
  const d = record_date || today();
  const n = now();
  runSql(
    'INSERT INTO records (title, content, category, tags, record_date, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [title, content, category, tags, d, n, n]
  );
  const id = getLastId();
  scheduleSave();
  return id;
}

function updateRecord(id, data) {
  const existing = getRecord(id);
  if (!existing) return false;
  const title = data.title ?? existing.title;
  const content = data.content ?? existing.content;
  const category = data.category ?? existing.category;
  const tags = data.tags ?? existing.tags;
  const record_date = data.record_date ?? existing.record_date;
  runSql(
    'UPDATE records SET title=?, content=?, category=?, tags=?, record_date=?, updated_at=? WHERE id=?',
    [title, content, category, tags, record_date, now(), id]
  );
  scheduleSave();
  return true;
}

function deleteRecord(id) {
  const existing = getRecord(id);
  if (!existing) return false;
  runSql('DELETE FROM records WHERE id = ?', [id]);
  scheduleSave();
  return true;
}

function getStats() {
  const total = queryOne('SELECT COUNT(*) as c FROM records').c;
  const byCategory = queryAll(
    'SELECT category, COUNT(*) as count FROM records GROUP BY category ORDER BY count DESC'
  );
  const byMonth = queryAll(
    "SELECT substr(record_date, 1, 7) as month, COUNT(*) as count FROM records GROUP BY month ORDER BY month DESC"
  );
  const allTags = queryAll('SELECT tags FROM records WHERE tags != ?  AND tags != ?', ['', '']);

  const tagCount = {};
  for (const row of allTags) {
    for (const t of row.tags.split(',')) {
      const trimmed = t.trim();
      if (trimmed) tagCount[trimmed] = (tagCount[trimmed] || 0) + 1;
    }
  }
  const tags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));

  return { total, by_category: byCategory, by_month: byMonth, tags };
}

function exportJson() {
  return JSON.stringify(listRecords(), null, 2);
}

function exportMarkdown() {
  const records = listRecords();
  const lines = ['# 研究生工作记录\n'];
  let currentMonth = null;
  for (const r of records) {
    const month = r.record_date.slice(0, 7);
    if (month !== currentMonth) {
      currentMonth = month;
      lines.push(`\n## ${month}\n`);
    }
    lines.push(`### ${r.record_date} ${r.title}`);
    lines.push(`**分类**: ${r.category}`);
    if (r.tags) lines.push(`**标签**: ${r.tags}`);
    lines.push('');
    lines.push(r.content);
    lines.push('\n---\n');
  }
  return lines.join('\n');
}

module.exports = {
  CATEGORIES, initDb, listRecords, getRecord, createRecord,
  updateRecord, deleteRecord, getStats, exportJson, exportMarkdown,
  save,
};
