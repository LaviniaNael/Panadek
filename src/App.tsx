// src/App.tsx
import React, { useState, useEffect } from "react";
import ScratchCard from "./assets/ScratchCard";

import { morningMessages, nightMessages } from "./assets/messages";
import VoucherBook from "./assets/VoucherBook"

// Define the shape of a saved note
export type SavedNote = {
  id: number;
  text: string;
  date: string;
};

const App: React.FC = () => {
  const [isMorning, setIsMorning] = useState<boolean>(true);
  const [todaysMessage, setTodaysMessage] = useState<string>("");
  const [points, setPoints] = useState<number>(0);
  const [view, setView] = useState<'card' | 'memory' | 'vouchers'>('card');


  useEffect(() => {
    const hour = new Date().getHours();
    const currentlyMorning = hour >= 5 && hour < 17;
    setIsMorning(currentlyMorning);

    const messagesList = currentlyMorning ? morningMessages : nightMessages;
    if (messagesList.length > 0) {
      const randomIndex = Math.floor(Math.random() * messagesList.length);
      setTodaysMessage(messagesList[randomIndex]);
    }
  }, []);
  // NEW: Logic to award points (Max 2 per day)
  const handleCardReveal = () => {
    const today = new Date().toLocaleDateString();
    // Unique key for this specific slot (e.g. "12/20/2025-morning")
    const sessionKey = `${today}-${isMorning ? 'morning' : 'night'}`;

    const awardedSessions = JSON.parse(localStorage.getItem('awardedSessions') || '[]');

    // If he hasn't earned points for this specific session yet...
    if (!awardedSessions.includes(sessionKey)) {
      const newPoints = points + 1;
      setPoints(newPoints);
      localStorage.setItem('lovePoints', newPoints.toString());

      awardedSessions.push(sessionKey);
      localStorage.setItem('awardedSessions', JSON.stringify(awardedSessions));

      setTimeout(() => alert("You earned 1 Love Point! ❤️"), 500);
    }
  };

  const handleDeductPoints = (amount: number) => {
    const newPoints = points - amount;
    setPoints(newPoints);
    localStorage.setItem('lovePoints', newPoints.toString());
  };
  // UPDATED: Function to save a note to localStorage
  const handleSaveNote = (message: string) => {
    // Get existing notes (or empty array)
    const existingNotes: SavedNote[] = JSON.parse(
      localStorage.getItem("savedNotes") || "[]"
    );

    // NEW: Check for duplicates
    const isDuplicate = existingNotes.some((note) => note.text === message);

    if (isDuplicate) {
      // Show your cute message!
      alert("u already have this one saved baby");
      return; // Stop the function here
    }

    // If not a duplicate, proceed with saving
    const newNote: SavedNote = {
      id: Date.now(),
      text: message,
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    };

    const updatedNotes = [newNote, ...existingNotes];
    localStorage.setItem("savedNotes", JSON.stringify(updatedNotes));

    alert("Note saved to your Memory Box! 🤍");
  };

  return (
    <div
      className={`app-container ${isMorning ? "theme-morning" : "theme-night"}`}
    >
      <header className="app-header">
        <h1 className="header-title">
          {isMorning ? "Morning, Panadek." : "Good evening, Panadek."}
        </h1>
        {/* NEW: Points Badge */}
        <div
          onClick={() => setView('vouchers')}
          className={`cursor-pointer inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mt-2
                ${isMorning ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}
        >
          <span>💎 {points} Love Points</span>
        </div>
        <p className="header-subtitle">
          <span className="heart-icon">♥</span>
          {isMorning ? "Start your day with me." : "End your day with love."}
          <span className="heart-icon">♥</span>
        </p>
        {/* 🛠️ TEMPORARY DEBUG TOOLS (Delete this block before sending to him!) */}
        
        {/* <div className="fixed bottom-4 left-4 flex flex-col gap-2 z-50 opacity-70 hover:opacity-100">

          <button
            onClick={() => {
              const newPoints = points + 50;
              setPoints(newPoints);
              localStorage.setItem('lovePoints', newPoints.toString());
            }}
            className="bg-blue-600 text-white text-[10px] font-bold px-3 py-2 rounded shadow-lg"
          >
            CHEAT: +50 Points 💎
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('awardedSessions');
              alert('Daily limit reset! You can scratch again to earn points.');
              // Reload to reset the scratch card state
              window.location.reload();
            }}
            className="bg-purple-600 text-white text-[10px] font-bold px-3 py-2 rounded shadow-lg"
          >
            CHEAT: Reset Daily Limit 🔄
          </button>

          <button
            onClick={() => {
              localStorage.removeItem('redeemedVouchers');
              alert('Inventory cleared.');
              window.location.reload();
            }}
            className="bg-red-600 text-white text-[10px] font-bold px-3 py-2 rounded shadow-lg"
          >
            CHEAT: Clear Inventory 🗑️
          </button>

        </div> */}
      </header>

      <main className="main-content">
        {view === "card" && (
          <ScratchCard
            isMorning={isMorning}
            message={todaysMessage}
            onSave={handleSaveNote}
            onReveal={handleCardReveal}
          />
        )}

        {view === "memory" && (
          <VoucherBook
            onClose={() => setView("card")}
            points={points}
            deductPoints={handleDeductPoints}
            isMorning={isMorning}
            initialTab="notes"
          />
        )}

        {view === 'vouchers' && (
          <VoucherBook
            onClose={() => setView('card')}
            points={points}
            deductPoints={handleDeductPoints}
            isMorning={isMorning}
            initialTab="shop"
          />
        )}
      </main>

      <footer className="app-footer">
        {view === "card" && (
          <button
            className="memory-box-button"
            onClick={() => setView("memory")}
          >
            View Memory Box 📦
          </button>
        )}
        <div className="mt-4">
          For my baby{" "}
          <span className={isMorning ? "text-zinc-200" : "text-red-500"}>
            {" "}
            ♥
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
