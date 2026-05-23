const REPO = 'Krembovan/BankSimulator';

export function openReportIssue(text: string) {
  const title = encodeURIComponent(`🐛 Баг: ${text.slice(0, 60)}${text.length > 60 ? '...' : ''}`);
  const body = encodeURIComponent(`## Жалоба от пользователя\n\n${text}\n\n---\n*Отправлено из игры*`);
  window.open(`https://github.com/${REPO}/issues/new?labels=bug&title=${title}&body=${body}`, '_blank');
}
