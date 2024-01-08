let iframe = document.getElementsByClassName("krn-widget-iframe-wrapper")[0].childNodes[0]; 
var innerDoc = iframe.contentDocument || iframe.contentWindow.document; 
innerDoc.oncontextmenu = null;
let cal = innerDoc.getElementsByClassName("calendar")[0].children[0]
const dates = new Map();
for (const row of cal.rows){
    for (const cell of row.cells){
        if (cell.title){
			if (cell.childNodes.length > 1){
                let date = cell.title;
                dates[date] = cell.childNodes[1].childNodes[1].innerHTML.trim();    
            }
            
        }
    }
}
console.log(dates);
