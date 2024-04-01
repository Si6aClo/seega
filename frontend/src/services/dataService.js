import { useHttp } from "../hooks/http.hook";


const useDataService = () => {
    const { request, error } = useHttp();
    const baseUrl = "http://127.0.0.1:8000/api/v1";

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