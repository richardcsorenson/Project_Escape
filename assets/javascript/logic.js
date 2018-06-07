//job - use mapquest api to find lat and long of searched for city and prep for loop check, tie to go button
$(document).ready(function() {
    var newValues = false;
    var geocode;
    var geocodeArray;
    var lat;
    var lng;
    $("#going").on("click", function(){
        $("#buttonBox").empty();
        $(".areaMap").empty();
        var geocode = $(".searchingCity").val().trim();
        var geocodeArray = geocode.split(",");
        var queryURL = "https://www.mapquestapi.com/geocoding/v1/address?key=" + "bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq" + "&inFormat=kvp&outFormat=json&location=" + geocodeArray[0] + "%2C+" + geocodeArray[1] + "&thumbMaps=false";
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            console.log(response);
            lat = response.results[0].locations[0].latLng.lat;
            lng = response.results[0].locations[0].latLng.lng;
            console.log(lat);
            console.log(lng);
            newValues = true;
        });
        var mapQueryURL = "https://www.mapquestapi.com/staticmap/v5/map?key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq&center=" + geocodeArray[0] + ", " + geocodeArray[1] + "&size=300,300@2x";
        newImg = $("<img>");
        newImg.attr("src", mapQueryURL);
        $(".areaMap").empty();
        $(".areaMap").append(newImg);

        queryURL = "https://developer.nps.gov/api/v1/parks?&limit=496&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";
        var parksArray = [];
        var index = 0;
        var closestFirst;
        var closestSecond;
        var closestThird;
        
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            createDistance(response);
            closestThree();
            makeButtons();
        });
        
        //This function calculates distance from user's city to the National Park coordinates. Some parks do not have
        //coordinates and we can deal with those edge cases later if we have time.  The parksArray holds information
        // including name and designation, latitude, longitude, distance, and park code.
        function createDistance(res) {
            for (var i = 0; i < res.data.length; i++) {
                if (res.data[i].latLong === "") {
                    console.log("No coordinates.");
                }
                else {
                        var parkOne = res.data[i].latLong.split(",");
                        var latNum = parkOne[0].split(":");
                        var longNum = parkOne[1].split(":"); 
                        var templat = latNum[1];
                        var templng = longNum[1];
                        var distance = Math.sqrt(Math.pow((templng - lng),2) + Math.pow((templat - lat),2));
                        var myPark = [res.data[i].parkCode, res.data[i].name, res.data[i].designation, distance, templat, templng];
                        parksArray.push(myPark);
                }
            }
        }
        
        //This function goes through the parksArray 3 times in order to find the 3 closest parks to the city. The
        //three closest parks are closestFirst, closestSecond, and closestThird.
        function closestThree() {
            var temp = parksArray[0][3];
            for (var i = 0; i < parksArray.length; i++) {
                if (parksArray[i][3] < temp) {
                    temp = parksArray[i][3];
                    index = i;
                }
            }
            closestFirst = parksArray[index];
            console.log(closestFirst);
            parksArray.splice(index, 1);
            index = 0;
            temp = parksArray[0][3];
            for (var j = 0; j < parksArray.length; j++) {
                if (parksArray[j][3] < temp) {
                temp = parksArray[j][3];
                index = j;
                }
            }
            closestSecond = parksArray[index];
            console.log(closestSecond);
            parksArray.splice(index, 1);
            index = 0;
            temp = parksArray[0][3];
            for (var k = 0; k < parksArray.length; k++) {
                if (parksArray[k][3] < temp) {
                temp = parksArray[k][3];
                index = k;
                }
            }
            closestThird = parksArray[index];
            console.log(closestThird);
        };
        function makeButtons(){

            var npArr = [closestFirst[1] + " " + closestFirst[2], closestSecond[1] + " " + closestSecond[2], closestThird[1] + " " + closestThird[2]];
        
            // var apiKey = "200285437-63e8df6ae924026feee1c05737ea2d62"
            // var queryURL = "";
        
            // function mapInfo(){
        
            //     $.ajax({
            //         url:queryURL,
            //         method: "GET"
            //     }).then(function(response){
        
            //         mapData = response.data;
        
        
            //     });
        
            // }
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
        };
    });



        //Sort through parks data array, retrieve lattitude and longitude, compare them to user's city,
        // and find three closest, pull out name of park and park code and save to a variable.
    
        
});

