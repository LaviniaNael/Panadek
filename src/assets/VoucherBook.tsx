import React, { useState, useEffect } from 'react';

export type Voucher = {
  id: string;
  title: string;
  cost: number;
  icon: string;
  description: string;
};

export type UsedVoucher = {
  instanceId: number;
  title: string;
  icon: string;
  date: string;
  note: string;
};

export type SavedNote = {
  id: number;
  text: string;
  date: string;
};

const AVAILABLE_VOUCHERS: Voucher[] = [
  { id: 'v1', title: 'Instant Selfie', cost: 5, icon: '📸', description: 'Redeem for a cute selfie right now.' },
    { id: 'v2', title: 'Head Scratchies', cost: 8, icon: '💆‍♂️', description: '10 minutes of pure bliss.' },
    { id: 'v3', title: '1 Free Massage', cost: 10, icon: '💆‍♂️', description: 'Good for 30 mins of relaxation.' },
    { id: 'v4', title: '100 Kisses', cost: 12, icon: '💋', description: 'Payable immediately upon seeing me.' },
    { id: 'v5', title: 'Movie Choice', cost: 15, icon: '🎬', description: 'You pick the movie tonight.' },
    { id: 'v6', title: 'Skip 1 Argument', cost: 20, icon: '🏳️', description: 'Play this card to win instantly.' },
    { id: 'v7', title: 'Dream Date Idea', cost: 25, icon: '🍓', description: "Whenever you want, it's on me." },
    { id: 'v8', title: 'Home Cooked Meal', cost: 30, icon: '🍳', description: 'I make your absolute favorite.' },
    { id: 'v9', title: 'Get Out of Jail', cost: 35, icon: '🚫', description: 'Forgives one mistake instantly.' },
    { id: 'v10', title: 'The "Yes" Day', cost: 50, icon: '👑', description: 'I say YES to everything for 24h.' },
];

interface VoucherBookProps {
  onClose: () => void;
  points: number;
  deductPoints: (amount: number) => void;
  isMorning: boolean;
  initialTab?: 'notes' | 'shop'; // New prop to decide where to open
}

