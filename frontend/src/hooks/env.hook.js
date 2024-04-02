export const useEnv = () => {
    const { REACT_APP_API_URL, REACT_APP_WS_URL } = process.env;
    const API_URL = REACT_APP_API_URL;
    const WS_URL = REACT_APP_WS_URL;

    return { API_URL, WS_URL };
}
