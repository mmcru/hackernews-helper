function sortByCommentCount(a,b) {
  if (a.commentcount < b.commentcount)
    return 1;
  if (a.commentcount > b.commentcount)
    return -1;
  return 0;
};



addDateToDateField = function addDateToDateField(apiId) {
	 $.getJSON(
		"http://hn.algolia.com/api/v1/items/" + apiId,
		function(itemApi){
			$("#" + itemApi.id).append("submitted: " + (new Date(itemApi.created_at)).toLocaleDateString());
		}
	 )
 };


self.port.on("searchHitsDict", function(hitsDict) {
	
	$("#workingMessage").remove();

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
		
		$('#biggerContainerDiv').append(hitDiv);
		
		//update date fields with more api requests
		addDateToDateField(hitsDict.hits[hit].objectID);
	};
	
	
	//event listener for sort by comments feature
	var sortByRel = document.getElementById("byactivity");
	sortByRel.addEventListener("click", function() {
		$("#byactivity").removeClass("unselected");
		$("#byactivity").addClass("selected");
		$("#bydate").removeClass("selected");
		
		apiUrl = "http://hn.algolia.com/api/v1/search?query=" + 
			hitsDict.url +
			"&restrictSearchableAttributes=url" +
			"&hitsPerPage=" +
			hitsDict.nbHits;
			
		$("body").append("searching: " + apiUrl);
		sortable = [];
			
		$.getJSON(
			apiUrl,
			function(jsonResults) {
				
				for (hit in jsonResults.hits) {
					sortable.push({
						id: jsonResults.hits[hit].ObjectID,
						commentcount: jsonResults.hits[hit].num_comments,
						title: jsonResults.hits[hit].title,
						url: jsonResults.hits[hit].url,
						author: jsonResults.hits[hit].author,
					})
				};
				
				sortable.sort(sortByCommentCount);
				
				$("body").empty();
				$("body").append("number of results searched: " + sortable.length);
				$("body").append("<h3>title0: " + sortable[0].title + "</h3>");
				$("body").append("<h3>id0: " + sortable[0].id + "</h3>");
				$("body").append("<h3>author0: " + sortable[0].author + "</h3>");
				$("body").append("<h3>url0: " + sortable[0].url + "</h3>");
				$("body").append("<h3>commentcount0: " + sortable[0].commentcount + "</h3>");
				
			}
		)
		
		
		
	});
	
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
