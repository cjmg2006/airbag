console.log("Successfully loaded Javascript");

user = 'cjmg2006@gmail.com'
key = 'DiMw7Lp4WmuAK0cxMKxRLwQUlnaZEhmNBJ6LancuWuo='


var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

$(document).ready(function() { 
	console.log("Ready");

	partID = getUrlParameter('partID');
	vehicleID = getUrlParameter('vehicleID');
	recall = getUrlParameter('recall'); 

	$("#partID").append('Part ID: ' + partID);

	// Check on blockchain 

	$.ajax( 
		{
			type: 'GET', 
			url: 'https://api.tierion.com/v1/records/' + partID, 
			headers: {'X-Username': user, 'X-Api-Key': key}
		}
	).done(function (data, status) { 

		if(recall == 'yes') { 
			console.log("need to recall"); 
			$('body').css("background-color", "#fff375");

			$("#status-header").append("<h2> Notification of Recall </h2>");
			$("#status-msg").append('Malfunctions detected in part ' + partID + '. Please bring your car to the nearest dealer as soon as possible.');

			$('.info').hide();

			$("#authorities-header").append("<h3> Details of recall: </h3>");
			$("#auth").append("<p> Time issued: " + Date.now().toString() + " </p>");
			$("#auth").append("<p> Car manufacturer: XYZ </p>");
			$("#auth").append("<p> Link to announcement: <a href= 'http://toyotanews.pressroom.toyota.com/releases/toyota+recall+2016+2017+tacoma+june1.htm'> Website </a>  </p>");


		} else { 
			console.log("no need to recall"); 
			$('body').css("background-color", "#42f468");
			$('#auth').hide();
			$("#status-header").append("<h2> Success </h2>");
			$("#status-msg").append('Part successfully transferred to vehicle. Transfer successfully recorded on Public Vehicle Blockchain:');

			// Post onto the blockchain  
			$.ajax({ 
				type: "POST", 
				url: "https://api.tierion.com/v1/records",
				data: {	'vehicleID': vehicleID, 
						'partID': partID, 
						'timestamp': Date.now(),
						"datastoreId": 1742
					  }, 
				headers: {'X-Username': user, 'X-Api-Key': key} 
			})
			.done(function(data, status) { 

				// Update info 
				$("#success-panel").append("<p> vehicleID: " + vehicleID + "</p>");
				$("#success-panel").append("<p> partID: " + partID + "</p>");
				$("#success-panel").append("<p> timestamp: " + Date.now().toString() + "</p>");
			}); 

		}

	})


	.error(function(data, status, errorThrown) {
		console.log(errorThrown);

		$('body').css("background-color", "#e53d49");

		$("#status-header").append("<h2> Failure </h2>");
		$("#status-msg").append('Part is not authentic. Following information of attempted install of part sent to relevant parties: ');

		$("#success-panel").append("<p> vehicleID: " + vehicleID + "</p>");
		$("#success-panel").append("<p> timestamp: " + Date.now().toString() + "</p>");


		$("#authorities-header").append("<h2> Authorities informed: </h2>");
		$("#auth").append("<p> Car owner </p>");
		$("#auth").append("<p> Car manufacturer: Ford Motor Company </p>");
		$("#auth").append("<p> Car insurance company: Metromile </p>");
		
	});

	// If verified, show one screen

	// If not verified, show another screen


});
