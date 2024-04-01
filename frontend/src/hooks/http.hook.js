import { useState, useCallback } from "react";
import Cookies from "js-cookie";

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const token = Cookies.get("XUserToken");

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

    const clearError = useCallback(() => setError(null), []);

    return { loading, error, request, clearError };
}