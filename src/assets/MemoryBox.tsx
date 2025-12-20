// src/assets/MemoryBox.tsx
import React, { useState, useEffect } from "react";
import type { SavedNote } from "../App"; // Import the type from App

interface MemoryBoxProps {
  onClose: () => void;
  isMorning: boolean;
}

const MemoryBox: React.FC<MemoryBoxProps> = ({ onClose, isMorning }) => {
  const [notes, setNotes] = useState<SavedNote[]>([]);

  useEffect(() => {
    const savedNotes: SavedNote[] = JSON.parse(
      localStorage.getItem("savedNotes") || "[]"
    );
    setNotes(savedNotes);
  }, []);

  // Set dynamic colors for both elements
  const titleColorClass = isMorning ? "text-pink-500" : "text-red-500";
  const dateColorClass = isMorning ? "text-pink-600" : "text-red-500";

  return (
    <div className="memory-box-container">
      <div className="memory-box-header">
        {/* UPDATED: Apply the dynamic title class */}
        <h2 className={`memory-box-title ${titleColorClass}`}>
          Your Saved Notes
        </h2>
        <button onClick={onClose} className="close-button">
          &times;
        </button>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <p className="empty-message">You haven't saved any notes yet. 🤍</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <p className="note-text">"{note.text}"</p>
              <span className={`note-date ${dateColorClass}`}>{note.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MemoryBox;
