import { useEffect } from 'react';
import './EventModal.css';

interface EventModalProps {
  message: string;
  type: 'good' | 'bad' | 'info';
  onClose: () => void;
}

export default function EventModal({ message, type, onClose }: EventModalProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  const icons = { good: '🎉', bad: '😬', info: 'ℹ️' };

  return (
    <div className={`toast toast-${type}`}>
      <span className="toast-icon">{icons[type]}</span>
      <span className="toast-msg">{message}</span>
    </div>
  );
}
