import { useState, useEffect, useCallback } from "react";
import Cookies from "js-cookie";
import { useEnv } from "./env.hook";

export const useHttp = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { API_URL } = useEnv();

    const request = useCallback(async (
        url,
        method = 'GET',
        body = null,
        headers = { 'Content-Type': 'application/json' },
        useUserToken = true,
    ) => {
        let reqToken = Cookies.get("XUserToken");
        if (reqToken === "") {
            const res = await fetch(`${API_URL}/api/v1/auth`, { method, body, headers, credentials: 'same-origin' });
            const data = await res.json();
            Cookies.set("XUserToken", data.token);
            reqToken = data.token;
        }
        if (useUserToken) {
            headers['XUserToken'] = reqToken;
        }
        console.log(headers);
        
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