import StandingsTable from "../components/StandingsTable";
import React, { useEffect, useState, useCallback } from "react";

export const TournamentInfoPage = () => {
    const [standings, setStandings] = useState([]);
    const [participants, setParticipants] = useState([]);

    // Мемоизированная функция для обновления данных
    const updateStandings = useCallback(() => {
        const savedStandings = localStorage.getItem('tournamentStandings');
        const savedParticipants = localStorage.getItem('tournamentParticipants');

        if (savedStandings) {
            setStandings(JSON.parse(savedStandings));
        }
        if (savedParticipants) {
            setParticipants(JSON.parse(savedParticipants));
        }
    }, []);

    useEffect(() => {
        // Первоначальная загрузка данных
        updateStandings();

        // Установка интервала с сохранением его ID
        const intervalId = setInterval(updateStandings, 1000);

        // Очистка интервала при размонтировании компонента
        return () => clearInterval(intervalId);
    }, [updateStandings]); // Зависимость - мемоизированная функция

    return (
        <div className="standings-section">
            <h2>Турнирная таблица</h2>
            <StandingsTable
                standings={standings}
                participants={participants}
                highlightTop={3}
                showTiebreakers={true}
            />
        </div>
    );
};
