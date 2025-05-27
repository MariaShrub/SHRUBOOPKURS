import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Participant } from '../types';
import ParticipantList from '../components/ParticipantList';
import React from 'react';

const ParticipantsPage = () => {
  const navigate = useNavigate();

  // Состояния для участников, минимального количества участников и настройки
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [minParticipants, setMinParticipants] = useState(8);  // Минимальное количество участников для турнира
 
  const [newParticipant, setNewParticipant] = useState<Omit<Participant, 'id'>>({
    firstName: '',
    lastName: '',
    rating: 0
  });

  // Загружаем настройки турнира из localStorage
  useEffect(() => {
    const savedConfig = localStorage.getItem('tournamentConfig');

    if (savedConfig) {
      const config = JSON.parse(savedConfig);
      setMinParticipants(config.participantsCount);  // Обновляем минимальное количество участников
    }
  }, []);

  // Функция для добавления нового участника
  const handleAddParticipant = () => {
    if (!newParticipant.firstName || !newParticipant.lastName) return;

    const participant: Participant = {
      id: Date.now().toString(),  // Уникальный ID на основе времени
      ...newParticipant
    };

    setParticipants([...participants, participant]);  // Добавляем нового участника
    setNewParticipant({ firstName: '', lastName: '', rating: 0 });  // Очищаем форму
  };

  // Функция для удаления участника
  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));  // Фильтруем удаленный участник
  };

  // Функция для начала турнира
  const handleStartTournament = () => {
    // Добавляем пустых участников до нужного количества
    const emptyParticipantsNeeded = minParticipants - participants.length;
    const emptyParticipants: Participant[] = Array(emptyParticipantsNeeded).fill(0).map((_, i) => ({
      id: `empty-${i}`,
      firstName: 'Пустой',
      lastName: 'Участник',
      rating: 0,
      isEmpty: true  // Отметка для пустых участников
    }));

    const allParticipants = [...participants, ...emptyParticipants];  // Объединяем реальных и пустых участников
    localStorage.setItem('tournamentParticipants', JSON.stringify(allParticipants));  // Сохраняем в localStorage
    navigate('/tournament');  // Перенаправляем на страницу турнира
  };

  return (
      <div className="participants-container">
        <h1>Управление участниками</h1>

        {/* Форма для добавления нового участника */}
        <div className="participant-form">
          <div className="form-group">
            <input
                type="text"
                placeholder="Имя"
                value={newParticipant.firstName}
                onChange={(e) => setNewParticipant({...newParticipant, firstName: e.target.value})}
                className="form-input"
            />
          </div>

          <div className="form-group">
            <input
                type="text"
                placeholder="Фамилия"
                value={newParticipant.lastName}
                onChange={(e) => setNewParticipant({...newParticipant, lastName: e.target.value})}
                className="form-input"
            />
          </div>

          <div className="form-group">
            <input
                type="number"
                placeholder="Рейтинг"
                value={newParticipant.rating}
                onChange={(e) => setNewParticipant({...newParticipant, rating: Number(e.target.value)})}
                min="0"
                className="form-input"
            />
          </div>

          <button
              onClick={handleAddParticipant}
              disabled={!newParticipant.firstName || !newParticipant.lastName}
              className="add-button"
          >
            Добавить участника
          </button>
        </div>

        {/* Компонент для отображения списка участников */}
        <ParticipantList
            participants={participants}
            minParticipants={minParticipants}
            onRemove={handleRemoveParticipant}
            showControls={true}  // Показываем кнопки управления (удаление участников)
        />

        {/* Кнопки для изменения настроек и начала турнира */}
        <div className="action-buttons">
          <button
              onClick={() => navigate('/')}  // Переход на главную страницу с настройками
              className="setup-button"
          >
            Изменить настройки
          </button>

          <button
              onClick={handleStartTournament}
              className="start-button"
          >
            Начать турнир ({participants.length}/{minParticipants})
          </button>
        </div>
      </div>
  );
};

export default ParticipantsPage;
