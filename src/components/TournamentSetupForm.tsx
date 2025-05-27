import { useState, useEffect } from 'react';
import { BracketType, TiebreakerType } from '../types';
import React from 'react';

interface TournamentSetupFormProps {
  initialParticipantsCount?: number;
  initialBracketType?: BracketType;
  initialTiebreakerType?: TiebreakerType;
  initialMatchesInRound?: number; 
  onSubmit: (config: {
    participantsCount: number;
    bracketType: BracketType;
    tiebreakerType: TiebreakerType;
    matchesInRound: number; 
  }) => void;
}

const TournamentSetupForm = ({
                               initialParticipantsCount = 8,
                               initialBracketType = 'rigid',
                               initialTiebreakerType = 'rating',
                               initialMatchesInRound = 1,
                               onSubmit,
                             }: TournamentSetupFormProps) => {
  const [participantsCount, setParticipantsCount] = useState<number>(initialParticipantsCount);
  const [bracketType, setBracketType] = useState<BracketType>(initialBracketType);
  const [tiebreakerType, setTiebreakerType] = useState<TiebreakerType>(initialTiebreakerType);
 
  const [matchesInRound, setMatchesInRound] = useState<number>(initialMatchesInRound);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Обновление локального состояния при изменении пропсов
  useEffect(() => {
    setParticipantsCount(initialParticipantsCount);
    setBracketType(initialBracketType);
    setTiebreakerType(initialTiebreakerType);
    setMatchesInRound(initialMatchesInRound);
  }, [initialParticipantsCount, initialBracketType, initialTiebreakerType, initialMatchesInRound]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    onSubmit({
      participantsCount,
      bracketType,
      tiebreakerType,
      matchesInRound
    });

    setIsSubmitting(false);
  };

  // Текстовое описание выбранного типа сетки
  const getBracketDescription = (type: BracketType) => {
    switch(type) {
      case 'rigid': return "Жесткая сетка (сильный vs слабый)";
      case 'random': return "Случайная жеребьевка";
      case 'reroll': return "Перепосев перед каждым туром";
      default: return "";
    }
  };

  // Текстовое описание выбранного тайбрейка
  const getTiebreakerDescription = (type: TiebreakerType) => {
    switch(type) {
      case 'rating': return "По рейтингу участника";
      case 'buchholz': return "Сумма очков соперников";
      case 'berger': return "Сумма очков побежденных соперников";
      default: return "";
    }
  };

  return (
      <form onSubmit={handleSubmit} className="tournament-setup-form">
        
        {/* Блок выбора количества участников */}
        <div className="form-section">
          <label className="form-label">
            Количество участников:
            <select
                value={participantsCount}
                onChange={(e) => setParticipantsCount(Number(e.target.value))}
                className="form-select"
                disabled={isSubmitting}
            >
              {[4, 8, 16, 32, 64].map(num => (
                  <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </label>
          <p className="form-hint">
            Турнир автоматически дополнится пустыми участниками до ближайшей степени двойки
          </p>
        </div>

        {/* Блок выбора типа сетки */}
        <div className="form-section">
          <label className="form-label">
            Тип сетки:
            <select
                value={bracketType}
                onChange={(e) => setBracketType(e.target.value as BracketType)}
                className="form-select"
                disabled={isSubmitting}
            >
              <option value="rigid">Жесткая сетка</option>
              <option value="random">Случайная жеребьевка</option>
              <option value="reroll">Перепосев перед туром</option>
            </select>
          </label>
          <p className="form-description">
            {getBracketDescription(bracketType)}
          </p>
        </div>

        {/* Блок выбора типа тайбрейка */}
        <div className="form-section">
          <label className="form-label">
            Тип тайбрейка:
            <select
                value={tiebreakerType}
                onChange={(e) => setTiebreakerType(e.target.value as TiebreakerType)}
                className="form-select"
                disabled={isSubmitting}
            >
              <option value="rating">По рейтингу</option>
              <option value="buchholz">Коэффициент Бухгольца</option>
              <option value="berger">Коэффициент Бергера</option>
            </select>
          </label>
          <p className="form-description">
            {getTiebreakerDescription(tiebreakerType)}
          </p>
        </div>

        {/* Новый блок: выбор количества матчей в серии */}
        <div className="form-section">
          <label className="form-label">
            Количество матчей в серии:
            <select
                value={matchesInRound}
                onChange={(e) => setMatchesInRound(Number(e.target.value))}
                className="form-select"
                disabled={isSubmitting}
            >
              {[1, 3, 5].map(num => (
                  <option key={num} value={num}>{`Best of ${num}`}</option>
              ))}
            </select>
          </label>
          <p className="form-hint">
            Сколько матчей нужно для победы в паре: 1, 3 или 5.
          </p>
        </div>

        {/* Кнопки действия */}
        <div className="form-actions">
          
          <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
          >
            {isSubmitting ? 'Сохранение...' : 'Сохранить настройки'}
          </button>
        </div>
      </form>
  );
};

export default TournamentSetupForm;
