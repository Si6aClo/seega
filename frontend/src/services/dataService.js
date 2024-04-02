import { useEnv } from "../hooks/env.hook";
import { useHttp } from "../hooks/http.hook";


const useDataService = () => {
    const { request, error } = useHttp();
    const { API_URL } = useEnv();
    const baseUrl = `${API_URL}/api/v1`;

    const getGamesList = async () => {
        const data = await request(`${baseUrl}/games/public`, "GET");
        return data;
    }

    const createGame = async (name, isPublic, isBot) => {
        const data = await request(
            `${baseUrl}/games/create`, 
            "POST", 
            JSON.stringify({
                name: name,
                is_public: isPublic,
                is_bot: isBot
            })
        );
        return data;
    }

    const getCurrentGame = async () => {
        const data = await request(`${baseUrl}/games/user/current`, "GET");
        return data;
    }

    return { getGamesList, createGame, getCurrentGame, error };
}

export default useDataService;