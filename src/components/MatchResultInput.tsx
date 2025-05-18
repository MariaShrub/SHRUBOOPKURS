import { useState, useEffect } from 'react';
import React from 'react';

interface MatchResultInputProps {
    matchId: string;
    onResultSubmit: (matchId: string, result: MatchResult[]) => void;
    allowDraws?: boolean;
    matchesPerRound?: number;
}

export interface MatchResult {
    matchNumber: number;
    result: 'player1' | 'player2' | 'draw';
}

const MatchResultInput = ({
    matchId,
    onResultSubmit,
    allowDraws = true,
    matchesPerRound = 1
}: MatchResultInputProps) => {
    const [results, setResults] = useState<MatchResult[]>([]);

    const handleResultChange = (matchNumber: number, result: 'player1' | 'player2' | 'draw') => {
        setResults(prev => {
            const newResults = [...prev];
            const existingIndex = newResults.findIndex(r => r.matchNumber === matchNumber);
            
            if (existingIndex >= 0) {
                newResults[existingIndex] = { matchNumber, result };
            } else {
                newResults.push({ matchNumber, result });
            }
            
            return newResults;
        });
    };

    // Автоматически отправляем результаты, когда все матчи заполнены
    useEffect(() => {
        if (results.length === matchesPerRound) {
            onResultSubmit(matchId, results);
        }
    }, [results, matchId, onResultSubmit, matchesPerRound]);

    return (
        <div className="match-result-input">
            <h4 className="input-title">Укажите результат матча:</h4>
            
            {Array.from({ length: matchesPerRound }).map((_, i) => (
                <div key={i} className="match-game">
                    <div className="game-title">Партия {i + 1}</div>
                    <div className="game-options">
                        <label className="game-option">
                            <input
                                type="radio"
                                name={`${matchId}-game-${i}`}
                                checked={results.some(r => r.matchNumber === i && r.result === 'player1')}
                                onChange={() => handleResultChange(i, 'player1')}
                            />
                            <span>Победа 1-го игрока</span>
                        </label>
                        
                        <label className="game-option">
                            <input
                                type="radio"
                                name={`${matchId}-game-${i}`}
                                checked={results.some(r => r.matchNumber === i && r.result === 'player2')}
                                onChange={() => handleResultChange(i, 'player2')}
                            />
                            <span>Победа 2-го игрока</span>
                        </label>
                        
                        {allowDraws && (
                            <label className="game-option">
                                <input
                                    type="radio"
                                    name={`${matchId}-game-${i}`}
                                    checked={results.some(r => r.matchNumber === i && r.result === 'draw')}
                                    onChange={() => handleResultChange(i, 'draw')}
                                />
                                <span>Ничья</span>
                            </label>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default MatchResultInput;