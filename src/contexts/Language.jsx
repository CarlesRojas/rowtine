import { createContext, useState, useContext } from "react";
import { Utils } from "./Utils";
import { Data } from "./Data";

const LANGUAGES = {
    SPANISH: "Español",
    CATALAN: "Català",
    ENGLISH: "English",
};

const SPANISH = {
    name: "Español",
    code: "es",
    locale: "es-ES",

    // APP
};

const ENGLISH = {
    name: "English",
    code: "en",
    locale: "en-US",

    // APP
};

const CATALAN = {
    name: "Català",
    code: "ca",
    locale: "ca-ES",

    // APP
};

export const Language = createContext();
const LanguageProvider = (props) => {
    const { getCookie, setCookie } = useContext(Utils);
    const { APP_NAME } = useContext(Data);

    // #################################################
    //   LANGUAGE
    // #################################################

    const cookieLanguage = getCookie(`${APP_NAME}_lang`);
    const [text, set] = useState(
        cookieLanguage === SPANISH.code ? SPANISH : cookieLanguage === CATALAN.code ? CATALAN : ENGLISH
    );

    const setLanguage = (lang) => {
        if (lang === SPANISH.key) {
            set(SPANISH);
            setCookie(`${APP_NAME}_lang`, SPANISH.code, 365 * 100);
        } else if (lang === ENGLISH.key) {
            set(ENGLISH);
            setCookie(`${APP_NAME}_lang`, ENGLISH.code, 365 * 100);
        } else if (lang === CATALAN.key) {
            set(CATALAN);
            setCookie(`${APP_NAME}_lang`, CATALAN.code, 365 * 100);
        }
    };

    // #################################################
    //   INITIAL LOCATION
    // #################################################

    return (
        <Language.Provider
            value={{
                LANGUAGES,
                text,
                setLanguage,
            }}
        >
            {props.children}
        </Language.Provider>
    );
};

export default LanguageProvider;
