import { useState, useEffect, useContext, useCallback } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useForceUpdate from "./hooks/useForceUpdate";

import LeftIcon from "./resources/icons/left.svg";
import RightIcon from "./resources/icons/right.svg";
import LogoIcon from "./resources/icons/logo.svg";

import { API } from "./contexts/API";
import { Data } from "./contexts/Data";
import useAutoResetState from "./hooks/useAutoResetState";

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export default function App() {
    const { setRowEntry, getMonthEntries } = useContext(API);
    const { rowHistoric } = useContext(Data);

    const forceUpdate = useForceUpdate();

    // #################################################
    //   ERROR
    // #################################################

    const [error, setError] = useState("");
    const [errorStyleActive, setErrorStyleActive] = useAutoResetState(false, 2000);

    useEffect(() => {
        if (error) setErrorStyleActive(true);
    }, [error, setErrorStyleActive]);

    useEffect(() => {
        if (!errorStyleActive) setTimeout(() => setError(""), 200);
    }, [errorStyleActive]);

    // #################################################
    //   POPUP
    // #################################################

    const [changeData, setChangeData] = useState({ year: -1, month: -1, day: -1, newValue: false });
    const [popup, setPopup] = useState({ text: "-", button1: "-", button2: "-" });

    // #################################################
    //   LOAD DATA
    // #################################################

    const [date, setDate] = useState({ month: -1, year: -1 });
    const [firstWeekDisplacement, setFirstWeekDisplacement] = useState(0);

    const getData = useCallback(
        async (date) => {
            const { month, year } = date;
            if (month < 0 || year < 0) return;

            const firstDay = new Date();
            firstDay.setMonth(month - 1);
            firstDay.setYear(year);
            firstDay.setDate(1);
            var weekDay = firstDay.getDay() - 1;
            if (weekDay === -1) weekDay = 6;
            setFirstWeekDisplacement(weekDay);

            await getMonthEntries(month, year);
            forceUpdate();
        },

        // eslint-disable-next-line
        [getMonthEntries]
    );

    useEffect(() => {
        getData(date);
    }, [date, getData]);

    useEffect(() => {
        const date = new Date();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();

        setDate({ month, year });
    }, []);

    // #################################################
    //   HANDLERS
    // #################################################

    const prevMonth = () => {
        setDate(({ month: prevMonth, year: prevYear }) => {
            if (prevMonth === 1) return { month: 12, year: prevYear - 1 };
            else return { month: prevMonth - 1, year: prevYear };
        });
    };

    const nextMonth = () => {
        setDate(({ month: prevMonth, year: prevYear }) => {
            if (prevMonth === 12) return { month: 1, year: prevYear + 1 };
            else return { month: prevMonth + 1, year: prevYear };
        });
    };

    const setRowToday = async () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const result = await setRowEntry(true, year, month, day);

        if ("error" in result) setError(result.error);
        else {
            rowHistoric.current[year][month + 1][day - 1] = true;
            forceUpdate();
        }
    };

    const changeDayValue = (year, month, day, newValue) => {
        setChangeData({ year, month, day, newValue });

        if (newValue) setPopup({ text: `Did you row on ${MONTHS[month]} ${day} ?`, button1: "Yes", button2: "No" });
        else setPopup({ text: `Remove row entry for ${MONTHS[month]} ${day} ?`, button1: "Yes", button2: "No" });
    };

    const onButton1 = async () => {
        const { year, month, day, newValue } = changeData;
        const result = await setRowEntry(newValue, year, month, day);

        if ("error" in result) setError(result.error);
        else {
            rowHistoric.current[year][month + 1][day - 1] = newValue;
            forceUpdate();
        }

        setChangeData({ year: -1, month: -1, day: -1, newValue: false });
    };

    const onButton2 = () => {
        setChangeData({ year: -1, month: -1, day: -1, newValue: false });
    };

    // #################################################
    //   RENDER
    // #################################################

    var emptyDaysStart = [];
    for (let i = 0; i < firstWeekDisplacement; i++) emptyDaysStart.push(i);

    var numEmptyDaysEnd =
        rowHistoric.current && date.year in rowHistoric.current && date.month in rowHistoric.current[date.year]
            ? firstWeekDisplacement + rowHistoric.current[date.year][date.month].length
            : firstWeekDisplacement;

    var emptyDaysEnd = [];
    for (let i = numEmptyDaysEnd; i < 37; i++) emptyDaysEnd.push(i);

    const today = new Date();
    const currMonth = today.getMonth() + 1;
    const currYear = today.getFullYear();
    const currDay = today.getDate();

    const rowedToday =
        currYear in rowHistoric.current &&
        currMonth in rowHistoric.current[currYear] &&
        currDay - 1 in rowHistoric.current[currYear][currMonth] &&
        rowHistoric.current[currYear][currMonth][currDay - 1];

    return (
        <div className="App">
            <div className="historic">
                <div className="monthSelector">
                    <SVG
                        className={cn("icon", { disabled: date.month === 1 && date.year === 2020 })}
                        src={LeftIcon}
                        onClick={prevMonth}
                    ></SVG>
                    <h2>
                        {MONTHS[date.month - 1]} <span>{date.year}</span>
                    </h2>
                    <SVG
                        className={cn("icon", { disabled: currMonth === date.month && currYear === date.year })}
                        src={RightIcon}
                        onClick={nextMonth}
                    ></SVG>
                </div>

                <div className="calendar">
                    {emptyDaysStart.map((_, i) => (
                        <div className="day hidden" key={`empty_${i}`}>
                            <div className="box"></div>
                        </div>
                    ))}

                    {rowHistoric.current &&
                        date.year in rowHistoric.current &&
                        date.month in rowHistoric.current[date.year] &&
                        rowHistoric.current[date.year][date.month].map((elem, i) => {
                            if (!elem)
                                return (
                                    <div
                                        className="day"
                                        key={i}
                                        onClick={() => changeDayValue(date.year, date.month - 1, i + 1, true)}
                                    >
                                        <div className="box">{i + 1}</div>
                                    </div>
                                );

                            return (
                                <div
                                    className="day"
                                    key={i}
                                    onClick={() => changeDayValue(date.year, date.month - 1, i + 1, false)}
                                >
                                    <div className="box">
                                        <div className="rowDay">{i + 1}</div>
                                    </div>
                                </div>
                            );
                        })}

                    {emptyDaysEnd.map((_, i) => (
                        <div className="day hidden" key={`empty_${i}`}>
                            <div className="box"></div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={cn("popup", { active: changeData.year > 0 && popup.text !== "-" })}>
                <p>{popup.text}</p>
                <div className="buttons">
                    <div className="button" onClick={onButton2}>
                        <div className="text">{popup.button2}</div>
                    </div>
                    <div className="button high" onClick={onButton1}>
                        <div className="text high">{popup.button1}</div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className={cn("circle", { rowedToday })} onClick={setRowToday}>
                    <SVG className="logo" src={LogoIcon}></SVG>
                </div>
                <div className={cn("error", { active: errorStyleActive })}>{error || "-"}</div>
            </div>
        </div>
    );
}
