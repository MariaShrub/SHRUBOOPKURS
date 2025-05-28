import { Standing, Participant } from '../types';
import React from 'react';

interface StandingsTableProps {
  standings: Standing[];
  participants: Participant[];
  highlightTop?: number;
  showTiebreakers?: boolean;
}

const StandingsTable = ({
                          standings,
                          participants,
                          highlightTop = 3,
                          showTiebreakers = true
                        }: StandingsTableProps) => {
  // Добавляем в каждую запись таблицы ссылку на участника по его ID
  const enrichedStandings = standings.map(standing => {
    const participant = participants.find(p => p.id === standing.participantId);
    return {
      ...standing,
      participant
    };
  });

  // Возвращает класс для строк лидеров (например, top-1, top-2)
  const getPositionClass = (position: number) => {
    if (position <= highlightTop) {
      return `top-${position}`;
    }
    return '';
  };

  return (
      <div className="standings-table-container">
        <table className="standings-table">
          <thead>
          <tr>
            <th className="position-col">#</th>
            <th className="name-col">Участник</th>
            <th className="points-col">Очки</th>
            <th className="stats-col">Победы</th>
            <th className="stats-col">Ничьи</th>
            <th className="stats-col">Поражения</th>
            {showTiebreakers && (
                <>
                  <th className="rating-col">Рейтинг</th>
                  <th className="buchholz-col">Бухгольц</th>
                  <th className="buchholz-col">Бергер</th>
                </>
            )}
          </tr>
          </thead>
          <tbody>
          {enrichedStandings.map((standing) => {
            // Если участник не найден (возможно, удалён) — не рендерим строку
            if (!standing.participant) return null;

            return (
                <tr
                    key={standing.participantId}
                    className={getPositionClass(standing.position)}
                >
                  <td className="position-cell">
                    <span className="position-badge">{standing.position}</span>
                  </td>
                  <td className="name-cell">
                    {standing.participant.firstName} {standing.participant.lastName}
                    {standing.participant.isEmpty && (
                        <span className="empty-badge">[Пустой]</span>
                    )}
                  </td>
                  <td className="points-cell">{standing.points.toFixed(1)}</td>
                  <td className="stats-cell">{standing.wins}</td>
                  <td className="stats-cell">{standing.draws}</td>
                  <td className="stats-cell">{standing.losses}</td>
                  {showTiebreakers && (
                      <>
                        <td className="rating-cell">{standing.participant.rating || '-'}</td>
                        {/* Показываем коэффициенты только для лидеров */}
                        <td className="buchholz-cell">
                          {standing.position <= highlightTop ? standing.buchholz?.toFixed(1) : '-'}
                        </td>
                        <td className="berger-cell">
                          {standing.position <= highlightTop ? standing.berger?.toFixed(1) : '-'}
                        </td>
                      </>
                  )}
                </tr>
            );
          })}
          </tbody>
        </table>
      </div>
  );
};

export default StandingsTable;
