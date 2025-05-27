import {useState, useEffect, useCallback, useMemo} from 'react';
import {Link} from 'react-router-dom';
import CurrentRound from '../components/CurrentRound';
import {Participant, Match, Standing, BracketType, TiebreakerType} from '../types';
import {DoubleEliminationBracket} from "../components/DoubleEliminationBracket/DoubleEliminationBracket";
import {MatchResult} from "../components/MatchResultInput";
import React from 'react';

const TournamentPage = () => {
    const [participants, setParticipants] = useState<Participant[]>([]); // Состояние для участников турнира
    const [currentRound, setCurrentRound] = useState(1); // Текущий раунд турнира
    const [upperBracket, setUpperBracket] = useState<Match[]>([]); // Состояние для верхней сетки
    const [lowerBracket, setLowerBracket] = useState<Match[]>([]); // Состояние для нижней сетки
    const [standings, setStandings] = useState<Standing[]>([]); // Состояние для турнирной таблицы
    const [bracketType, setBracketType] = useState<BracketType>('rigid'); // Тип сетки (жесткая, жеребьевка, перепосев)
    const [tiebreakerType, setTiebreakerType] = useState<TiebreakerType>('rating'); // Тип тайбрейка
    const [finalMatch, setFinalMatch] = useState<Match | null>(null); // Финальный матч
    const [winner, setWinner] = useState<Participant | null>(null); // Победитель турнира
    const [isLoading, setIsLoading] = useState(true); // Состояние загрузки данных турнира
    const [upperFinalWinner, setUpperFinalWinner] = useState<string | null>(null); // Победитель верхней сетки
    const [upperFinalLoser, setUpperFinalLoser] = useState<string | null>(null); // Проигравший верхней сетки
    const [isLowerFinalPlaying, setIsLowerFinalPlaying] = useState(false); // Флаг, показывающий, что идет финал нижней сетки
    const [roundsInMatch, setRoundsInMatch] = useState(1); // Количество матчей в раунде

    useEffect(() => {
        const loadTournamentData = () => {
            const savedParticipants = localStorage.getItem('tournamentParticipants'); // Получаем сохраненных участников
            const savedConfig = localStorage.getItem('tournamentConfig'); // Получаем сохраненные настройки

            if (!savedParticipants) {
                window.location.href = '/participants'; // Если участников нет, перенаправляем на страницу с участниками
                return;
            }

            const participantsData: Participant[] = JSON.parse(savedParticipants); // Парсим данные участников
            setParticipants(participantsData);

            if (savedConfig) {
                const config = JSON.parse(savedConfig); // Парсим настройки турнира
                setBracketType(config.bracketType);
                setTiebreakerType(config.tiebreakerType);
                console.log(config.matchesInRound )
                setRoundsInMatch(+config.matchesInRound); // Устанавливаем количество матчей в раунде
                setTimeout(() => initializeTournament(participantsData, config.matchesInRound), 100); // Инициализация турнира
            }

            setIsLoading(false); // Завершаем загрузку
        };

        loadTournamentData();
    }, []);

    // Инициализация турнира
    const initializeTournament = (participants: Participant[], matchesInRound: number) => {
        const sortedParticipants = [...participants].sort((a, b) => (b.rating || 0) - (a.rating || 0)); // Сортируем участников по рейтингу


        console.log('init', matchesInRound)
        // Создание начальных матчей для верхней сетки
        const initialUpperMatches = createMatchesForRound(
            sortedParticipants.map(p => p.id),
            'upper',
            1,
            matchesInRound
        );

        setUpperBracket(initialUpperMatches); // Устанавливаем верхнюю сетку
        setLowerBracket([]); // Нижняя сетка пока пуста
        setCurrentRound(1); // Устанавливаем первый раунд
        setFinalMatch(null); // Финальный матч еще не начался
        setWinner(null); // Нет победителя

        // Инициализация турнирной таблицы
        const initialStandings = sortedParticipants.map((p, index) => ({
            participantId: p.id,
            points: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            rating: p.rating || 0,
            position: index + 1,
            buchholz: 0,
            berger: 0
        }));

        setStandings(initialStandings); // Устанавливаем турнирную таблицу
    };

    // Функция для создания матчей на основе раунда и сетки
    const createMatchesForRound = (
        participantIds: string[],
        bracket: 'upper' | 'lower',
        round: number,
        matchesInRound: number = roundsInMatch
    ): Match[] => {
        const matches: Match[] = [];

        console.log('creatematches', roundsInMatch)
        let pairedParticipants = [...participantIds]; // Копируем список участников для жеребьевки

        // Применяем выбранный тип сетки
        if (bracketType === 'random' || (bracketType === 'reroll' && round > 1)) {
            pairedParticipants = [...pairedParticipants].sort(() => Math.random() - 0.5); // Случайная жеребьевка
        } else {
            pairedParticipants.sort((a, b) => {
                const aRating = participants.find(p => p.id === a)?.rating || 0; // Рейтинг первого игрока
                const bRating = participants.find(p => p.id === b)?.rating || 0; // Рейтинг второго игрока
                return bRating - aRating; // Сортируем по убыванию рейтинга
            });
        }

        // Создаем пары игроков
        for (let i = 0; i < pairedParticipants.length / 2; i++) {
            const player1 = pairedParticipants[i * 2]; // Первый игрок
            const player2 = pairedParticipants[i * 2 + 1] || ''; // Второй игрок (или пусто)

            const autoWin = (player1.includes('empty') || player2.includes('empty')) ? player1.includes('empty') ? 'player2' : 'player1' : null

            matches.push({
                id: `${bracket}-${round}-${i}`,
                round,
                bracket,
                player1,
                player2,
                result: autoWin ? { // Автопобеда, если нет соперника
                    player1: autoWin === 'player1' ? matchesInRound : 0,
                    player2: autoWin === 'player2' ? matchesInRound : 0,
                    winner: autoWin,
                    details: new Array(matchesInRound).fill(null).map((_, i) => ({
                            matchNumber: i + 1,
                            result: autoWin,
                        }))
                } : null
            });
        }

        return matches;
    };

    // Обработка результата матча
    const handleMatchResult = (matchId: string, result: MatchResult[]) => {
        const newUpperBracket = updateBracketResults(upperBracket, matchId, result); // Обновляем верхнюю сетку
        const newLowerBracket = updateBracketResults(lowerBracket, matchId, result); // Обновляем нижнюю сетку

        setUpperBracket(newUpperBracket); // Устанавливаем обновленную верхнюю сетку
        setLowerBracket(newLowerBracket); // Устанавливаем обновленную нижнюю сетку

        const allMatches = [...newUpperBracket, ...newLowerBracket];

        if (finalMatch && finalMatch.id === matchId) {
            allMatches.push({...finalMatch, result: {...calcPoints(result), details: result}}); // Добавляем финальный матч
        }

        const newStandings = updateStandings(allMatches.filter(m => m.result)); // Обновляем турнирную таблицу

        if (finalMatch && finalMatch.id === matchId) {
            const winnerId = newStandings[0].participantId; // Победитель
            setWinner(participants.find(p => p.id === winnerId) || null); // Устанавливаем победителя
            setFinalMatch(prev => prev ? ({...prev, result: {...calcPoints(result), details: result}}) : null); // Обновляем финальный матч
        }
    };

    // Функция для расчета очков
    const calcPoints = (result: MatchResult[]) => {
        return {
            player1: result.filter(el => el.result.includes('player1')).length + result.filter(el => el.result.includes('draw')).length * 0.5, // Очки для игрока 1
            player2: result.filter(el => el.result.includes('player2')).length + result.filter(el => el.result.includes('draw')).length * 0.5, // Очки для игрока 2
            get winner() {
                if (this.player1 > this.player2) {
                    return 'player1' // Если очков больше у игрока 1, он побеждает
                } else {
                    return 'player2' // В противном случае побеждает игрок 2
                }
            }
        }
    }

    // Обновляет результаты матча в турнирной таблице
    const updateBracketResults = (
        bracket: Match[],    // Турнирная сетка (список матчей)
        matchId: string,     // Идентификатор матча, который нужно обновить
        result: MatchResult[] // Результат матча (массив с деталями)
    ) => {
        // Применяет изменения в сетке, если match.id совпадает с matchId
        return bracket.map(match =>
            match.id === matchId ? {
                ...match,
                result: {...calcPoints(result), details: result} // Обновляем результат с расчетом очков и деталями
            } : match
        );
    };

// Обновляет статистику всех участников на основе всех сыгранных матчей
    const updateStandings = (allMatches: Match[] = []) => {
        const newStandings = [...standings]; // Копия текущих стоящих

        // Сброс статистики каждого участника
        newStandings.forEach(s => {
            s.points = 0;
            s.wins = 0;
            s.draws = 0;
            s.losses = 0;
        });

        // Обновление статистики участников на основе результатов матчей
        allMatches.forEach(match => {
            const player1Standing = newStandings.find(s => s.participantId === match.player1); // Статистика первого игрока
            const player2Standing = newStandings.find(s => s.participantId === match.player2); // Статистика второго игрока

            if (!player1Standing || !player2Standing) return; // Если одного из участников нет, пропускаем матч

            // Обновляем очки, победы, ничьи и поражения для первого игрока
            player1Standing.points += match.result?.player1 || 0;
            player1Standing.wins += match?.result?.details?.filter(el => el?.result?.includes('player1'))?.length || 0;
            player1Standing.draws += match.result?.details.filter(el => el.result.includes('draw')).length || 0;
            player1Standing.losses += match.result?.details.filter(el => el.result.includes('player2')).length || 0;

            // Обновляем очки, победы, ничьи и поражения для второго игрока
            player2Standing.points += match.result?.player2 || 0;
            player2Standing.wins += match.result?.details.filter(el => el.result.includes('player2')).length || 0;
            player2Standing.draws += match.result?.details.filter(el => el.result.includes('draw')).length || 0;
            player2Standing.losses += match.result?.details.filter(el => el.result.includes('player1')).length || 0;
        });

        // Расчет дополнительных критериев для участников (Buchholz и Berger)
        newStandings.forEach(standing => {
            standing.buchholz = calculateBuchholz(standing.participantId, newStandings, allMatches);
            standing.berger = calculateBerger(standing.participantId, newStandings, allMatches);
        });

        // Сортировка участников с учетом выбранного тайбрейка
        newStandings.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points; // Сортируем по очкам

            // Тайбрейкеры: рейтинг, Buchholz, Berger
            switch (tiebreakerType) {
                case 'rating':
                    return (getParticipantById(b.participantId)?.rating || 0) -
                        (getParticipantById(a.participantId)?.rating || 0);
                case 'buchholz':
                    return (b.buchholz || 0) - (a.buchholz || 0);
                case 'berger':
                    return (b.berger || 0) - (a.berger || 0);
                default:
                    return 0;
            }
        });

        // Обновление позиций участников после сортировки
        newStandings.forEach((standing, index) => {
            standing.position = index + 1;
        });

        // Обновление состояний и сохранение в локальное хранилище
        setStandings(newStandings);
        localStorage.setItem('tournamentStandings', JSON.stringify(newStandings));

        return newStandings; // Возвращаем обновленную таблицу
    };

