import './ChoiceModal.css';
import type { ChoiceOption } from '../types';

interface ChoiceModalProps {
  title: string;
  message: string;
  options: ChoiceOption[];
  onChoose: (action: string) => void;
}

export default function ChoiceModal({ title, message, options, onChoose }: ChoiceModalProps) {
  return (
    <div className="choice-overlay">
      <div className="choice-card">
        <div className="choice-title">{title}</div>
        <div className="choice-message">{message}</div>
        <div className="choice-options">
          {options.map((opt, i) => (
            <button key={i} className="choice-btn" onClick={() => onChoose(opt.action)}>
              <span className="choice-btn-icon">{opt.icon}</span>
              <span className="choice-btn-label">{opt.label}</span>
              <span className="choice-btn-consequence">{opt.consequence}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
