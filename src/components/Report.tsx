import { useState } from 'react';
import './Report.css';
import { openReportIssue } from '../game/report';

export default function Report() {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    const t = text.trim();
    if (!t) return;
    openReportIssue(t);
    setText('');
  };

  return (
    <div className="report-view">
      <h2 className="gradient-text" style={{ fontSize: 22, fontWeight: 800 }}>🐛 Репорт</h2>

      <div className="card report-card">
        <span className="section-title">Сообщить о баге</span>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '8px 0' }}>
          Нашли ошибку? Опишите её и нажмите «Отправить» — откроется GitHub с предзаполненной формой.<br />
          Нажмите <strong>Submit new issue</strong> — я увижу и починю.
        </p>
        <textarea
          className="report-textarea"
          placeholder="Опишите проблему как можно подробнее..."
          rows={6}
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!text.trim()}
          >
            Отправить
          </button>
        </div>
      </div>

      <div className="card" style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
        💡 Скажи <strong>«проверь репорты»</strong> — я посмотрю новые issues и исправлю.
      </div>
    </div>
  );
}
