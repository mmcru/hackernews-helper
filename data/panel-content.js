//blank array for sorting json results by comment
var sortable = [];
var commentFilter = 1;
var currentQueryUrl = "";
var currentNumPages = 1;
var currentPage = 0;
var currentPageForDate = 0;




function byCommentCount(a,b) {
  if (a.num_comments < b.num_comments)
    return 1;
  if (a.num_comments > b.num_comments)
    return -1;
  return 0;
};

var emitClick = function() {
	self.port.emit("linkClicked", true);
};

addDateToDateField = function addDateToDateField(apiId) {
	 $.getJSON(
		"http://hn.algolia.com/api/v1/items/" + apiId,
		function(itemApi){
			$("#" + itemApi.id).empty();
			$("#" + itemApi.id).append("submitted: " + (new Date(itemApi.created_at)).toLocaleDateString());
		}
	 )
};


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
		
		commentsLink = "<a href=https://news.ycombinator.com/item?id=" + hits[hit].objectID + " target='_blank'>c: " + hits[hit].num_comments +"</a>";
		titleLink = "<a href=" + hits[hit].url + " target='_blank'>" + hits[hit].title + "</a>";
		authorLink = "<a href=" + "https://news.ycombinator.com/user?id=" + hits[hit].author + " target='_blank'>a: " + hits[hit].author + "</a>";
		
		hitDiv = '<div class="containerDiv">' +
			'<div class="titleDiv">' + titleLink + "</div>" +
			'<div class="commentsDiv">' + commentsLink + '</div>' +
			'<div class="authorDiv">' + authorLink + '| </div>' +
			'<div class="dateDiv" id=' + hits[hit].objectID + '>fetching date...</div>'	+
			'</div>';
		
		$('#biggerContainerDiv').append(hitDiv);
		
		//update date fields with more api requests
		addDateToDateField(hits[hit].objectID);
		$("a").click(emitClick);
	};
	
};


recursiveQueryPlusAppend = function (url, pageNumber) {
	
	$.getJSON(
		url,
		function(results) {
			
			$("#biggerContainerDiv").empty();
			
			if (results.hits.length < 1000) {
				
				//this should populate "sortable" with sorted results by comment
				sortByComments(results.hits);
				
				//this parses sortable into html divs
				var sortedTen = sortable.slice((10 * pageNumber),(10 * pageNumber + 9));
				hitsToHtml(sortedTen);
				resetButtons();
				addPaging();
				pagingLogicComments();
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
				//currentPageForDate++;
				//run the query again, get next page
				recursiveQueryPlusAppend(newApiUrl, pageNumber);
			};
		}
	);
};


pagingLogicComments = function() {
	if (currentPageForDate < (currentNumPages - 1)) {
		$("#nextButton").toggleClass("invalid valid");
		$("#nextButton").click(nextCommQueryPage);
	};
	if (currentPageForDate > 0) {
		$("#prevButton").toggleClass("invalid valid");
		$("#prevButton").click(prevCommQueryPage);
	}; 
};


resetButtons = function() {
	$("#sortContainer").empty();
	var buttons = "<div id='bydate' class='sorter selected'>by date</div>" +
		"<div id='byactivity' class='sorter unselected'>by activity</div>";
	$("#sortContainer").append($.parseHTML(buttons));
};


addPaging = function() {
	var pagingButtons = "<div id='pagingContainer'><div class='sorter invalid' id='prevButton'>previous</div><div class='sorter invalid' id='nextButton'>next</div></div>"
	$("#biggerContainerDiv").append($.parseHTML(pagingButtons));
};


pagingLogicDate = function() {
	if (currentPage < (currentNumPages - 1)) {
		$("#nextButton").toggleClass("invalid valid");
		$("#nextButton").click(nextDateQueryPage);
	};
	if (currentPage > 0) {
		$("#prevButton").toggleClass("invalid valid");
		$("#prevButton").click(prevDateQueryPage);
	};
};


var nextDateQueryPage = function() {
	
	currentPage++;
	
	var dateApiUrl = "http://hn.algolia.com/api/v1/search_by_date?query=" + 
		//hitsDict.url +
		currentQueryUrl +
		"&restrictSearchableAttributes=url" +
		"&hitsPerPage=10" +
		"&page=" +
		currentPage;
	
	$.getJSON(
		dateApiUrl,
		function(nextPageResponse) {
			$("#biggerContainerDiv").empty();
			resetButtons();
			hitsToHtml(nextPageResponse.hits);
			addPaging();
			pagingLogicDate();
		}
	);
};


var prevDateQueryPage = function() {
	
	currentPage--;
	
	var dateApiUrl = "http://hn.algolia.com/api/v1/search_by_date?query=" + 
		//hitsDict.url +
		currentQueryUrl +
		"&restrictSearchableAttributes=url" +
		"&hitsPerPage=10" +
		"&page=" +
		currentPage;
	
	$.getJSON(
		dateApiUrl,
		function(nextPageResponse) {
			$("#biggerContainerDiv").empty();
			resetButtons();
			hitsToHtml(nextPageResponse.hits);
			addPaging();
			pagingLogicDate();
		}
	);
};


var nextCommQueryPage = function() {
	currentPageForDate++;
    $("#biggerContainerDiv").empty();
	var sortedTen = sortable.slice((10 * currentPageForDate),(10 * currentPageForDate + 9));
	hitsToHtml(sortedTen);
	resetButtons();
	addPaging();
	pagingLogicComments();
};


var prevCommQueryPage = function() {
	currentPageForDate--;
    $("#biggerContainerDiv").empty();
	var sortedTen = sortable.slice((10 * currentPageForDate),(10 * currentPageForDate + 9));
	hitsToHtml(sortedTen);
	resetButtons();
	addPaging();
	pagingLogicComments();
};


self.port.on("searchHitsDict", function(hitsDict) {
	
	currentQueryUrl = hitsDict.url;
	currentPage = 0;
	currentNumPages = hitsDict.nbPages;
	
	$("#biggerContainerDiv").empty();
	
	resetButtons();
	hitsToHtml(hitsDict.hits);

	//paging logic for sort by date here
 	if (hitsDict.nbHits > 10) {
		
		//set up paging
		addPaging();
		$("#nextButton").toggleClass("invalid valid");
		
		//add click event
		var nextPageButton = document.getElementById("nextButton");
		nextPageButton.addEventListener("click", nextDateQueryPage);

	};
	
 	if ($("byactivity")) {
		
 		var clickListener = function clickListener() {
			$("#biggerContainerDiv").empty();			
			var apiUrl = "http://hn.algolia.com/api/v1/search?query=" + 
				hitsDict.url +
				"&restrictSearchableAttributes=url" +
				"&hitsPerPage=1000";			
			recursiveQueryPlusAppend(apiUrl, 0);
					
		};
		
		//var sortByRel = document.getElementById("byactivity");
		//sortByRel.addEventListener("click", clickListener);
		$("#byactivity").click(clickListener);
	};
});


//this function should fire when there are no results from the url search
//it creates a submission page
self.port.on("noHits", function(titleAndUrl) {
	$("#sortContainer").empty();
	$("#biggerContainerDiv").empty();
	submitUrl = "https://news.ycombinator.com/submitlink?u=" + 
	titleAndUrl.url + 
	"&t=" + 
	titleAndUrl.title;
	
	linkToSubmit = "<a class=submissionLink href=" + submitUrl + " target='_blank'>No matches.  Click to submit this page!</a>"

	$("#sortContainer").append(linkToSubmit);
});
