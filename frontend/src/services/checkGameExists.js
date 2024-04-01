import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useDataService from "./dataService"


const useCheckGameExists = () => {
    const [data, setData] = useState(null);
    const { getCurrentGame, error } = useDataService();
    const navigate = useNavigate();

    const checkCurrentGame = async () => {
        return await getCurrentGame();
    }

    useEffect(() => {
        checkCurrentGame().then(setData);
    }, []);

    useEffect(() => {
        if (error === null && data !== null) {
            navigate(`/game-exists/${data.game_id}`);
        }
    }, [data]);
}

export default useCheckGameExists;