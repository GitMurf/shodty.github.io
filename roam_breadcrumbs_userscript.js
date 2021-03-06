// ==UserScript==
// @name         Roam Breadcrumbs
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       shodty
// @match        https://roamresearch.com/
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    initiliaze();

    function initiliaze() { /*removes any residual instances of breadcrumb feature*/
        window.removeEventListener("hashchange", timedFunction);
        document.removeEventListener("keydown", hotKeyEvent);
        let elem = document.querySelector('#recentLinks');
        let btn = document.querySelector('#closeCrumbs');
        if(elem != null) { elem.parentNode.removeChild(elem); }
        if(btn != null) { btn.parentNode.removeChild(btn); }
    }

    //#recentLinks div to hold breadcrumbs
    let breadCrumbDiv = document.createElement('div'); // #recentLinks div to hold breadcrumbs
    breadCrumbDiv.id = 'recentLinks';
    breadCrumbDiv.style.position = 'absolute';
    breadCrumbDiv.style.left = '228px';
    breadCrumbDiv.style.height = '45px';
    breadCrumbDiv.style.padding = '10px';
    let topBarDiv = document.getElementsByClassName("roam-topbar")[0];
    topBarDiv.appendChild(breadCrumbDiv); //put it in the topbar div for z-index purposes
    window.addEventListener("hashchange", timedFunction);

    //div + button to stop/start listener, & show/hide breadcrumbs
    let toggleDiv = document.createElement('div');
    toggleDiv.id = 'closeCrumbs';
    toggleDiv.style.position = 'absolute';
    toggleDiv.style.left = '212px';
    toggleDiv.style.height = '45px';
    toggleDiv.style.padding = '10px';
    topBarDiv.appendChild(toggleDiv);

    let toggleButton = document.createElement("button");
    toggleButton.id = 'buttonLayer';
    toggleButton.style.border = '0';
    toggleButton.style.color = 'green';
    toggleButton.style.fontSize = '24px';
    toggleButton.innerHTML = "‣";
    toggleDiv.appendChild(toggleButton);
    toggleButton.onclick = turnOnOff;

    let urlArray = [];
    let linksArray = [];
    let onOff = true;
    let n = 0;
    //this function flips the toggle switch, then shows/hides the breadcrumbs and adds/removes listener
    function turnOnOff() {
        onOff = !onOff;
        if (!onOff) {
            breadCrumbDiv.style.display = 'none';
            toggleButton.style.color = 'grey';
            window.removeEventListener("hashchange", timedFunction);
        } else {
            breadCrumbDiv.style.display = 'block';
            toggleButton.style.color = 'green';
            window.addEventListener("hashchange", timedFunction);
        }
    }

    //had to delay function for adding breadcrumbs to give page time to load
    function timedFunction() {
        setTimeout(addPageToRecent, 150)
    }

    function addPageToRecent() {
        let pageUrl = window.location.href; //snags the url for said page
        if (urlArray.slice(0, 8).includes(pageUrl) == false) { //checks if the link already exists in the last 5 links
            addLinkElement(pageUrl);
        }
        else {
            let index = urlArray.indexOf(pageUrl);
            urlArray.splice(index, 1);
            linksArray.splice(index, 1);
            addLinkElement(pageUrl);
        }
    }

    function addLinkElement(pageUrl) {
        let parent = document.getElementsByClassName("rm-title-display")[0]; //snags the page title
        if(pageUrl == 'https://roamresearch.com/#/app/shodty') {
            createLinkElement(parent, pageUrl, 0);
        }
        if(parent != null) {
            let children = parent.children[0];
            createLinkElement(children, pageUrl, 1);
        }
        else {
            let parent = document.getElementsByClassName("zoom-path-view")[0];
            let children = parent.children[0].children[0].children[0];
            createLinkElement(children, pageUrl, 2);
        }
    }

    function createLinkElement(children, pageUrl, urlCase) {
        let innerChild = '';
        let lastNine = pageUrl.substr(pageUrl.length - 9);
        if(urlCase == 0) {let innerChild = "<span style='color: #FF5E00;'>✹</span> Daily Notes" }
        else if(urlCase == 1) { let innerChild = children.innerHTML.substring(0, 25) }
        else if(urlCase == 2) { let innerChild = "<span style='color: #0D9BDB;'>🞇</span> " + children.innerHTML.substring(0, 20) }
        let linkElement = "<a id='" + lastNine + "' href='" + pageUrl + "' class='recentLink' style='padding: 0 10px;'>" + innerChild + "</a>"; //adds <a> element to array, maximum 25 chars, increase substring size if you wish
        urlArray.unshift(pageUrl);
        linksArray.unshift(linkElement);
        linksArray = linksArray.slice(0, 8); //reduces the array to to 5 link max, in crease if you wish
        breadCrumbDiv.innerHTML = linksArray.slice(1, 8).join("‣"); //puts the <a> array into the breadCrumbDiv
        let linkElements = document.getElementsByClassName("recentLink");
        for(let i=0; i<linkElements.length; i++){
            let linkNumber = "<span style='color: #FFFFFF; padding-right: 3px;' class='linkNumber'>" + (i+1).toString() + "</span>";
            linkElements[i].innerHTML = linkNumber + linkElements[i].innerHTML;
        }
    }

    window.addEventListener ("keyup", hotKeyEvent);

    function hotKeyEvent(zEvent) {
        if (zEvent.ctrlKey && zEvent.key === "2") { clickLink(2); }
        if (zEvent.ctrlKey && zEvent.key === "3") { clickLink(3); }
        if (zEvent.ctrlKey && zEvent.key === "4") { clickLink(4); }
        if (zEvent.ctrlKey && zEvent.key === "5") { clickLink(5); }
        if (zEvent.ctrlKey && zEvent.key === "6") { clickLink(6); }
        if (zEvent.ctrlKey && zEvent.key === "7") { clickLink(7); }
        if (zEvent.ctrlKey && zEvent.key === "1") { clickLink(1); }
    }

    function clickLink(n) {
        let linkToClick = linksArray[n];
        if(linkToClick != null) {
            let linkId = linkToClick.substring(7, 16)
            let someLink = document.getElementById(linkId);
            simulateClick(someLink);
        }
    }

    let simulateClick = function (elem) {
        // Create our event (with options)
        let evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        // If cancelled, don't dispatch our event
        let canceled = !elem.dispatchEvent(evt);
    };

})();