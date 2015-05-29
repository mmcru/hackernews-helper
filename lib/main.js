var { ToggleButton } = require("sdk/ui/button/toggle");
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");
var self = require("sdk/self");
var Request = require("sdk/request").Request;

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: [self.data.url("jquery-2.1.3.min.js"), self.data.url("panel-content.js"), self.data.url("spin.min.js")],
    onHide: handleHide,
    width: 320,
	height: 320,
	contextMenu: true
});

function handleHide() {
    button.state('window', {checked: false});
};

function checkHn(urlToSearch){
    hnApiUrl = "http://hn.algolia.com/api/v1/search_by_date?query=" +
    urlToSearch +
    "&restrictSearchableAttributes=url&hitsPerPage=10";
    return hnApiUrl;
};

var button = ToggleButton({
    id: "hackernews-helper-button",
    label: "Hackernews Helper",
    icon: {
        "16": "./16.png",
        "32": "./32.png",
        "64": "./64.png"
    },
    onChange: function(state) {
        if (state.checked) {
            panel.show({
                position: button,
				contextMenu: true
            });
        }
    },
    disabled: true
});


tabs.on('open', function () {
	button.state('window', {checked: false});
	button.disabled = true;
	button.badge = "?";
});


var apiRequest = function() {
	searchApiRequest = Request({
		url: checkHn(tabs.activeTab.url),
		onComplete: function(response){

			//show # of results on button
			if (response.json.nbHits < 10000) {
				button.badge = response.json.nbHits;
			};
			if (response.json.nbHits >= 10000) {
				button.badge = "*";
			};
			
			//send data to panel content script(s)
			if (response.json.nbHits > 0) {
				
				button.badgeColor = "#FF0000";
				
				//send the hits and the page url over to the content script				
				var responseDict = {
					hits: response.json.hits,
					url: tabs.activeTab.url,
					nbHits: response.json.nbHits,
					nbPages: response.json.nbPages,
				};
				
				panel.port.emit("searchHitsDict", responseDict);
				button.disabled = false;
				
				//resize panel according to number of hits
				//according to http://jsperf.com/performance-of-assigning-variables-in-javascript, if/else is the fastest way to assign variables (Firefox 38.0 32-bit on Windows NT 6.3 64-bit)
				if (response.json.nbHits === 1) {
					panel.height = 140;
				}
				else if (response.json.nbHits === 2) {
					panel.height = 200;
				}
				else if (response.json.nbHits === 3) {
					panel.height = 260;
				}
				else {
					panel.height = 320;
				};
			}
			else {
				panel.height = 60;
				titleAndUrlForPanel = {
					url: tabs.activeTab.url,
					title: tabs.activeTab.title
				};
				panel.port.emit("noHits", titleAndUrlForPanel);
				button.disabled = false;
				button.badgeColor = "#00CC00";
			};
			
		}
	});
	searchApiRequest.get()
}


tabs.on('activate', function () {
	apiRequest();
	button.disabled = true;
	button.badge = "?";
	panel.hide();
});


tabs.on('ready', function() {
	apiRequest();
    button.disabled = true;
	button.badge = "?";
	panel.hide();
});

