import { Match, Participant, TiebreakerType } from '../types';
import MatchResultInput, { MatchResult } from './MatchResultInput';
import React from 'react';

interface CurrentRoundProps {
    round: number;
    matches: Match[];
    getParticipantById: (id: string | null) => Participant | undefined;
    onMatchResult: (matchId: string, result: MatchResult[]) => void;
    tiebreakerType: TiebreakerType;
    showBracketType?: boolean;
    matchesPerRound?: number;
}

const CurrentRound = ({
    round,
    matches,
    getParticipantById,
    onMatchResult,
    tiebreakerType,
    showBracketType = true,
    matchesPerRound = 1
}: CurrentRoundProps) => {
    const renderPlayerInfo = (participantId: string) => {
        const participant = getParticipantById(participantId);

        if (!participant)
            return <span className="unknown-player">Неизвестный участник</span>;

        return (
            <div className="player-info">
                <span className="player-name">
                    {participant.firstName} {participant.lastName}
                </span>
                {participant.rating > 0 && (
                    <span className="player-rating">{participant.rating}</span>
                )}
                {participant.isEmpty && (
                    <span className="empty-badge">[Пустой]</span>
                )}
            </div>
        );
    };

    const getMatchStatus = (match: Match) => {
        if (!match.result) return 'Ожидает результата';

        // Подсчет побед для каждого игрока
        const player1Wins = match.result.details?.filter(r => r.result === 'player1').length || 0;
        const player2Wins = match.result.details?.filter(r => r.result === 'player2').length || 0;
        const draws = match.result.details?.filter(r => r.result === 'draw').length || 0;

        const winner = getParticipantById(
            match.result.winner === 'player1' ? match.player1 : match.player2
        );

        return (
            <div className="match-result-details">
                <div>Победитель: {winner?.firstName} {winner?.lastName}</div>
                <div className="match-stats">
                    {player1Wins > 0 && <span>1-й: {player1Wins} побед</span>}
                    {player2Wins > 0 && <span>2-й: {player2Wins} побед</span>}
                    {draws > 0 && <span>Ничьих: {draws}</span>}
                </div>
            </div>
        );
    };

    return (
        <div className="current-round">
            <div className="round-header">
                <h3>
                    {showBracketType && (
                        <>
                            {matches[0]?.bracket === 'upper' && 'Верхняя сетка - '}
                            {matches[0]?.bracket === 'lower' && 'Нижняя сетка - '}
                        </>
                    )}
                    Раунд {round}
                </h3>
                <div className="tiebreaker-info">
                    Тайбрейк: {tiebreakerType === 'rating'
                    ? 'По рейтингу'
                    : tiebreakerType === 'buchholz'
                        ? 'Бухгольц'
                        : 'Бергер'}
                </div>
            </div>

            {matches.length === 0 ? (
                <div className="no-matches">Нет матчей в этом раунде</div>
            ) : (
                <div className="matches-list">
                    {matches.map(match => (
                        <div key={match.id} className={`match-card ${match.result ? 'completed' : ''}`}>
                            <div className="match-summary">
                                <div className="player player1">
                                    {renderPlayerInfo(match.player1)}
                                </div>
                                <div className="vs">vs</div>
                                <div className="player player2">
                                    {match.player2
                                        ? renderPlayerInfo(match.player2)
                                        : <span className="empty-player">[Пустой]</span>}
                                </div>
                            </div>

                            <div className="match-status">
                                {getMatchStatus(match)}
                            </div>

                            {!match.result && !match.player1.includes('empty') && !match.player2.includes('empty') && (
                                <MatchResultInput
                                    matchId={match.id}
                                    onResultSubmit={onMatchResult}
                                    allowDraws={matchesPerRound > 1}
                                    matchesPerRound={matchesPerRound}
                                />
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CurrentRound;