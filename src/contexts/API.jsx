import { createContext, useContext } from "react";

// Contexts
import { Data } from "./Data";

const API_VERSION = "api_v1";
const API_URL = "https://rowtine.herokuapp.com/"; // "http://localhost:3100/"

export const API = createContext();
const APIProvider = (props) => {
    const { rowHistoric } = useContext(Data);

    const setRowEntry = async (value, year, month, day) => {
        console.log(value, year, month, day);
        const date = new Date(year, month, day);
        const now = new Date();
        const timezoneOffsetInMs = -now.getTimezoneOffset() * 60 * 1000;

        const postData = { value, date, timezoneOffsetInMs };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/row/setRowEntry`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();
            if ("error" in response) return response;
            return response;
        } catch (error) {
            return { error: `Get month row entries error: ${error}` };
        }
    };

    const getMonthEntries = async (month, year) => {
        if (!year || !month) {
            const date = new Date();
            month = date.getMonth() + 1;
            year = date.getFullYear();
        }

        const postData = { month, year };

        try {
            const rawResponse = await fetch(`${API_URL}${API_VERSION}/row/getMonthEntries`, {
                method: "post",
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify(postData),
            });

            const response = await rawResponse.json();

            if ("error" in response) return response;

            if ("historic" in response) {
                // Update local data
                if (!(year in rowHistoric.current)) rowHistoric.current[year] = {};
                rowHistoric.current[year][month] = response.historic;
                return true;
            }

            return false;
        } catch (error) {
            return { error: `Get month row entries error: ${error}` };
        }
    };

    return (
        <API.Provider
            value={{
                setRowEntry,
                getMonthEntries,
            }}
        >
            {props.children}
        </API.Provider>
    );
};

export default APIProvider;
