import React, { useState } from 'react';

export default function FlashcardsDisplay({ content }) {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!content) return null;

  // Parse the flashcards content (Q: ... A: ... separated by ---)
  // Parse the flashcards content
  // First, try JSON parsing
  let cards = [];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed)) {
      cards = parsed.filter(c => c.question && c.answer);
    }
  } catch (e) {
    // console.log("Not JSON, falling back to text parsing");
  }

  // If JSON parsing failed, try text parsing (Q: ... A: ... separated by ---)
  if (cards.length === 0) {
    cards = content.split('---').map(card => {
      const lines = card.trim().split('\n');
      const question = lines.find(l => l.trim().startsWith('Q:'))?.replace(/^Q:\s*/i,'').trim() || '';
      const answer = lines.find(l => l.trim().startsWith('A:'))?.replace(/^A:\s*/i,'').trim() || '';
      return { question, answer };
    }).filter(c => c.question && c.answer);
  }

  if (cards.length === 0) {
    return <div className="text-gray-500">No flashcards generated yet.</div>;
  }

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Flashcard */}
      {/* Flashcard */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative bg-white rounded-2xl shadow-xl p-8 min-h-[300px] cursor-pointer transform transition-all duration-500 hover:scale-105"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-white rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="text-sm font-semibold text-purple-600 mb-4">QUESTION</div>
          <div className="text-xl text-center font-medium">{cards[currentCard].question}</div>
          <div className="text-sm text-gray-400 mt-6">Click to flip</div>
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-purple-50 rounded-2xl"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="text-sm font-semibold text-purple-600 mb-4">ANSWER</div>
          <div className="text-lg text-center">{cards[currentCard].answer}</div>
          <div className="text-sm text-gray-400 mt-6">Click to flip back</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevCard}
          disabled={cards.length <= 1}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          ← Previous
        </button>

        <div className="text-gray-600 font-semibold">
          {currentCard + 1} / {cards.length}
        </div>

        <button
          onClick={nextCard}
          disabled={cards.length <= 1}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
