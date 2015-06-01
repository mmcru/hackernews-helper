//blank array for sorting json results by comment
var sortable = [];
//recursive comment filter variable
var commentFilter = 1;
//globals for storing first api query from main.js
var currentQueryUrl = "";
var currentNumPages = 1;
var currentPage = 0;
var currentPageForDate = 0;
var currentPageForDate = 0;
var gloHits = {};
var gloNbHits = 0;


dateHitsToPage = function() {
    $("#biggerContainerDiv").empty();
	resetButtons();
	hitsToHtml(gloHits);

	//paging logic for sort by date here
 	if (gloNbHits > 10) {
		
		//set up paging
		addPaging();
		$("#nextButton").toggleClass("invalid valid");
		
		//add click event
		var nextPageButton = document.getElementById("nextButton");
		nextPageButton.addEventListener("click", nextDateQueryPage);

	};
};


activityHitsToPage = function() {
	currentPageForDate = 0;
    var apiUrl = "http://hn.algolia.com/api/v1/search?query=" + 
        currentQueryUrl +
        "&restrictSearchableAttributes=url" +
        "&hitsPerPage=1000";
	waitingAnimation();
    recursiveQueryPlusAppend(apiUrl);
};


function byCommentCount(a,b) {
  if (a.num_comments < b.num_comments)
    return 1;
  if (a.num_comments > b.num_comments)
    return -1;
  return 0;
};


addDateToDateField = function(apiId) {
	 $.getJSON(
		"http://hn.algolia.com/api/v1/items/" + apiId,
		function(itemApi){
			$("#" + itemApi.id).empty();
			$("#" + itemApi.id).append("submitted: " + (new Date(itemApi.created_at)).toLocaleDateString());
		}
	 )
};


//this function only exists to modify "sortable"
sortByComments = function(hits) {
	
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


hitsToHtml = function(hits) {
	
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
		
		$('#biggerContainerDiv').append($.parseHTML(hitDiv));
		
		addDateToDateField(hits[hit].objectID);
	};
	
	$("#bydate").click(dateHitsToPage);
	$("#byactivity").click(activityHitsToPage);
	$("#footerContainer").empty();
	var footer = "<p>results:" + gloNbHits + "</p>";
	$("#footerContainer").append($.parseHTML(footer));	
};


waitingAnimation = function(){
	var infinity = new Sonic({
		width: 100,
		height: 75,
		padding: 10,

		stepsPerFrame: 2,
		trailLength: 1,
		pointDistance: .03,

		strokeColor: '#FF6600',
		
		step: 'fader',

		multiplier: 2,

		setup: function() {
			this._.lineWidth = 5;
		},
		path: [
	
			['arc', 10, 10, 10, -270, -90],
			['bezier', 10, 0, 40, 20, 20, 0, 30, 20],
			['arc', 40, 10, 10, 90, -90],
			['bezier', 40, 0, 10, 20, 30, 0, 20, 20]
		]
	});
	infinity.play();
	$("#footerContainer").empty();
	$("#sortContainer").empty();
	$("#biggerContainerDiv").empty();
	$("#biggerContainerDiv").append(infinity.canvas);
};


recursiveQueryPlusAppend = function(url) {

	$.getJSON(
		url,
		function(results) {
			
			
			if (results.nbHits < 1000) {
            
                //this should populate "sortable" with sorted results by comment
				sortByComments(results.hits);
      
                $("#biggerContainerDiv").empty();
                resetButtons();
                $("#byactivity").toggleClass("selected");
                $("#bydate").toggleClass("selected");
			
				
				//this parses sortable into html divs
				var sortedTen = sortable.slice((10 * currentPageForDate),(10 * currentPageForDate + 9));
                
				hitsToHtml(sortedTen);
 				addPaging();
				pagingLogicComments();
			}
			else {
				//$("#biggerContainerDiv").empty()
				
/* 				var spinner = new Spinner().spin();
				$("#biggerContainerDiv").append(spinner.el); */
				
				//get rid of any previous comments filter
				url = url.replace(/\&numericFilters\=num_comments\>\=[0-9]*/, "");
				//add the new comments filter to the end
				newApiUrl = url += "&numericFilters=num_comments>=" + commentFilter;
				//double the comment filter for the next pass-through
				commentFilter = commentFilter * 2;

				//run the query again, get next page
				recursiveQueryPlusAppend(newApiUrl);
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
	var buttons = "<div id='bydate' class='sorter clickable selected'>by date</div>" +
		"<div id='byactivity' class='sorter clickable'>by activity</div>";
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
	$(window).scrollTop(0);
	
	var dateApiUrl = "http://hn.algolia.com/api/v1/search_by_date?query=" + 
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
	$(window).scrollTop(0);
	
	var dateApiUrl = "http://hn.algolia.com/api/v1/search_by_date?query=" + 
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
	$(window).scrollTop(0);
    $("#biggerContainerDiv").empty();
	var sortedTen = sortable.slice((10 * currentPageForDate),(10 * currentPageForDate + 9));
	resetButtons();
	hitsToHtml(sortedTen);
    $("#byactivity").toggleClass("selected");
    $("#bydate").toggleClass("selected");
	addPaging();
	pagingLogicComments();
};


var prevCommQueryPage = function() {
	currentPageForDate--;
	$(window).scrollTop(0);
    $("#biggerContainerDiv").empty();
	var sortedTen = sortable.slice((10 * currentPageForDate),(10 * currentPageForDate + 9));
	resetButtons();
	hitsToHtml(sortedTen);
    $("#byactivity").toggleClass("selected");
    $("#bydate").toggleClass("selected");
	addPaging();
	pagingLogicComments();
};


self.port.on("searchHitsDict", function(hitsDict) {
	
 	currentQueryUrl = hitsDict.url;
	currentPage = 0;
	currentNumPages = hitsDict.nbPages;
    gloHits = hitsDict.hits;
    gloNbHits = hitsDict.nbHits;
	
    dateHitsToPage();     
});


//this function should fire when there are no results from the url search
//it creates a submission page
self.port.on("noHits", function(titleAndUrl) {
	$("#sortContainer").empty();
	$("#biggerContainerDiv").empty();
	$("#footerContainer").empty();
	newTitle = titleAndUrl.title.replace(/[^a-zA-Z0-9 :]/g, " ");
	submitUrl = "https://news.ycombinator.com/submitlink?u=" + 
	titleAndUrl.url +
	"&t=" + 
	newTitle;

	var linkToSubmit = "<a class='submissionLink' href='" + submitUrl + "' target='_blank'>No matches.  Click to submit this page!</a>";

	$("#sortContainer").append(linkToSubmit);
	
});
