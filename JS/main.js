//console.log('hello world!')

const CONN_IP = '127.0.0.1:8080'

var TAB_TITLES = {'Seasons': 'Seasons',
				   'GrandPrix': 'Grand Prix',
				   'Teams': 'Teams'}
var TAB_COLOURS = {'Seasons': {main: '#d7300f', light: '#f15737'},
				   'GrandPrix': {main: '#27723c', light: '#54c474'},
				   'Teams': {main: '#066e7a', light: '#09b0c3'}}


const baseRequest = {'type': 'url',
                     'base': 'http://ergast.com/api',
                   	 'series': 'f1',
                   	 'body': '',
                   	 'format': 'json',
                   	 'limit': '0',
                   	 'offset': '0'}

var timeline = null

function serverComm (commandIn) {
    let r = {'type': 'command', command: commandIn}
    fetch(CONN_IP, {method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(r)})
}


function clicku () {
    //let o = {'can':'i get a response pls?'}
    let request = baseRequest
	request.body = 'seasons'

    fetch(CONN_IP, {method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(request)})
        .then(r => r.json())
        .then(t => console.log(t.MRData.total))
}

function initPage () {
    document.getElementById('tlc_Seasons').style.borderRightColor = TAB_COLOURS['Seasons'].main
    document.getElementById('tlc_GrandPrix').style.borderRightColor = TAB_COLOURS['GrandPrix'].main
    document.getElementById('tlc_Teams').style.borderRightColor = TAB_COLOURS['Teams'].main
    
	document.getElementById('displayHolder').style.backgroundColor = TAB_COLOURS['Seasons'].light
    
	//document.getElementsByClassName('line')[0].style.backgroundColor = red
	initSeasons()
}

async function initSeasons () {
    let request = baseRequest
	request.body = 'seasons'
	
	request.limit = await fetch(CONN_IP, {method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(request)})
        .then(r => r.json())
        .then(t => t.MRData.total)
	
	let data = await fetch(CONN_IP, {method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(request)})
        .then(r => r.json())
        //.then(t => t)
	//console.log(data)
	data = data.MRData.SeasonTable.Seasons
	let years = []
	for (let i in data) years.push(data[i].season)
	//console.log(years)
	
	if (document.getElementById('timeline')) {
		timeline = new Timeline('timeline', years)
		timeline.init()
	}
	
}

function switchTab (evt, tabName) {
	
    let tabContent, tabLinks, tabLinkContainers, contentTitle
	
	// Get all elements with class="tabContent" and hide them
	tabContent = document.getElementsByClassName('tabContent')
	for (let x of tabContent) x.style.display = 'none'
	
	// Get all elements with class="tabLinks" and remove the class "active"
	tabLinks = document.getElementsByClassName('tabLinks')
	for (let x of tabLinks) x.className = x.className.replace(' active', '')
	
	tabLinkContainers = document.getElementsByClassName('tabLinkContainers')
	for (let x of tabLinkContainers) x.className = x.className.replace(' active', '')
	
	// Show the current tab and add an "active" class to the link that opened the tab.
	document.getElementById(tabName).style.display = 'block'
	document.getElementById('tlc_' + tabName).className += ' active'
	//console.log(evt)
	evt.currentTarget.className += ' active'
	
	contentTitle = document.getElementById('contentHeader_title')
	contentTitle.innerHTML = TAB_TITLES[tabName]
    contentTitle.style.borderBottomColor = TAB_COLOURS[tabName].light
    contentTitle.parentElement.style.borderBottomColor = TAB_COLOURS[tabName].main
    document.getElementById('sidebar_header').style.borderColor = TAB_COLOURS[tabName].main
    document.getElementsByClassName('sidebar')[0].style.borderColor = TAB_COLOURS[tabName].light
}

function click_ChangeYear () {
	let dh = document.getElementById('displayHolder'),
		tl = document.getElementById('timeline'),
		yr = document.getElementsByClassName('year')
	
//	setTimeout(() => {tl.style.display = 'block'}, 1000)
	tl.style.top = '38px'
//	tl.style.height = '0'
	dh.style.height = 'calc(70vh - 38px)'
	//tl.style.transition = 'height 1s'
	tl.style.height = '30vh'
	for (let i of yr) i.style.opacity = '1'
}

function season_selectYear (year) {
	let dh = document.getElementById('displayHolder'),
		yd = document.getElementById('yearDisplay'),
		cy = document.getElementById('changeYear'),
		tl = document.getElementById('timeline'),
		yr = document.getElementsByClassName('year')
	
	yd.innerHTML = year
	yd.style.opacity = '1'
	cy.style.opacity = '1'
	
	for (let i of yr) i.style.opacity = '0'
	tl.style.height = '0vh'
	setTimeout(() => {tl.style.top = '-500px'}, 1000)
	dh.style.height = 'calc(100vh - 38px)'
}

document.getElementById('defaultOpen').click()

initPage()
