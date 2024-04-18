import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { useHttp } from "../../hooks/http.hook";
import Cookies from "js-cookie";
import Container from 'react-bootstrap/Container';

import AppHeader from "../app-header/appHeader";
import MainPage from "../pages/main/mainPage";
import BotPage from "../pages/bot-page/botPage";
import SoloPage from '../pages/solo-page/soloPage';
import WebGamePage from '../pages/web-game-page/webGamePage';
import CreateBotGame from '../pages/bot-page/createBotGame';
import GameExistsPage from '../pages/game-exitsts-page/gameExistsPage';

import "./App.css"
import RulesPage from '../pages/rules-page/rulesPage';

function App() {
  return (
    <Router>
      <div className="App">
        <AppHeader />
        <main>
          <Container>
            <Routes>
              <Route path='/' element={<MainPage />} />
              <Route path='/offline' element={<SoloPage />} />
              <Route path='/online/:gameId' element={<WebGamePage />} />
              <Route path='/bot/:gameId' element={<BotPage />} />
              <Route path='/bot/create' element={<CreateBotGame />} />
              <Route path='/game-exists/:gameId' element={<GameExistsPage />} />
              <Route path='/rules' element={<RulesPage />} />
            </Routes>
          </Container>
        </main>
      </div>
    </Router>
  );
}

export default App;
