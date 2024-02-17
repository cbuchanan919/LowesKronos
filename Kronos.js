const calStart = `BEGIN:VCALENDAR
CALSCALE:GREGORIAN
PRODID:-//Apple Inc.//macOS 13.6.3//EN
VERSION:2.0
X-APPLE-CALENDAR-COLOR:#FF2D55
X-WR-CALNAME:LowesImport
BEGIN:VTIMEZONE
TZID:America/New_York
BEGIN:DAYLIGHT
DTSTART:20070311T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU
TZNAME:EDT
TZOFFSETFROM:-0500
TZOFFSETTO:-0400
END:DAYLIGHT
BEGIN:STANDARD
DTSTART:20071104T020000
RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU
TZNAME:EST
TZOFFSETFROM:-0400
TZOFFSETTO:-0500
END:STANDARD
END:VTIMEZONE`
const calEnd = `END:VCALENDAR`
const calEvent = (start, end) => {
return `BEGIN:VEVENT
CREATED:${getIcsStr(start)}Z
DTEND;TZID=America/New_York:${getIcsStr(end)}
DTSTAMP:${getIcsStr(new Date())}Z
DTSTART;TZID=America/New_York:${getIcsStr(start)}
LAST-MODIFIED:${getIcsStr(new Date())}Z
LOCATION:Lowe's\\n230 E Hanover Ave\, Morris Plains\, NJ  07950\, United 
    States
SEQUENCE:0
SUMMARY:Lowes 
TRANSP:OPAQUE
X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-APPLE-MAPKIT-HANDLE=CAES6QEaEgka
    Epyfh2hEQBH9HNWfM55SwCKMAQoNVW5pdGVkIFN0YXRlcxICVVMaCk5ldyBKZXJzZXkiAk5K
    Kg1Nb3JyaXMgQ291bnR5Mg1Nb3JyaXMgUGxhaW5zOgUwNzk1MEIMQ2VkYXIgS25vbGxzUg1F
    IEhhbm92ZXIgQXZlWgMyMzBiETIzMCBFIEhhbm92ZXIgQXZligEMQ2VkYXIgS25vbGxzKgZM
    b3dlJ3MyETIzMCBFIEhhbm92ZXIgQXZlMhhNb3JyaXMgUGxhaW5zLCBOSiAgMDc5NTAyDVVu
    aXRlZCBTdGF0ZXNQAQ==;X-APPLE-RADIUS=0;X-TITLE="Lowe's\\n230 E Hanover Ave
    , Morris Plains, NJ  07950, United States":geo:40.816639,-74.471901
BEGIN:VALARM
ACTION:DISPLAY
DESCRIPTION:Reminder
TRIGGER:-PT1H
END:VALARM
END:VEVENT`;
}



// init
const iframe = document.getElementsByClassName("krn-widget-iframe-wrapper")[0].childNodes[0]; 
const innerDoc = iframe.contentDocument || iframe.contentWindow.document; 
innerDoc.oncontextmenu = null;

// returns same date with updated time.
function getTime(date, timeStr){
    let log = timeStr;
    timeStr = timeStr.trim().toLowerCase();
    let hr = timeStr.includes("p") ? 12 : 0;
    let min = 0;
    const reg = /([apm(x)])/gi
    timeStr = timeStr.replace(reg, "");
    if (timeStr.length < 3) {
        // no minutes included
        hr += parseInt(timeStr);
    } else {
        // min included
        hr += parseInt(timeStr.substring(0, timeStr.length - 2))
        min = parseInt(timeStr.substring(timeStr.length - 2))
    }
    if (hr == 24) {hr = 12;}
    log += `  hr:${hr.toString()} min:${min.toString()}`; 
    // console.log(log);
    date.setHours(hr);
    date.setMinutes(min);
    return date;
}

// returns the ics formatted date str with time
function getIcsStr(d) {
    const yr = d.getFullYear().toString();
    const mo = (d.getMonth() + 1).toString().padStart(2, "0");
    const dt = d.getDate().toString().padStart(2, "0");

    const hr = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return yr + mo + dt + "T" + hr + min + "00";
}
//   getDateStr(new Date())



function getCalDates(){
       
    let cal = innerDoc.getElementsByClassName("calendar")[0].children[0]
    const dates = [calStart];
    for (const row of cal.rows){
        for (const cell of row.cells){
            if (cell.title){
                if (cell.childNodes.length > 1){
                    let dateStr = cell.title.replace(/-/g, '\/');
                    let timeRange = cell.childNodes[1].childNodes[1].innerHTML.trim().split("-")
                    let start = getTime(new Date(dateStr), timeRange[0]);
                    let end = getTime(new Date(dateStr), timeRange[1]);
                    dates.push(calEvent(start, end)); 
                }
                
            }
        }
    }
    dates.push(calEnd);
    let result = dates.join("\n");
    // copy results from console and save to an .ics file
    console.log(result);
}
getCalDates();
