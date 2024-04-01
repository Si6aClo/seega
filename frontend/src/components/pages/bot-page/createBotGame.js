import { useEffect } from "react";

import { useNavigate } from "react-router-dom";
import useDataService from '../../../services/dataService';
import useCheckGameExists from "../../../services/checkGameExists";

const CreateBotGame = () => {
    useCheckGameExists();
    const { createGame } = useDataService();
    const navigate = useNavigate();

    const localCreateGame = async () => {
        const data = await createGame("bot-room", false, true);
        if (data === null || data === undefined) {
            return;
        }
        const gameId = data.game_id;
        navigate(`/bot/${gameId}`);
    }
    
    useEffect(() => {
        localCreateGame();
    }, []);
}

export default CreateBotGame;