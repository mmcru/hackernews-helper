var { ToggleButton } = require("sdk/ui/button/toggle");
var tabs = require("sdk/tabs");
var panels = require("sdk/panel");
var self = require("sdk/self");
var Request = require("sdk/request").Request;

var panel = panels.Panel({
    contentURL: self.data.url("panel.html"),
    contentScriptFile: [self.data.url("jquery-2.1.3.min.js"), self.data.url("panel-content.js")],
    onHide: handleHide,
    width: 320,
    height: 200
});

function handleHide() {
    button.state('window', {checked: false});
}

function checkHn(urlToSearch){
    hnApiUrl = "http://hn.algolia.com/api/v1/search_by_date?query=" +
    urlToSearch +
    "&restrictSearchableAttributes=url&hitsPerPage=10";
    return hnApiUrl;
}

var button = ToggleButton({
    id: "hackernews-helper-button",
    label: "Hackernews Helper",
    icon: {
        "16": "./16.png",
        "32": "./32.png",
        "64": "./64.png"
    },
    onChange: function(state) {
        console.log(tabs.activeTab.url);
        console.log(checkHn(tabs.activeTab.url));
        if (state.checked) {
            panel.show({
                position: button,
				contextMenu: true
            });
        }
    }
});

tabs.on('open', function () {
	button.disabled = true;
});

tabs.on('ready', function () {
	searchApiRequest = Request({
		url: checkHn(tabs.activeTab.url),
		onComplete: function(response){

			//show # of results on button
			if (response.json.nbHits < 10000) {
				button.badge = response.json.nbHits;
			}
			else {
				button.badge = "*";
			};
			
			//send data to panel content script(s)
			if (response.json.nbHits > 0) {
				
				//send the hits and the page url over to the content script				
				var responseDict = {
					hits: response.json.hits,
					url: tabs.activeTab.url,
					nbHits: response.json.nbHits
				};
				
				//debug id
				for (var i=0; i < responseDict.hits.length; i++) {
					console.log(responseDict.hits[i].objectID);
				};
				
				panel.port.emit("searchHitsDict", responseDict);
				button.disabled = false;
				
				//resize the panel
				if (response.json.nbHits < 3) {
					panel.height = 200;
				}
				else if (response.json.nbHits < 10) {
					panel.height = 150 + 45 * response.json.nbHits;
				}
				else {
					panel.height = 550;
				};
			}
			else {
				panel.height = 60;
				titleAndUrlForPanel = {
					url: tabs.activeTab.url,
					title: tabs.activeTab.title
				}
				panel.port.emit("noHits", titleAndUrlForPanel);
				button.disabled = false;
			};
			
		}
	});
	searchApiRequest.get()
});
