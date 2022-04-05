import { createContext, useRef } from "react";

const APP_NAME = "rowtine";

export const Data = createContext();
const DataProvider = (props) => {
    const rowHistoric = useRef({});

    return (
        <Data.Provider
            value={{
                APP_NAME,
                rowHistoric,
            }}
        >
            {props.children}
        </Data.Provider>
    );
};

export default DataProvider;
