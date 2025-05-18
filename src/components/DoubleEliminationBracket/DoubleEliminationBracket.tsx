import React from 'react';
import './DoubleEliminationBracket.css';
import { Match, Participant } from "../../types.js";
import { Link } from "react-router-dom";

type Props = {
    matches: Match[]; // Список всех матчей турнира
    getParticipantById: (s: string) => Participant | undefined; // Функция для получения участника по ID
};

// Функция для группировки матчей по раундам внутри заданной сетки (upper, lower или final)
const getRounds = (matches: Match[], bracket: string) => {
    // Фильтрация матчей по типу сетки
    const filtered = matches.filter((m) => m?.bracket === bracket);
    // Получение уникальных номеров раундов, сортировка по возрастанию
    const rounds = [...new Set(filtered.map((m) => m.round))].sort((a, b) => a - b);
    // Для каждого раунда возвращается список матчей, относящихся к этому раунду
    return rounds.map((round) =>
        filtered.filter((m) => m.round === round)
    );
};

// Основной компонент отображения сетки с двойным выбыванием
export const DoubleEliminationBracket = ({ matches, getParticipantById }: Props) => {
    // Упрощенная функция для получения имени участника по ID
    const getPlayerName = (id: string) => getParticipantById(id)?.firstName;

    // Определение доступных типов сеток (верхняя, нижняя, финал)
    const brackets = ["upper", "lower", "final"] as const;

    return (
        <div className="bracket-wrapper">
            {/* Отрисовка каждой сетки по очереди */}
            {brackets.map((bracket) => (
                <div key={bracket} className={`bracket-section ${bracket}`}>
                    {/* Заголовок сетки */}
                    <div className="bracket-title">
                        {bracket === "upper"
                            ? "Сетка чемпионов"
                            : bracket === "lower"
                                ? "Сетка выбывания"
                                : "Финал"}
                    </div>

                    <div className="bracket">
                        {/* Разделение сетки на раунды */}
                        {getRounds(matches, bracket).map((roundMatches, rIdx, rounds) => (
                            <div
                                key={rIdx}
                                className="round-column"
                                style={{
                                    // Отступ сверху и снизу увеличивается экспоненциально, чтобы визуально раунды располагались с нужными отступами
                                    padding: `${40 * 2 ** (rIdx)}px 0`,
                                    // Если матч только один — выравниваем по центру
                                    justifyContent: roundMatches.length === 1 ? "center" : "space-between"
                                }}
                            >
                                {/* Отрисовка матчей в этом раунде */}
                                {roundMatches.map((match) => (
                                    <div key={match.id} className="match-info">
                                        {/* Первый игрок */}
                                        <div className="player-card">
                                            <Link
                                                to={`/tournament/players/${match.player1}`}
                                                target={"_blank"}
                                                className={"player-title"}
                                                style={{
                                                    // Выделяем жирным победителя
                                                    fontWeight: match.result?.winner === "player1" ? "bold" : "normal"
                                                }}
                                            >
                                                {getPlayerName(match.player1)}
                                            </Link>
                                            <div className="player-score">
                                                {match.result?.player1}
                                            </div>
                                        </div>

                                        {/* Второй игрок */}
                                        <div className="player-card">
                                            <Link
                                                to={`/tournament/players/${match.player2}`}
                                                target={"_blank"}
                                                className={"player-title"}
                                                style={{
                                                    fontWeight: match.result?.winner === "player2" ? "bold" : "normal"
                                                }}
                                            >
                                                {getPlayerName(match.player2)}
                                            </Link>
                                            <div className="player-score">
                                                {match.result?.player2}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
