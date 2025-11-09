import React, { useState, useEffect } from "react";
import ScratchCard from "./assets/ScratchCard";
import { morningMessages, nightMessages } from "./assets/messages";

const App: React.FC = () => {
  const [isMorning, setIsMorning] = useState<boolean>(true);
  const [todaysMessage, setTodaysMessage] = useState<string>("");

  useEffect(() => {
    const hour = new Date().getHours();
    const currentlyMorning = hour >= 5 && hour < 17;
    setIsMorning(currentlyMorning);

    const messagesList = currentlyMorning ? morningMessages : nightMessages;
    // Safety check if list is empty
    if (messagesList.length > 0) {
      const randomIndex = Math.floor(Math.random() * messagesList.length);
      setTodaysMessage(messagesList[randomIndex]);
    }
  }, []);

  return (
    // We apply the theme class here, and CSS handles the rest
    <div
      className={`app-container ${isMorning ? "theme-morning" : "theme-night"}`}
    >
      <header className="app-header">
        <h1 className="header-title">
          {isMorning ? "Morning, Panadek." : "Good evening, Panadek."}
        </h1>
        <p className="header-subtitle">
          <span className="heart-icon">♥</span>
          {isMorning ? "Start your day with me." : "End your day with love."}
          <span className="heart-icon">♥</span>
        </p>
      </header>

      <main className="main-content">
        <ScratchCard isMorning={isMorning}>
          <div className="message-container">
            <span className="message-icon">{isMorning ? "🌸" : "🌹"}</span>
            <p className="message-text">"{todaysMessage}"</p>
          </div>
        </ScratchCard>
      </main>

      <footer className="app-footer">For my baby ❤️</footer>
    </div>
  );
};

export default App;
