loadBreadcrumbScript();
function loadBreadcrumbScript() {
    // Don't show on mobile (spm added)
    if(/Android|iPhone/i.test(navigator.userAgent)){return;}

initiliaze();

var debugMode = false;

function initiliaze() { /*removes any residual instances of breadcrumb feature*/
    window.removeEventListener("hashchange", timedFunction);
    document.removeEventListener("keydown", hotKeyEvent);
    var elem = document.querySelector('#recentLinks');
    var btn = document.querySelector('#closeCrumbs');
    if(elem != null) { elem.parentNode.removeChild(elem); }
    if(btn != null) { btn.parentNode.removeChild(btn); }
}

//#recentLinks div to hold breadcrumbs
var breadCrumbDiv = document.createElement('div'); // #recentLinks div to hold breadcrumbs
breadCrumbDiv.id = 'recentLinks';
var topBarDiv = document.getElementsByClassName("roam-topbar")[0];
topBarDiv.appendChild(breadCrumbDiv); //put it in the topbar div for z-index purposes
window.addEventListener("hashchange", timedFunction);

//div + button to stop/start listener, & show/hide breadcrumbs
var toggleDiv = document.createElement('div');
toggleDiv.id = 'closeCrumbs';
topBarDiv.appendChild(toggleDiv);

var toggleButton = document.createElement("button");
toggleButton.id = 'buttonLayer';
toggleButton.className = 'bcShow';
toggleButton.innerHTML = "‣";
toggleDiv.appendChild(toggleButton);
toggleButton.onclick = turnOnOff;

var maxLinks = 7;
var urlArray = [];
var linksArray = [];
var todayArray = [];
var arrayToLoad = [];
var bFoundToday = false;
var bSkipToday = false;
var onOff = true;
var n = 0;
//this function flips the toggle switch, then shows/hides the breadcrumbs and adds/removes listener
function turnOnOff() {
    onOff = !onOff;
    if (!onOff) {
        breadCrumbDiv.style.display = 'none';
        toggleButton.className = 'bcHidden';
        window.removeEventListener("hashchange", timedFunction);
    } else {
        breadCrumbDiv.style.display = 'block';
        toggleButton.className = 'bcShow';
        window.addEventListener("hashchange", timedFunction);
    }
}

//getTodays date
function getTodayDate() {
    var phToday = new Date(new Date().getFullYear(),new Date().getMonth() , new Date().getDate())
    return (Date.parse(phToday))
}

//Convert string to date
function convertToDate(dateString) {
    var origDateString = dateString
    var newDateString = origDateString.trim().split("[").join("").split("]").join("").replace("#","")
    newDateString = newDateString.replace("st,",",").replace("rd,",",").replace("th,",",").replace("nd,",",")
    var foundDate = Date.parse(newDateString)
    return foundDate
}

//had to delay function for adding breadcrumbs to give page time to load
function timedFunction() {
    setTimeout(addPageToRecent, 150)
}

function addPageToRecent() {
    var pageUrl = window.location.href; //Gets the URL of the page
    bSkipToday = false;
    if(bFoundToday){if(todayArray[1] == pageUrl){bSkipToday = true}} //Skip if it is today's page since we already pin it to end
    if(debugMode){console.log(pageUrl)}
    if(bSkipToday)
    {
        addLinkElement(pageUrl);
    }
    else
    {
        if (urlArray.slice(0).includes(pageUrl) == false) { //checks if the link already exists
            addLinkElement(pageUrl);
        }
        else {
            var index = urlArray.indexOf(pageUrl);
            urlArray.splice(index, 1); //Remove 1 item from urlArray
            linksArray.splice(index, 1); //Remove 1 item from linksArray
            addLinkElement(pageUrl);
        }
    }
}

function addLinkElement(pageUrl) {
    if(bSkipToday)
    {
        createLinkElement(null, pageUrl, 3);
    }
    else
    {
        var parent = document.getElementsByClassName("rm-title-display")[0]; //snags the page title
        if(debugMode){console.log(parent)}
        if(pageUrl == 'https://roamresearch.com/#/app/samdynamics') { //checks if they are on daily notes page
            createLinkElement(parent, pageUrl, 0);
        }
        else if(parent != null) {  // gets page name if not on daily pages
            var children = parent.children[0];
            createLinkElement(children, pageUrl, 1);
        }
        else { // checks if the user is zoomed into a bullet
            var parent = document.getElementsByClassName("zoom-path-view")[0];
            var children = parent.children[0].children[0].children[0];
            createLinkElement(children, pageUrl, 2);
        }
    }
}

function createLinkElement(children, pageUrl, urlCase) {
    if(debugMode){console.log(children)}
    if(debugMode){console.log(pageUrl)}
    if(debugMode){console.log(urlCase)}
    if(debugMode){console.log(urlArray)}
    if(debugMode){console.log(linksArray)}
    if(debugMode){console.log(todayArray)}

    if(!bSkipToday)
    {
        var lastNine = pageUrl.substr(pageUrl.length - 9); //Get last 9 characters of page name to use as ID since it is ID of page in URL
        if(urlCase == 0) {var innerChild = "<span style='color: #FF5E00;'>✹</span> Daily Notes" }
        else if(urlCase == 1) { var innerChild = children.innerText.substring(0, 25) }
        else if(urlCase == 2) { var innerChild =  "<span style='color: #0D9BDB;'>🞇</span> " + children.innerText.substring(0, 20) }
        var linkElement = "<a id='" + lastNine + "' href='" + pageUrl + "' class='recentLink' style='padding: 0 10px;'>" + innerChild + "</a>"; //adds <a> element to array, maximum 25 chars, increase substring size if you wish
        var bThisIsToday = false

        if(bFoundToday == false && urlCase == 1)
        {
            if(convertToDate(innerChild) == getTodayDate())
            {
                var linkElementToday = "<a id='" + 'todayDate' + "' href='" + pageUrl + "' class='recentLink' style='padding: 0 10px;'>" + innerChild + "</a>";
                bFoundToday = true;
                bThisIsToday = true
                todayArray.push(linkElementToday);
                todayArray.push(pageUrl);
            }
        }

        if(bThisIsToday == false)
        {
            urlArray.unshift(pageUrl); //Unshift adds item to start of array
            linksArray.unshift(linkElement);
        }
    }

    linksArray = linksArray.slice(0, maxLinks); //reduces the array to 7 link max, increase if you wish
    urlArray = urlArray.slice(0, maxLinks);

    //if you assign an array to another variable and modify that variable's array elements, the original array is also modified.
        //So instead you can use the slice() method which copies them as a new array and their own values (instead of references)
        //https://www.dyn-web.com/javascript/arrays/value-vs-reference.php
    arrayToLoad = linksArray.slice(0);

    if(bFoundToday)
    {
        arrayToLoad.push(todayArray[0]);
    }

    if(!bSkipToday)
    {
        breadCrumbDiv.innerHTML = arrayToLoad.slice(1).join("‣"); //puts the <a> array into the breadCrumbDiv; don't show first one as current page
    }
    else
    {
        breadCrumbDiv.innerHTML = arrayToLoad.slice(0).join("‣"); //puts the <a> array into the breadCrumbDiv; show first one as well since today page already pinned
    }
    
    var linkElements = document.getElementsByClassName("recentLink");
    for(i=0; i<linkElements.length; i++){
        var linkNumber = "<span style='color: #0087FF; padding-right: 3px;' class='linkNumber'>" + (i+1).toString() + "</span>";
        linkElements[i].innerHTML = linkNumber + linkElements[i].innerHTML;
    }
    if(debugMode){console.log(urlArray)}
    if(debugMode){console.log(linksArray)}
    if(debugMode){console.log(todayArray)}
    if(debugMode){console.log(linkElements)}
}

window.addEventListener ("keyup", hotKeyEvent);

function hotKeyEvent(zEvent) {
    // changed/fixed by shawn as had alt and ctrl key as OR and wasn't in parentheses //
    if (zEvent.altKey  &&  zEvent.key === "1") { clickLink(1); }
    if (zEvent.altKey  &&  zEvent.key === "2") { clickLink(2); }
    if (zEvent.altKey  &&  zEvent.key === "3") { clickLink(3); }
    if (zEvent.altKey  &&  zEvent.key === "4") { clickLink(4); }
    if (zEvent.altKey  &&  zEvent.key === "5") { clickLink(5); }
    if (zEvent.altKey  &&  zEvent.key === "6") { clickLink(6); }
    if (zEvent.altKey  &&  zEvent.key === "7") { clickLink(7); }
    if (zEvent.altKey  &&  zEvent.key === "8") { clickLink(8); }
    if (zEvent.altKey  &&  zEvent.key === "w" && arrayToLoad.length > 0) { clickLink(-99); }
    if (zEvent.altKey  &&  zEvent.key === "o" && arrayToLoad.length > 0) { clickLink(99); }
}

function clickLink(n) {
    if(n == 99)
    {
        n = arrayToLoad.length-1
    }
    else
    {
        if(bSkipToday)
        {
            if(n == -99){n = 0}else{n = n-1}
        }
        else
        {
            if(n == -99){n = 1}
        }
    }

    var linkToClick = arrayToLoad[n];
    if(linkToClick != null) {
        var linkId = linkToClick.substring(7, 16)
        var someLink = document.getElementById(linkId);
        simulateClick(someLink);
    }
}

var simulateClick = function (elem) {
	// Create our event (with options)
	var evt = new MouseEvent('click', {
		bubbles: true,
		cancelable: true,
		view: window
	});
	// If cancelled, don't dispatch our event
	var canceled = !elem.dispatchEvent(evt);
};

//Load the first time so the current page gets added to the breadcrumbs
if(debugMode){console.log('loaded first time')}
timedFunction()
};
