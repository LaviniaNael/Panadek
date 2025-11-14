// src/App.tsx
import React, { useState, useEffect } from "react";
import ScratchCard from "./assets/ScratchCard"; // Make sure this path is correct
import MemoryBox from "./assets/MemoryBox"; // Make sure this path is correct
import { morningMessages, nightMessages } from "./assets/messages";

// Define the shape of a saved note
export type SavedNote = {
  id: number;
  text: string;
  date: string;
};

const App: React.FC = () => {
  const [isMorning, setIsMorning] = useState<boolean>(true);
  const [todaysMessage, setTodaysMessage] = useState<string>("");
  const [view, setView] = useState<"card" | "memory">("card");

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
        <p className="header-subtitle">
          <span className="heart-icon">♥</span>
          {isMorning ? "Start your day with me." : "End your day with love."}
          <span className="heart-icon">♥</span>
        </p>
      </header>

      <main className="main-content">
        {view === "card" ? (
          <ScratchCard
            isMorning={isMorning}
            message={todaysMessage}
            onSave={handleSaveNote}
          />
        ) : (
          // UPDATED: Pass isMorning prop
          <MemoryBox onClose={() => setView("card")} isMorning={isMorning} />
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
        <div className="mt-4">For my baby ❤️</div>
      </footer>
    </div>
  );
};

export default App;
