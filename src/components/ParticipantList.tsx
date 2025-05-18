import { Participant } from '../types';
import React from 'react';

interface ParticipantListProps {
  participants: Participant[];
  minParticipants: number;
  onRemove?: (id: string) => void;
  showControls?: boolean;
}

const ParticipantList = ({
                           participants,
                           minParticipants,
                           onRemove,
                           showControls = false
                         }: ParticipantListProps) => {
  // Сортируем участников по рейтингу (по убыванию); если рейтинг не задан, считаем его равным 0
  const sortedParticipants = [...participants].sort((a, b) => (b.rating || 0) - (a.rating || 0));

  return (
      <div className="participant-list-container">
        <div className="participant-count">
          Участников: {participants.length} / {minParticipants}
          {participants.length < minParticipants && (
              <span className="count-warning">
            (требуется еще {minParticipants - participants.length})
          </span>
          )}
        </div>

        <div className="participant-table">
          <div className="table-header">
            <div className="header-cell">#</div>
            <div className="header-cell">Имя</div>
            <div className="header-cell">Рейтинг</div>
            {showControls && <div className="header-cell">Действия</div>}
          </div>

          {sortedParticipants.length === 0 ? (
              <div className="empty-message">Нет добавленных участников</div>
          ) : (
              <div className="table-body">
                {sortedParticipants.map((participant, index) => (
                    <div
                        key={participant.id}
                        className={`table-row ${participant.isEmpty ? 'empty-participant' : ''}`}
                    >
                      <div className="table-cell">{index + 1}</div>
                      <div className="table-cell name-cell">
                        {participant.firstName} {participant.lastName}
                        {/* Отображаем метку, если участник помечен как "пустой" */}
                        {participant.isEmpty && <span className="empty-badge">[Пустой]</span>}
                      </div>
                      <div className="table-cell rating-cell">
                        {participant.rating || '-'}
                      </div>
                      {showControls && onRemove && (
                          <div className="table-cell action-cell">
                            {/* Не показываем кнопку "Удалить" для пустых слотов */}
                            {!participant.isEmpty && (
                                <button
                                    onClick={() => onRemove(participant.id)}
                                    className="remove-btn"
                                    aria-label={`Удалить ${participant.firstName} ${participant.lastName}`}
                                >
                                  Удалить
                                </button>
                            )}
                          </div>
                      )}
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
};

export default ParticipantList;
