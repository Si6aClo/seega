import { useState, useCallback } from "react";
import Cookies from "js-cookie";
import { useEnv } from "./env.hook";

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    let token = Cookies.get("XUserToken");
    const { API_URL } = useEnv();

    const request = useCallback(async (
        url,
        method = 'GET',
        body = null,
        headers = { 'Content-Type': 'application/json', 'XUserToken': token }
    ) => {
        setLoading(true);

        const response = await fetch(url, { method, body, headers, credentials: 'same-origin' });

        if (!response.ok) {
            console.log("not ok", response.statusText);
            setError(response.statusText);
            setLoading(false);
            return;
        }

        try {
            const data = await response.json();
            setLoading(false);
            return data;
        } catch {
            return response;
        }
    }, [])


    if (token === undefined || token === null) {
        request(`${API_URL}/api/v1/auth`, 'GET').then((data) => {
            Cookies.set("XUserToken", data.token);
            token = data.token;
        });
    }

    const clearError = useCallback(() => setError(null), []);

    return { loading, error, request, clearError };
}