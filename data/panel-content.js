addDateToDateField = function addDateToDateField(apiId) {
	 $.getJSON(
		"http://hn.algolia.com/api/v1/items/" + apiId,
		function(itemApi){
			$("#" + itemApi.id).append("submitted: " + (new Date(itemApi.created_at)).toLocaleDateString());
		}
	 )
 };


self.port.on("searchHits", function(hits) {
	$('body').empty();

	for (hit in hits) {
		
		commentsLink = "<a href=https://news.ycombinator.com/item?id=" + hits[hit].objectID + " target='_blank'>  c: " + hits[hit].num_comments +"</a>";
		titleLink = "<a href=" + hits[hit].url + " target='_blank'>" + hits[hit].title + "</a>";
		authorLink = "<a href=" + "https://news.ycombinator.com/user?id=" + hits[hit].author + " target='_blank'> a: " + hits[hit].author + "</a>";
		
		hitDiv = '<div class="containerDiv">' +
			'<div class="titleDiv">' + titleLink + "</div>" +
			'<div class="commentsDiv">' + commentsLink + '</div>' +
			'<div class="authorDiv">' + authorLink + '| </div>' +
			'<div class="dateDiv" id=' + hits[hit].objectID + '></div>'	+
			'</div>';
		
		$('body').append(hitDiv);
		
		//update date fields with more api requests
		addDateToDateField(hits[hit].objectID);
	}
});

self.port.on("noHits", function(titleAndUrl) {
	$('body').empty();
	submitUrl = "https://news.ycombinator.com/submitlink?u=" + 
	titleAndUrl.url + 
	"&t=" + 
	titleAndUrl.title;
	
	linkToSubmit = "<a class=submissionLink href=" + submitUrl + " target='_blank'>No matches.  Click to submit this page!</a>"

	$('body').append(linkToSubmit);
});
 