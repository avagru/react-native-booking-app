
export function getDateString(date: Date = new Date()) : string {
    const delimiter = '-';
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    return month + delimiter + day + delimiter + year;
}

export function getTimeString(date: Date = new Date()) : string {
    let hh = date.getHours();
    let ampm = hh >= 12 ? 'PM' : 'AM';
    if (hh >= 12) { hh = hh - 12; }
    let H = hh <10 ? '0' + hh : hh;
    let mm = date.getMinutes();
    let M = mm <10 ? '0' + mm : mm;
    return H + ':' + M + ' ' + ampm;
}

