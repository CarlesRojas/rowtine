import { useState, useEffect, useContext, useCallback } from "react";
import SVG from "react-inlinesvg";
import cn from "classnames";
import useForceUpdate from "../hooks/useForceUpdate";

import LeftIcon from "../resources/icons/left.svg";
import RightIcon from "../resources/icons/right.svg";

import { API } from "../contexts/API";
import { Data } from "../contexts/Data";

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

export default function Historic() {
    const { getMonthEntries } = useContext(API);
    const { rowHistoric } = useContext(Data);

    const forceUpdate = useForceUpdate();

    // #################################################
    //   LOAD DATA
    // #################################################

    const [date, setDate] = useState({ month: -1, year: -1 });
    const [firstWeekDisplacement, setFirstWeekDisplacement] = useState(0);

    console.log("historic");

    const getData = useCallback(
        async (m, y) => {
            await getMonthEntries(m, y);
            forceUpdate();
        },

        // eslint-disable-next-line
        [getMonthEntries]
    );

    useEffect(() => {
        const { month, year } = date;
        if (month < 0 || year < 0) return;

        const firstDay = new Date();
        firstDay.setMonth(month - 1);
        firstDay.setYear(year);
        firstDay.setDate(1);
        var weekDay = firstDay.getDay() - 1;
        if (weekDay === -1) weekDay = 6;
        setFirstWeekDisplacement(weekDay);

        getData(month, year);
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

    return (
        <div className="Historic">
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
                                <div className="day" key={i}>
                                    <div className="box">{i + 1}</div>
                                </div>
                            );

                        return (
                            <div className="day" key={i}>
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
    );
}
