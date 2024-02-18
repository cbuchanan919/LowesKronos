class CalEvent {
    constructor(start, end) {
        this.start = start;
        this.end = end;
        this.init = true;
    }
    getCalEvent() {
        if (this.init) {
            return `BEGIN:VEVENT
CREATED:${GetIcsStr(this.start)}Z
DTEND;TZID=America/New_York:${GetIcsStr(this.end)}
DTSTAMP:${GetIcsStr(new Date())}Z
DTSTART;TZID=America/New_York:${GetIcsStr(this.start)}
LAST-MODIFIED:${GetIcsStr(new Date())}Z
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
        return "";
    }


    GetRangeTxt() {
        return `${this.start.toLocaleString()} - ${this.end.toLocaleString()}`;
    }
}

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
END:VTIMEZONE`;
const calEnd = `END:VCALENDAR`

const foundEvents = [];


// returns same date with updated time.
function getTime(date, timeStr) {
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
    if (hr == 24) { hr = 12; }
    log += `  hr:${hr.toString()} min:${min.toString()}`;
    // console.log(log);
    date.setHours(hr);
    date.setMinutes(min);
    return date;
}

// returns the ics formatted date str with time
function GetIcsStr(d) {
    const yr = d.getFullYear().toString();
    const mo = (d.getMonth() + 1).toString().padStart(2, "0");
    const dt = d.getDate().toString().padStart(2, "0");

    const hr = d.getHours().toString().padStart(2, "0");
    const min = d.getMinutes().toString().padStart(2, "0");
    return yr + mo + dt + "T" + hr + min + "00";
}

// iterates through found events (caldayItem1) and adds them if a time range is detected
function getCalDates() {
    // init
    const iframe = document.getElementsByClassName("krn-widget-iframe-wrapper")[0].childNodes[0];
    const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
    innerDoc.oncontextmenu = null; // allows right click menu
    foundEvents.length = 0; //reset array
    let myEvents = innerDoc.getElementsByClassName("caldayItem1");
    for (myEvent of myEvents) {
        let title = myEvent.parentElement.parentElement.title;
        let dateStr = title.replace(/-/g, '\/');
        let timeRange = myEvent.innerText.trim().split("-")
        if (timeRange.length > 1) {
            // protect against entries that aren't date ranges
            let start = getTime(new Date(dateStr), timeRange[0]);
            let end = getTime(new Date(dateStr), timeRange[1]);
            foundEvents.push((new CalEvent(start, end)));
        }

    }
}

const saveFile = async (blob, suggestedName = "Lowes.ics") => {
    // Feature detection. The API needs to be supported
    // and the app not run in an iframe.
    const supportsFileSystemAccess =
        'showSaveFilePicker' in window &&
        (() => {
            try {
                return window.self === window.top;
            } catch {
                return false;
            }
        })();
    // If the File System Access API is supported…
    if (supportsFileSystemAccess) {
        try {
            // Show the file save dialog.
            const handle = await showSaveFilePicker({
                suggestedName,
            });
            // Write the blob to the file.
            const writable = await handle.createWritable();
            await writable.write(blob);
            await writable.close();
            return;
        } catch (err) {
            // Fail silently if the user has simply canceled the dialog.
            if (err.name !== 'AbortError') {
                console.error(err.name, err.message);
                return;
            }
        }
    }
    // Fallback if the File System Access API is not supported…
    // Create the blob URL.
    const blobURL = URL.createObjectURL(blob);
    // Create the `<a download>` element and append it invisibly.
    const a = document.createElement('a');
    a.href = blobURL;
    a.download = suggestedName;
    a.style.display = 'none';
    document.body.append(a);
    // Programmatically click the element.
    a.click();
    // Revoke the blob URL and remove the element.
    setTimeout(() => {
        URL.revokeObjectURL(blobURL);
        a.remove();
    }, 1000);
};

// Creates a string version of the Ics calendar (for mac calendar)
function GetCalIcsStr() {
    getCalDates();
    let cal = [];
    cal.push(calStart);
    for (myEvent of foundEvents) {
        cal.push(myEvent.getCalEvent())
    }
    cal.push(calEnd);
    return (cal.join("\n"))
}

// logs the Ics calendar to console
function LogIcsStr() {
    console.log(GetCalIcsStr());
}

// Show simple date ranges of dates found.
function showCalDates() {
    getCalDates();
    for (myEvent of foundEvents) {
        console.log(myEvent.GetRangeTxt())
    }
}

// saves displayed calendar to an ics file
function SaveIcsStr() {
    getCalDates();
    let txt = GetCalIcsStr();
    console.log(txt);
    let blob = new Blob([txt], { type: 'text/plain' });
    saveFile(blob);

}
// showCalDates();
  SaveIcsStr();
// console.log(foundEvents);
