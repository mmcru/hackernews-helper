currentTabUrl = "";


//jquery in here

$(document).ready(function() {
	$(".unselected").click(function(){
		window.alert(".unselected was clicked");
		$( this ).toggleClass("sorter");
	});
});



addDateToDateField = function addDateToDateField(apiId) {
	 $.getJSON(
		"http://hn.algolia.com/api/v1/items/" + apiId,
		function(itemApi){
			$("#" + itemApi.id).append("submitted: " + (new Date(itemApi.created_at)).toLocaleDateString());
		}
	 )
 };


self.port.on("searchHitsDict", function(hitsDict) {
	
	currentTabUrl = hitsDict.url;
	
	$('body').empty();
	$('body').append("<div id='sortContainer'><div id='bydate' class='sorter selected'>by date</div><div id='byrelevance' class='sorter unselected'>by relevance</div></div>");

	for (hit in hitsDict.hits) {
		
		commentsLink = "<a href=https://news.ycombinator.com/item?id=" + hitsDict.hits[hit].objectID + " target='_blank'>  c: " + hitsDict.hits[hit].num_comments +"</a>";
		titleLink = "<a href=" + hitsDict.hits[hit].url + " target='_blank'>" + hitsDict.hits[hit].title + "</a>";
		authorLink = "<a href=" + "https://news.ycombinator.com/user?id=" + hitsDict.hits[hit].author + " target='_blank'> a: " + hitsDict.hits[hit].author + "</a>";	
		
		hitDiv = '<div class="containerDiv">' +
			'<div class="titleDiv">' + titleLink + "</div>" +
			'<div class="commentsDiv">' + commentsLink + '</div>' +
			'<div class="authorDiv">' + authorLink + '| </div>' +
			'<div class="dateDiv" id=' + hitsDict.hits[hit].objectID + '></div>'	+
			'</div>';
		
		$('body').append(hitDiv);
		
		//update date fields with more api requests
		addDateToDateField(hitsDict.hits[hit].objectID);
	}
});

self.port.on("nohits", function(titleAndUrl) {
	$('body').empty();
	submitUrl = "https://news.ycombinator.com/submitlink?u=" + 
	titleAndUrl.url + 
	"&t=" + 
	titleAndUrl.title;
	
	linkToSubmit = "<a class=submissionLink href=" + submitUrl + " target='_blank'>No matches.  Click to submit this page!</a>"

	$('body').append(linkToSubmit);
});
