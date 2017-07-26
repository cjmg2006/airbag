var baseURL = "http://localhost:8080";


window.onload = function() {
	getData();
    
};

function getData() {
    $.ajax({
        method: "GET",
        url: baseURL + `/data`
    }).done(function(res) {
        console.log("The data is " + res);
    })


}
