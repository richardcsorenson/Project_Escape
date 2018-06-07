$(document).ready(function() {


    var npArr = ["Zion", "Arches", "Grand Canyon"];

    var apiKey = "200285437-63e8df6ae924026feee1c05737ea2d62"
    var queryURL = "";

    function mapInfo(){

        $.ajax({
            url:queryURL,
            method: "GET"
        }).then(function(response){

            mapData = response.data;


        });

    }
    function newButton(){
    
        for(i=0;i<npArr.length;i++){

            var newButton = $("<button>");
            newButton.attr("id", "npButton");
            newButton.text(npArr[i]);
            $("#buttonBox").append(newButton);

        }
    }

    $("#searchBtn").on("click", function(event){
        event.preventDefault();

        var value = ("#userInput").val().trim();

    });

   // $(documemt).on("click", "#npButton", mapInfo)
    newButton();
});