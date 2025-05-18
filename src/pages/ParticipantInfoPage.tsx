import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Match, Participant, Standing } from "../types.js";
import React from 'react';

export const ParticipantInfoPage = () => {
    const playerId = useParams()?.id as string;
    const [standings, setStandings] = useState<Standing[]>([]);
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);

    const getParticipantById = (id: string | null) => {
        return id ? participants.find(p => p.id === id) : undefined;
    }

    const player = useMemo(() => {
        return getParticipantById(playerId)
    }, [playerId, participants]);

    const playerMatches = useMemo(() => {
        return matches.filter(m => m.player1 === playerId || m.player2 === playerId)
            .filter(m => !!m.result?.winner);
    }, [matches, playerId]);

    // Функция для обновления данных
    const updateStandings = () => {
        const savedStandings = localStorage.getItem('tournamentStandings');
        const savedParticipants = localStorage.getItem('tournamentParticipants');
        const savedMatches = localStorage.getItem('tournamentMatches');

        if (savedStandings) setStandings(JSON.parse(savedStandings));
        if (savedParticipants) setParticipants(JSON.parse(savedParticipants));
        if (savedMatches) setMatches(JSON.parse(savedMatches));
    }

    // Загружаем данные при монтировании
    useEffect(() => {
        updateStandings();

        // Устанавливаем интервал с сохранением ID
        const intervalId = setInterval(updateStandings, 1000);

        // Очищаем интервал при размонтировании
        return () => clearInterval(intervalId);
    }, []); // Пустой массив зависимостей - эффект выполняется только при монтировании

    if (!player) return <h1>Участник не найден</h1>;

    const getMatchTitle = (m: Match) => {
        const bracket = m.bracket;
        let bracketTitle = '';

        switch (bracket) {
            case "lower": bracketTitle = 'Нижняя сетка'; break;
            case "upper": bracketTitle = 'Верхняя сетка'; break;
            case "final": bracketTitle = 'Финал'; break;
            default: break;
        }

        return `${bracketTitle} - Раунд ${m.round}`;
    }

    return (
        <div className="participant-info-page">
            <h1>Информация о участнике {player.firstName} ({player.rating} elo)</h1>
            <h2>Текущая позиция в рейтинге: {standings.findIndex(p => p.participantId === player.id) + 1}</h2>

            <h2>Завершенные партии</h2>
            {playerMatches.map(m => (
                <div key={m.id} className="participant-match-info">
                    <h3>{getMatchTitle(m)}</h3>
                    <p>Результат: {player.id === m.player1 ?
                        (m.result?.winner === 'player1' ? 'Победа' : 'Поражение') :
                        (m.result?.winner === 'player2' ? 'Победа' : 'Поражение')}
                    </p>
                    <p>Оппонент: {player.id === m.player1 ?
                        getParticipantById(m.player2)?.firstName :
                        getParticipantById(m.player1)?.firstName}
                    </p>
                </div>
            ))}
        </div>
    );
};
