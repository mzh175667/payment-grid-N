const moment = require('moment-timezone');
const TIME_ZONE = process.env.TIME_ZONE;

function getDate(month, year, which, dayName) {
    let startDate = moment([year, month - 1]).format('YYYY-MM-DD');

    // Clone the value before .endOf()
    let endDate = moment(startDate).endOf('month').format('YYYY-MM-DD');

    let dateList = [];
    while (startDate <= endDate) {
        dateList.push(startDate);
        let date = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
        startDate = date;
    }

    let j = 0;
    let date = '';
    for (let i = 0; i < dateList.length; i++) {
        let day = moment(dateList[i]).format('dddd');
        if (day == dayName) {
            j++;
            if (j == which) {
                date = dateList[i];
            } else if (which == 'last') {
                date = dateList[i];
            }
        }
    }

    return date;
}

async function goodFridayObserved(nYear) {
    // Get Easter Sunday and subtract two days
    var nEasterMonth = 0;
    var nEasterDay = 0;
    var nGoodFridayMonth = 0;
    var nGoodFridayDay = 0;
    var dEasterSunday;
    dEasterSunday = await easterSunday(nYear);
    nEasterMonth = dEasterSunday[0];
    nEasterDay = dEasterSunday[1];
    if (nEasterDay <= 3 && nEasterMonth == 3) {
        // Check if <= April 3rd
        switch (nEasterDay) {
            case 3:
                nGoodFridayMonth = nEasterMonth - 1;
                nGoodFridayDay = nEasterDay - 2;
                break;
            case 2:
                nGoodFridayMonth = nEasterMonth - 1;
                nGoodFridayDay = 31;
                break;
            case 1:
                nGoodFridayMonth = nEasterMonth - 1;
                nGoodFridayDay = 31;
                break;
            default:
                nGoodFridayMonth = nEasterMonth;
                nGoodFridayDay = nEasterDay - 2;
        }
    } else {
        nGoodFridayMonth = nEasterMonth;
        nGoodFridayDay = nEasterDay - 2;
    }
    nGoodFridayMonth =
        nGoodFridayMonth.toString().length == 1
            ? '0' + nGoodFridayMonth
            : nGoodFridayMonth;
    nGoodFridayDay =
        nGoodFridayDay.toString().length == 1
            ? '0' + nGoodFridayDay
            : nGoodFridayDay;
    return nYear + '-' + nGoodFridayMonth + '-' + nGoodFridayDay;
}

function easterSunday(year) {
    var f = Math.floor,
        // Golden Number - 1
        G = year % 19,
        C = f(year / 100),
        // related to Epact
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        // number of days from 21 March to the Paschal full moon
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        // weekday for the Paschal full moon
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        // number of days from 21 March to the Sunday on or before the Paschal full moon
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    return [month, day];
}

function holidayDateList(year = null) {
    return new Promise(async function (resolve, reject) {
        let dates = [];
        if (!year) {
            year = moment().tz(TIME_ZONE).format('YYYY');
        }

        // New Years Day - January 1st
        let newYearDate = year + '-01-01';
        dates.push(newYearDate);

        // 	Martin Luther King Observed - Third Monday in January
        let martinDate = await getDate(1, year, 3, 'Monday');
        dates.push(martinDate);

        // Presidents Day Observed - Third Monday in February
        let presidentDate = await getDate(2, year, 3, 'Monday');
        dates.push(presidentDate);

        // 	Good Friday Observed
        let goodFDate = await goodFridayObserved(year);
        dates.push(goodFDate);

        // 	Memorial Day Observed - Last Monday in May - check
        let memorialDate = await getDate(5, year, 'last', 'Monday');
        dates.push(memorialDate);

        // Independence Day - July 4th
        let independenceDate = year + '-07-04';
        dates.push(independenceDate);

        // 	Labor Day Observed - The first Monday in September
        let laborDate = await getDate(9, year, 1, 'Monday');
        dates.push(laborDate);

        // 	Columbus Day Observed - Second Monday in October
        let columbusDate = await getDate(10, year, 2, 'Monday');
        dates.push(columbusDate);

        // Veterans Day Observed - November 11th
        let veteransDate = year + '-11-11';
        dates.push(veteransDate);

        // Thanksgiving Observed - fourth Thursday in November
        let thanksDate = await getDate(11, year, 4, 'Thursday');
        dates.push(thanksDate);

        // 	Christmas Day - December 25th
        let christmasDate = year + '-12-25';
        dates.push(christmasDate);

        resolve(dates);
    });
}

module.exports = {
    holidayDateList: holidayDateList,
};