// Расчет показателя Buchholz для участника
    const calculateBuchholz = (participantId: string, standings: Standing[], allMatches: Match[]) => {
        // Находим все матчи участника
        const participantMatches = allMatches
            .filter(m => m.result && (m.player1 === participantId || m.player2 === participantId));

        // Суммируем очки всех соперников участника
        return participantMatches.reduce((sum, match) => {
            const opponentId = match.player1 === participantId ? match.player2 : match.player1;
            if (!opponentId) return sum; // Пропускаем пустых участников

            const opponent = standings.find(s => s.participantId === opponentId);
            return sum + (opponent?.points || 0);
        }, 0);
    };

// Расчет показателя Berger для участника
    const calculateBerger = (participantId: string, standings: Standing[], allMatches: Match[]) => {
        // Находим все матчи участника
        const participantMatches = allMatches
            .filter(m => m.result && (m.player1 === participantId || m.player2 === participantId));

        // Суммируем очки всех победителей, с которыми играл участник
        return participantMatches.reduce((sum, match: Match) => {
            if (match.result?.winner === 'player1' && match.player1 === participantId) {
                const opponent = standings.find(s => s.participantId === match.player2);
                return sum + (opponent?.points || 0);
            }
            if (match.result?.winner === 'player2' && match.player2 === participantId) {
                const opponent = standings.find(s => s.participantId === match.player1);
                return sum + (opponent?.points || 0);
            }
            return sum;
        }, 0);
    };


    const advanceToNextRound = () => {
        const currentUpperMatches = upperBracket.filter(m => m.round === currentRound);
        const currentLowerMatches = lowerBracket.filter(m => m.round === currentRound);

        // Проверка завершенности всех матчей
        if (currentUpperMatches.some(m => !m.result) || (currentRound > 1 && currentLowerMatches.some(m => !m.result))) {
            alert('Не все матчи текущего раунда завершены!');
            return;
        }

        if (currentRound === 1) {
            // Первый раунд: проигравшие из верхней — в нижнюю, второй раунд
            const losers = currentUpperMatches
                .map(m => m.result?.winner === 'player1' ? m.player2 : m.player1)
                .filter(id => id);

            const firstLowerMatches = createMatchesForRound(losers, 'lower', 2); // нижняя сетка начинается со 2 раунда
            setLowerBracket(firstLowerMatches);

            // Победители идут в следующий раунд верхней
            const upperWinners = currentUpperMatches
                .map(m => m.result?.winner === 'player1' ? m.player1 : m.player2);

            const nextUpperMatches = createMatchesForRound(upperWinners, 'upper', 2);
            setUpperBracket(prev => [...prev, ...nextUpperMatches]);
        } else {
            if (isLowerFinalPlaying && upperFinalWinner) {
                // финал нижней сетки сыгран
                const loserFinalWinner = currentLowerMatches[0].result?.winner === 'player1' ? currentLowerMatches[0].player1 : currentLowerMatches[0].player2 as string;

                setFinalMatch({
                    id: 'final-match',
                    round: currentRound + 1,
                    bracket: 'final',
                    player1: upperFinalWinner,
                    player2: loserFinalWinner,
                    result: null
                });

                return;
            }

            // финал верхней сетки сыгран
            if (currentUpperMatches.length === 1) {
                const winner = currentUpperMatches[0].result?.winner === 'player1' ? currentUpperMatches[0].player1 : currentUpperMatches[0].player2 as string;
                const loser = currentUpperMatches[0].result?.winner === 'player1' ? currentUpperMatches[0].player2 : currentUpperMatches[0].player1 as string;

                setUpperFinalWinner(winner);
                setUpperFinalLoser(loser);
            }

            // Верхняя сетка: победители идут дальше
            const upperWinners = currentUpperMatches
                .map(m => m.result?.winner === 'player1' ? m.player1 : m.player2);

            const nextUpperMatches = currentUpperMatches.length > 1 ? createMatchesForRound(upperWinners, 'upper', currentRound + 1) : [];

            // Проигравшие из верхней + победители из нижней — в нижнюю
            const losersFromUpper = currentUpperMatches
                .map(m => m.result?.winner === 'player1' ? m.player2 : m.player1)
                .filter(id => id);


            const winnersFromLower = lowerBracket
                .filter(m => m.round === currentRound && m.result?.winner)
                .map(m => m.result?.winner === 'player1' ? m.player1 : m.player2);


            const nextLowerPlayers: string[] = [];

            // финал верхней сетки сыгран
            if (losersFromUpper.length === 1 && winnersFromLower.length === 2) {
                nextLowerPlayers.push(...winnersFromLower);
            } else if (losersFromUpper.length >= 2) {
                nextLowerPlayers.push(...losersFromUpper, ...winnersFromLower);
            } else if (upperFinalLoser) {
                nextLowerPlayers.push(...winnersFromLower, upperFinalLoser);
                setIsLowerFinalPlaying(true);
            }

            const nextLowerMatches = createMatchesForRound(
                nextLowerPlayers,
                'lower',
                currentRound + 1,
                // lowerBracket // передаем историю матчей для исключения повторов
            );

            setUpperBracket(prev => [...prev, ...nextUpperMatches]);
            setLowerBracket(prev => [...prev, ...nextLowerMatches]);

        }

        setCurrentRound(prev => prev + 1);
    };

    const getParticipantById = useCallback((id: string | null) => {
        return id ? participants.find(p => p.id === id) : undefined;
    }, [participants]);

    const allCurrentMatchesCompleted = useMemo(() => {
        // Фильтрация матчей для текущего раунда в верхней и нижней сетке
        const currentUpperMatches = upperBracket.filter(m => m.round === currentRound);
        const currentLowerMatches = lowerBracket.filter(m => m.round === currentRound);

        // Возвращаем true, если все матчи завершены
        return (
            !currentUpperMatches.some(m => !m.result) && // Нет незавершенных матчей в верхней сетке
            !currentLowerMatches.some(m => !m.result)    // Нет незавершенных матчей в нижней сетке
        );
    }, [upperBracket, lowerBracket, currentRound]);

    // Эффект для сохранения всех матчей до текущего раунда в localStorage
    useEffect(() => {
        const matches = [...upperBracket, ...lowerBracket].filter(m => m.round <= currentRound);
        localStorage.setItem('tournamentMatches', JSON.stringify(matches)); // Сохранение матчей
    }, [upperBracket, lowerBracket, currentRound]);

    // Если данные загружаются, показываем индикатор загрузки
    if (isLoading) {
        return <div className="loading">Загрузка турнира...</div>;
    }

    // Формируем список матчей для отображения на текущий момент
    const matchesForDisplay: Match[] = [...upperBracket, ...lowerBracket].filter(m => m.round <= currentRound);

    // Если есть финальный матч, добавляем его в список
    if (finalMatch) {
        matchesForDisplay.push(finalMatch);
    }

    return (
        <div className="tournament-page">
            <div className="tournament-header">
                {/* Ссылка на страницу с информацией о турнире */}
                <Link to={'/tournament/info'} target={"_blank"}>
                    <button>Информация о турнире</button>
                </Link>
                <h1>Турнир по системе двойного выбывания</h1>
                <div className="tournament-info">
                    {/* Информация о текущем турнире */}
                    <span>Раунд: {currentRound}</span>
                    <span>Тип сетки: {bracketType === 'rigid' ? 'Жесткая' : bracketType === 'random' ? 'Жеребьевка' : 'Перепосев'}</span>
                    <span>Тайбрейк: {tiebreakerType === 'rating' ? 'По рейтингу' : tiebreakerType === 'buchholz' ? 'Бухгольц' : 'Бергер'}</span>
                    <span>Матчей в раунде: {roundsInMatch}</span>
                </div>
            </div>

            <div className="tournament-grid">
                <div className="brackets-section">
                    {/* Компонент для отображения сетки турнира */}
                    <DoubleEliminationBracket
                        matches={matchesForDisplay}
                        getParticipantById={getParticipantById}
                    />
                </div>

                <div className="current-round-section">
                    {/* Если есть финальный матч, отображаем его отдельно */}
                    {finalMatch ? (
                        <div className="final-stage">
                            <h2>Финальный матч</h2>
                            {/* Отображение финального матча */}
                            <CurrentRound
                                round={currentRound}
                                matches={[finalMatch]}
                                getParticipantById={getParticipantById}
                                onMatchResult={handleMatchResult}
                                tiebreakerType={tiebreakerType}
                                showBracketType={false}
                                matchesPerRound={roundsInMatch}
                            />
                            {/* Объявление победителя турнира */}
                            {winner && (
                                <div className="winner-announcement">
                                    <h3>🏆 Победитель турнира 🏆</h3>
                                    <p>{winner.firstName} {winner.lastName}</p>
                                    <p>Рейтинг: {winner.rating}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <h2>Текущий раунд</h2>
                            {/* Отображаем верхнюю сетку, если есть матчи для текущего раунда */}
                            {upperBracket.some(m => m.round === currentRound) && (
                                <>
                                    <h3>Верхняя сетка</h3>
                                    <CurrentRound
                                        round={currentRound}
                                        matches={upperBracket.filter(m => m.round === currentRound)}
                                        getParticipantById={getParticipantById}
                                        onMatchResult={handleMatchResult}
                                        tiebreakerType={tiebreakerType}
                                        matchesPerRound={roundsInMatch}
                                    />
                                </>
                            )}
                            {/* Отображаем нижнюю сетку, если есть матчи для текущего раунда */}
                            {lowerBracket.some(m => m.round === currentRound) && (
                                <>
                                    <h3>Нижняя сетка</h3>
                                    <CurrentRound
                                        round={currentRound}
                                        matches={lowerBracket.filter(m => m.round === currentRound)}
                                        getParticipantById={getParticipantById}
                                        onMatchResult={handleMatchResult}
                                        tiebreakerType={tiebreakerType}
                                        matchesPerRound={roundsInMatch}
                                    />
                                </>
                            )}
                            {/* Кнопка для перехода к следующему раунду или завершения турнира */}
                            <button
                                onClick={advanceToNextRound}
                                className="next-round-button"
                                disabled={!allCurrentMatchesCompleted} // Кнопка неактивна, если не все матчи завершены
                            >
                                {finalMatch ? 'Завершить турнир' : 'Следующий раунд'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TournamentPage;