const VoucherBook: React.FC<VoucherBookProps> = ({ onClose, points, deductPoints, isMorning, initialTab = 'shop' }) => {
  const [redeemedIds, setRedeemedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<UsedVoucher[]>([]);
  const [notes, setNotes] = useState<SavedNote[]>([]);

  // Flip State Machine
  // 'notes-shop': Front=Notes, Back=Shop
  // 'shop-history': Front=Shop, Back=History
  const [bookMode, setBookMode] = useState<'notes-shop' | 'shop-history'>('shop-history');
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    // Load all data
    const savedRedeemed = JSON.parse(localStorage.getItem('redeemedVouchers') || '[]');
    setRedeemedIds(savedRedeemed);
    const savedHistory = JSON.parse(localStorage.getItem('usedVouchers') || '[]');
    setHistory(savedHistory);
    const savedNotes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
    setNotes(savedNotes);

    // Set initial page based on prop
    if (initialTab === 'notes') {
        setBookMode('notes-shop');
        setIsFlipped(false); // Shows Notes (Front)
    } else {
        setBookMode('shop-history');
        setIsFlipped(false); // Shows Shop (Front)
    }
  }, [initialTab]);

  // Navigation Logic
  const goToShopFromNotes = () => {
    setIsFlipped(true); // Flip to Back (Shop)
  };

  const goToNotesFromShop = () => {
    if (bookMode === 'notes-shop') {
        setIsFlipped(false); // Flip back to Front (Notes)
    } else {
        // We are in 'shop-history', Front is Shop.
        // 1. Switch to 'notes-shop', Set Flipped=True (Back is Shop). Instant visual swap.
        setBookMode('notes-shop');
        setIsFlipped(true);
        // 2. Timeout to allow render, then Flip to False (Front is Notes).
        setTimeout(() => setIsFlipped(false), 50);
    }
  };

  const goToHistoryFromShop = () => {
    if (bookMode === 'shop-history') {
        setIsFlipped(true); // Flip to Back (History)
    } else {
        // We are in 'notes-shop', Back is Shop.
        // 1. Switch to 'shop-history', Set Flipped=False (Front is Shop). Instant visual swap.
        setBookMode('shop-history');
        setIsFlipped(false);
        // 2. Timeout to allow render, then Flip to True (Back is History).
        setTimeout(() => setIsFlipped(true), 50);
    }
  };

  const goToShopFromHistory = () => {
    setIsFlipped(false); // Flip back to Front (Shop)
  };

  // Actions
  const handleBuy = (voucher: Voucher) => {
    if (points < voucher.cost) return;
    if (window.confirm(`Buy "${voucher.title}" for ${voucher.cost} points?`)) {
      deductPoints(voucher.cost);
      const newRedeemed = [...redeemedIds, voucher.id];
      setRedeemedIds(newRedeemed);
      localStorage.setItem('redeemedVouchers', JSON.stringify(newRedeemed));
      const count = newRedeemed.filter(id => id === voucher.id).length;
      alert(`Purchased! 🛍️\nYou now have ${count} of these.`);
    }
  };

  const handleUse = (voucher: Voucher) => {
    if (window.confirm(`Are you sure you want to use 1 "${voucher.title}" coupon now?`)) {
      alert(`✅ TICKET VALIDATED: "${voucher.title}"\n\nShow this screen to Lavinia to claim your reward!`);
      const userNote = window.prompt("Yay! 🎉 Reward claimed! How are you feeling right now? Add a note:", "") || "Just a happy moment.";
      const newList = [...redeemedIds];
      const index = newList.indexOf(voucher.id);
      if (index > -1) {
        newList.splice(index, 1);
        setRedeemedIds(newList);
        localStorage.setItem('redeemedVouchers', JSON.stringify(newList));
        const newHistoryItem: UsedVoucher = {
            instanceId: Date.now(),
            title: voucher.title,
            icon: voucher.icon,
            date: new Date().toLocaleString(),
            note: userNote
        };
        const newHistory = [newHistoryItem, ...history];
        setHistory(newHistory);
        localStorage.setItem('usedVouchers', JSON.stringify(newHistory));
      }
    }
  }

  const themeColor = isMorning ? 'text-pink-500' : 'text-red-500';
  const themeBg = isMorning ? 'bg-pink-600' : 'bg-red-600';
  const themeBorder = isMorning ? 'border-pink-500' : 'border-red-500';
  const themeHover = isMorning ? 'hover:bg-pink-700' : 'hover:bg-red-700';

  // --- RENDER HELPERS ---
  const renderSavedNotes = () => (
    <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="memory-box-header shrink-0 p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className={`memory-box-title ${themeColor}`}>Your Saved Notes</h2>
            <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
             {notes.length === 0 ? (
                <div className="text-center text-zinc-500 mt-20">
                    <p>No saved notes yet.</p>
                </div>
            ) : (
                notes.map((note) => (
                    <div key={note.id} className="bg-zinc-800 p-4 rounded-xl mb-3 border border-zinc-700">
                        <p className="text-zinc-100 text-sm mb-2">"{note.text}"</p>
                        <span className={`text-xs font-medium ${themeColor}`}>{note.date}</span>
                    </div>
                ))
            )}
        </div>
        <div className="p-3 border-t border-zinc-800 bg-zinc-900 shrink-0">
            <button onClick={goToShopFromNotes} className="w-full py-3 text-sm font-bold text-zinc-400 hover:text-white">
                Go to Shop ➡️
            </button>
        </div>
    </div>
  );

  const renderShop = () => (
    <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="memory-box-header shrink-0 p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className={`memory-box-title ${themeColor}`}>Grandmaster's Vouchers</h2>
            <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="p-4 text-center border-b border-zinc-800 shrink-0">
            <p className="text-zinc-400 text-sm">Current Love Points</p>
            <div className={`text-4xl font-bold ${themeColor} mt-1`}>{points}</div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-20">
            {AVAILABLE_VOUCHERS.map((voucher) => {
            const ownedCount = redeemedIds.filter(id => id === voucher.id).length;
            const canAfford = points >= voucher.cost;
            return (
                <div key={voucher.id} className={`bg-zinc-800 p-4 rounded-xl mb-4 border transition-all ${ownedCount > 0 ? themeBorder : 'border-zinc-700'}`}>
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">{voucher.icon}</span>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className={`font-bold ${ownedCount > 0 ? themeColor : 'text-zinc-200'}`}>{voucher.title}</h3>
                                {ownedCount > 0 && (
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold bg-zinc-900 ${themeColor} border ${themeBorder}`}>x{ownedCount}</span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-500">{voucher.description}</p>
                        </div>
                    </div>
                    <div className="text-sm font-mono text-zinc-400">{voucher.cost} pts</div>
                </div>
                <div className="flex flex-col gap-2 mt-3">
                    {ownedCount > 0 && (
                        <button onClick={() => handleUse(voucher)} className={`w-full py-3 rounded-lg text-sm font-bold border-2 border-dashed bg-transparent ${themeColor} ${themeBorder} hover:bg-zinc-900`}>
                            ⚡ Use 1 Coupon
                        </button>
                    )}
                    <button onClick={() => handleBuy(voucher)} disabled={!canAfford} className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${canAfford ? `${themeBg} text-white ${themeHover}` : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'}`}>
                        {canAfford ? (ownedCount > 0 ? 'Buy Another' : 'Buy Coupon') : 'Not Enough Points'}
                    </button>
                </div>
                </div>
            );
            })}
        </div>
        <div className="p-3 border-t border-zinc-800 bg-zinc-900 shrink-0 flex gap-2">
             <button onClick={goToNotesFromShop} className="flex-1 py-3 text-sm font-bold text-zinc-400 hover:text-white">
                ⬅️ Saved Notes
            </button>
            <button onClick={goToHistoryFromShop} className="flex-1 py-3 text-sm font-bold text-zinc-400 hover:text-white">
                View History 📜 ➡️
            </button>
        </div>
    </div>
  );

  const renderHistory = () => (
    <div className="flex flex-col h-full bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        <div className="memory-box-header shrink-0 p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className={`memory-box-title ${themeColor}`}>Used Coupons</h2>
            <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 pb-20">
            {history.length === 0 ? (
                <div className="text-center text-zinc-500 mt-20">
                    <p>No history yet.</p>
                </div>
            ) : (
                history.map(item => (
                    <div key={item.instanceId} className="bg-zinc-800 p-4 rounded-xl mb-4 border border-zinc-700">
                        <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{item.icon}</span>
                                <div>
                                    <h3 className="font-bold text-zinc-200">{item.title}</h3>
                                    <p className="text-xs text-zinc-500">{item.date}</p>
                                </div>
                            </div>
                        </div>
                        <div className="mt-3 p-3 bg-zinc-900 rounded-lg text-sm text-zinc-300 italic border border-zinc-800 relative">
                            <span className="absolute top-[-8px] left-2 bg-zinc-800 px-1 text-[10px] text-zinc-500">Note</span>
                            "{item.note}"
                        </div>
                    </div>
                ))
            )}
        </div>
        <div className="p-3 border-t border-zinc-800 bg-zinc-900 shrink-0">
            <button onClick={goToShopFromHistory} className="w-full py-3 text-sm font-bold text-zinc-400 hover:text-white">
                ⬅️ Back to Shop
            </button>
        </div>
    </div>
  );

  return (
    <div className="relative w-full max-w-[90vw] sm:max-w-sm h-[70vh] mx-auto [perspective:1000px] z-20">
      <div className={`relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
        
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden]">
            {bookMode === 'notes-shop' ? renderSavedNotes() : renderShop()}
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]">
            {bookMode === 'notes-shop' ? renderShop() : renderHistory()}
        </div>

      </div>
    </div>
  );
};

export default VoucherBook;