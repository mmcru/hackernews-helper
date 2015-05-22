function byCommentCount(a,b) {
  if (a.num_comments < b.num_comments)
    return 1;
  if (a.num_comments > b.num_comments)
    return -1;
  return 0;
};


/* $(document).ready(function() {
	sortable = [];
}); */

addDateToDateField = function addDateToDateField(apiId) {
	 $.getJSON(
		"http://hn.algolia.com/api/v1/items/" + apiId,
		function(itemApi){
			$("#" + itemApi.id).empty();
			$("#" + itemApi.id).append("submitted: " + (new Date(itemApi.created_at)).toLocaleDateString());
		}
	 )
};


//blank array for sorting json results by comment
var sortable = [];
var commentFilter = 1;


//this function only exists to modify "sortable"
sortByComments = function sortByComments(hits) {
	
	sortable = [];
	
	for (var hit=0; hit < hits.length; hit++) {
		sortable.push({
			objectID: hits[hit].objectID,
			num_comments: hits[hit].num_comments,
			title: hits[hit].title,
			url: hits[hit].url,
			author: hits[hit].author,
		});
	};
	sortable.sort(byCommentCount);
};


hitsToHtml = function hitsToHtml(hits) {
	
	for (var hit=0; hit < hits.length; hit++) {
		
		commentsLink = "<a href=https://news.ycombinator.com/item?id=" + hits[hit].objectID + "target='_blank'>" + hits[hit].num_comments +"</a>";
		titleLink = "<a href=" + hits[hit].url + " target='_blank'>" + hits[hit].title + "</a>";
		authorLink = "<a href=" + "https://news.ycombinator.com/user?id=" + hits[hit].author + " target='_blank'> a: " + hits[hit].author + "</a>";
		
		hitDiv = '<div class="containerDiv">' +
			'<div class="titleDiv">' + titleLink + "</div>" +
			'<div class="commentsDiv">' + commentsLink + '</div>' +
			'<div class="authorDiv">' + authorLink + '| </div>' +
			'<div class="dateDiv" id=' + hits[hit].objectID + '>fetching date...</div>'	+
			'</div>';
		
		$('#biggerContainerDiv').append(hitDiv);
		
		//update date fields with more api requests
		addDateToDateField(hits[hit].objectID);
	};
	
};


recursiveQueryPlusAppend = function (url) {
	
	$.getJSON(
		url,
		function(results) {
			
			$("#biggerContainerDiv").empty();
			
			if (results.hits.length < 1000) {
				
				//this should populate "sortable" with sorted results by comment
				sortByComments(results.hits);
				
				//this parse sortable into html divs
				hitsToHtml(sortable.slice(0,9));

			}
			else {
				$("#biggerContainerDiv").empty()
				$("#biggerContainerDiv").append("<h3>lots of results!  working...</h3>");
				//get rid of any previous comments filter
				url = url.replace(/\&numericFilters\=num_comments\>\=[0-9]*/, "");
				//add the new comments filter to the end
				newApiUrl = url += "&numericFilters=num_comments>=" + commentFilter;
				//double the comment filter for the next pass-through
				commentFilter = commentFilter * 2;
				//run the query again
				recursiveQueryPlusAppend(newApiUrl);
			};
		}
	);
};


resetButtons = function() {
	$("#sortContainer").empty();
	var buttons = "<div id='bydate' class='sorter selected'>by date</div>" +
		"<div id='byactivity' class='sorter unselected'>by activity</div>";
	$("#sortContainer").append($.parseHTML(buttons));
};

/* 
self.port.on("emptyNow", function(isEmptyNow) {
	if (isEmptyNow) {
		sortable = [];
		resetButtons();
		$("#biggerContainerDiv").empty();
	};
}); */


/*  clickListener = function clickListener(dictUrl) {
	$("#byactivity").removeClass("unselected");
	$("#byactivity").addClass("selected");
	$("#bydate").removeClass("selected");
	
	$("#biggerContainerDiv").empty();
	
	apiUrl = "http://hn.algolia.com/api/v1/search?query=" + 
		dictUrl +
		"&restrictSearchableAttributes=url" +
		"&hitsPerPage=1000";
	
	recursiveQueryPlusAppend(apiUrl);
			
};  */


self.port.on("searchHitsDict", function(hitsDict) {
	
	$("#biggerContainerDiv").empty();
	
	//remake the buttons, this gets rid of previous event handlers
/* 	$("#sortContainer").empty();
	$("#sortContainer").append("<div id='bydate' class='sorter selected'>by date</div>" +
		"<div id='byactivity' class='sorter unselected'>by activity</div>"); */
	
	
	resetButtons();
	hitsToHtml(hitsDict.hits);
	
	sortable = [];
	
	if ($("byactivity")) {
		
 		clickListener = function clickListener() {
			$("#biggerContainerDiv").empty();			
			apiUrl = "http://hn.algolia.com/api/v1/search?query=" + 
				hitsDict.url +
				"&restrictSearchableAttributes=url" +
				"&hitsPerPage=1000";			
			recursiveQueryPlusAppend(apiUrl);
					
		};
		
		var sortByRel = document.getElementById("byactivity");
		sortByRel.addEventListener("click", clickListener);
	};
});


//this function should fire when there are no results from the url search
//it creates a submission page
self.port.on("nohits", function(titleAndUrl) {
	$('body').empty();
	submitUrl = "https://news.ycombinator.com/submitlink?u=" + 
	titleAndUrl.url + 
	"&t=" + 
	titleAndUrl.title;
	
	linkToSubmit = "<a class=submissionLink href=" + submitUrl + " target='_blank'>No matches.  Click to submit this page!</a>"

	$('body').append(linkToSubmit);
});
