import {BrowserRouter, Routes, Route} from 'react-router-dom'
import TournamentSetupPage from './pages/TournamentSetupPage'
import ParticipantsPage from './pages/ParticipantsPage'
import TournamentPage from './pages/TournamentPage'
import {TournamentInfoPage} from "./pages/TournamentInfoPage.js";
import {ParticipantInfoPage} from "./pages/ParticipantInfoPage.js";
import React from 'react';

/**
 * Главный компонент приложения
 * Определяет маршруты:
 * - / - Настройки турнира
 * - /participants - Добавление участников
 * - /tournament - Проведение турнира
 */
function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<TournamentSetupPage/>}/>
                <Route path="/participants" element={<ParticipantsPage/>}/>
                <Route path="/tournament" element={<TournamentPage/>}/>
                <Route path="/tournament/info" element={<TournamentInfoPage/>}/>
                <Route path="/tournament/players/:id" element={<ParticipantInfoPage/>}/>
            </Routes>
        </BrowserRouter>
    )
}

export default App
