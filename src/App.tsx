import { useState, useEffect, useCallback } from 'react';
import './App.css';
import type { GameState } from './types';
import { createInitialState, saveGame, loadGame, deleteSave } from './game/save';
import { advanceDay } from './game/engine';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Bank from './components/Bank';
import Stocks from './components/Stocks';
import RealEstate from './components/RealEstate';
import Vehicles from './components/Vehicles';
import Business from './components/Business';
import Profile from './components/Profile';
import Crypto from './components/Crypto';
import Shadow from './components/Shadow';
import EventModal from './components/EventModal';
import Tutorial from './components/Tutorial';

export default function App() {
  const [state, setState] = useState<GameState | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [hasSave, setHasSave] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const saved = loadGame();
    setHasSave(saved !== null);
    if (saved) {
      setState(saved);
    }
  }, []);

  useEffect(() => {
    if (state) {
      saveGame(state);
    }
  }, [state]);

  const handleAdvanceDay = useCallback(() => {
    setState(prev => prev ? advanceDay(prev) : prev);
  }, []);

  const handleNewGame = () => {
    console.log('handleNewGame called');
    const fresh = createInitialState();
    console.log('fresh state day:', fresh.day);
    setState(fresh);
    deleteSave();
    setHasSave(false);
    setShowTutorial(true);
    console.log('showTutorial set to true');
  };

  const handleLoadGame = () => {
    const saved = loadGame();
    if (saved) {
      setState(saved);
      if (saved.day === 1) {
        setShowTutorial(true);
      }
    }
  };

  const handleDismissEvent = useCallback(() => {
    setState(prev => prev ? { ...prev, showEvent: false } : prev);
  }, []);

  const handleCloseTutorial = useCallback(() => {
    setShowTutorial(false);
  }, []);

  if (!state) {
    return (
      <div className="new-game-overlay">
        <div className="new-game-card">
          <div className="ng-logo">🏦</div>
          <h1>Bank Simulator</h1>
          <p className="ng-subtitle">Стройте свою финансовую империю с нуля.<br />Зарабатывайте, копите, инвестируйте!</p>
          <div className="features">
            <div className="feature"><span className="f-icon">💼</span><span className="f-label">Career</span></div>
            <div className="feature"><span className="f-icon">🏦</span><span className="f-label">Banking</span></div>
            <div className="feature"><span className="f-icon">📈</span><span className="f-label">Stocks</span></div>
            <div className="feature"><span className="f-icon">🏠</span><span className="f-label">Real Estate</span></div>
            <div className="feature"><span className="f-icon">🚗</span><span className="f-label">Vehicles</span></div>
            <div className="feature"><span className="f-icon">🏪</span><span className="f-label">Business</span></div>
          </div>
          <button className="start-btn" onClick={handleNewGame}>▶ Новая игра</button>
          {hasSave && (
            <>
              <div className="ng-divider" />
              <button className="load-btn" onClick={handleLoadGame}>📂 Продолжить игру</button>
            </>
          )}
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard state={state} onAdvanceDay={handleAdvanceDay} />;
      case 'bank': return <Bank state={state} setState={setState} />;
      case 'stocks': return <Stocks state={state} setState={setState} />;
      case 'realestate': return <RealEstate state={state} setState={setState} />;
      case 'vehicles': return <Vehicles state={state} setState={setState} />;
      case 'crypto': return <Crypto state={state} setState={setState} />;
      case 'business': return <Business state={state} setState={setState} />;
      case 'shadow': return <Shadow state={state} setState={setState} />;
      case 'profile': return <Profile state={state} setState={setState} />;
      default: return <Dashboard state={state} onAdvanceDay={handleAdvanceDay} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar state={state} activeTab={activeTab} onTabChange={setActiveTab} onRestart={handleNewGame} onShowTutorial={() => setShowTutorial(true)} />
      <div className="app-content">
        {renderContent()}
      </div>
      {state.showEvent && (
        <EventModal key={state.eventMessage + state.day} message={state.eventMessage} type={state.eventType} onClose={handleDismissEvent} />
      )}
      {showTutorial && <Tutorial onClose={handleCloseTutorial} />}
    </div>
  );
}
