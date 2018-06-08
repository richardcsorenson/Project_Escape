//job - use mapquest api to find lat and long of searched for city and prep for loop check, tie to go button
$(document).ready(function() {
    var newValues = false;
    var geocode;
    var geocodeArray;
    var lat;
    var lng;
    var parksArray = [];
    var index = 0;
    var closest = [];
    $("#going").on("click", function(){
        $("#buttonBox").empty();
        $(".areaMap").empty();
        var geocode = $(".searchingCity").val().trim();
        var re = /(([A-Z]{1})[A-Za-z]+(?: [A-Za-z]+)*[,]),? ([A-Z]{2})/;
        var OK = re.exec(geocode);  
        if (!OK) {
            inputCorrection();
        }
        else {
            citySearch(geocode);
        }
    });

        function citySearch(geocode) {
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
    
        
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            createDistance(response);
            closestThree();
            newButton();
        });
    }


    function inputCorrection() {
        console.log("Please enter the city in the correct format.")
    }
        
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
            closest[0] = parksArray[index];
            parksArray.splice(index, 1);
            index = 0;
            temp = parksArray[0][3];
            for (var j = 0; j < parksArray.length; j++) {
                if (parksArray[j][3] < temp) {
                temp = parksArray[j][3];
                index = j;
                }
            }
            closest[1] = parksArray[index];
            parksArray.splice(index, 1);
            index = 0;
            temp = parksArray[0][3];
            for (var k = 0; k < parksArray.length; k++) {
                if (parksArray[k][3] < temp) {
                temp = parksArray[k][3];
                index = k;
                }
            }
            closest[2] = parksArray[index];
        };
        // function makeButtons(){
        
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
            
                for(i=0;i<closest.length;i++){
        
                    var newButton = $("<button>");
                    newButton.addClass("npButton");
                    newButton.text(closest[i][1] + " " + closest[i][2]);
                    newButton.attr("data-lat", closest[i][4]);
                    newButton.attr("data-lng", closest[i][5]);
                    newButton.attr("prkCode", closest[i][0])
                    $("#buttonBox").append(newButton);
        
                }
            }     
  
    function campingButtons(campingArray) {
        $("#campInfo").empty();
        $("#activityButtons").empty();
        if (campingArray.data.length > 0) {
            if (campingArray.data.length < 5) {
                for (i=0; i<campingArray.data.length; i++) {
                    var thisCampDiv = $("<div>");
                    var campButton = $("<button>");
                    var addButton = $("<button>");
                    campButton.addClass("camping");
                    campButton.attr("description", campingArray.data[i].description);
                    campButton.text(campingArray.data[i].name);
                    addButton.text("Add");
                    addButton.attr({"name": campingArray.data[i].name, "url": campingArray.data[i].regulationsUrl});
                    addButton.addClass("store");
                    thisCampDiv.append(campButton, addButton);
                    $("#activityButtons").append(thisCampDiv);
                }
            }
            else {
                for (i=0; i<5; i++) {
                    var thisCampDiv = $("<div>");
                    var campButton = $("<button>");
                    var addButton = $("<button>");
                    campButton.addClass("camping");
                    campButton.attr("description", campingArray.data[i].description);
                    campButton.text(campingArray.data[i].name);
                    addButton.text("Add");
                    addButton.attr({"name": campingArray.data[i].name, "url": campingArray.data[i].regulationsUrl});
                    addButton.addClass("store");
                    thisCampDiv.append(campButton, addButton);
                    $("#activityButtons").append(thisCampDiv);
                }
            }
        }
        else {
            var noCamps = $("<p>");
            noCamps.text("Sorry, there are no campgrounds at this national park.");
            $("#campInfo").append(noCamps);
        }
    }
        
    $(document).on('click', '.npButton', function() {
        var parkCode = ($(this).attr("prkCode"));
        queryURL = "https://developer.nps.gov/api/v1/campgrounds?parkCode=" + parkCode + "&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";
        console.log(queryURL);
        $.ajax({
         url: queryURL,
         method: "GET"
         }).then(function(response) {
                campingButtons(response);
         });
     });

     $(document).on('click', '.camping', function() {
         $("#campInfo").empty();
         var description = ($(this).attr("description"));
         var p = $("<p>");
         p.text(description);
         $("#campInfo").append(p);
     })

     $(document).on('click', '.store', function() {
        localStorage.clear();
        var name = ($(this).attr("name"));
        var url = ($(this).attr("url"));
        localStorage.setItem("name", name);
        localStorage.setItem("url", url);
        console.log(localStorage.getItem("name"));
        console.log(localStorage.getItem("url"));

    })

});

