import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TournamentSetupForm from '../components/TournamentSetupForm';
import { BracketType, TiebreakerType } from '../types';
import React from 'react';

const TournamentSetupPage = () => {
  const navigate = useNavigate();
  const [savedConfig, setSavedConfig] = useState<{
    participantsCount: number;
    bracketType: BracketType;
    tiebreakerType: TiebreakerType;
    matchesInRound: number;
  } | null>(null);

  // Загрузка сохраненных настроек
  useEffect(() => {
    const config = localStorage.getItem('tournamentConfig');
    if (config) {
      setSavedConfig(JSON.parse(config));
    }
  }, []);

  const handleSubmit = (config: {
    participantsCount: number;
    bracketType: BracketType;
    tiebreakerType: TiebreakerType;
    matchesInRound: number;
  }) => {
    localStorage.setItem('tournamentConfig', JSON.stringify(config));
    navigate('/participants');
  };

  return (
    <div className="setup-page-container">
      <div className="setup-header">
        <h1>Настройка турнира</h1>
        <p className="setup-description">
          Укажите параметры для нового турнира по системе двойного выбывания
        </p>
      </div>

      <div className="setup-form-container">
        <TournamentSetupForm
          initialParticipantsCount={savedConfig?.participantsCount || 8}
          initialBracketType={savedConfig?.bracketType || 'rigid'}
          initialTiebreakerType={savedConfig?.tiebreakerType || 'rating'}
          onSubmit={handleSubmit}
        />
      </div>

      <div className="setup-info">
        <h3>Справка по настройкам:</h3>
        <ul className="info-list">
          <li>
            <strong>Количество участников:</strong> Турнир автоматически дополнится
            "пустыми" участниками до ближайшей степени двойки (4, 8, 16, 32, 64)
          </li>
          <li>
            <strong>Тип сетки:</strong>
            <ul>
              <li><strong>Жесткая</strong> - пары формируются по рейтингу (сильный против слабого)</li>
              <li><strong>Случайная</strong> - полная жеребьевка перед первым туром</li>
              <li><strong>Перепосев</strong> - жеребьевка перед каждым туром</li>
            </ul>
          </li>
          <li>
            <strong>Тип тайбрейка:</strong>
            <ul>
              <li><strong>По рейтингу</strong> - при равенстве очков выше идет участник с большим рейтингом</li>
              <li><strong>Бухгольц</strong> - сумма очков всех соперников</li>
              <li><strong>Бергер</strong> - сумма очков побежденных соперников</li>
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TournamentSetupPage;
