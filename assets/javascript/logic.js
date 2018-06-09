//job - use mapquest api to find lat and long of searched for city and prep for loop check, tie to go button
$(document).ready(function() {
    var newValues = false;
    var geocode;
    var geocodeArray;
    var lat;
    var lng;
    var main = $("body");
    btns = main.find("#buttonBox");
    $(document).on("click", "#npButton", function(){
        console.log("You clicked me");
        
        $("#buttonBox").empty();
        var newButton = $("<button>");
        newButton.attr("data-lat", $(this).attr("data-lat"));
        newButton.text("Hiking");
        newButton.attr("data-lng", $(this).attr("data-lng"));
        newButton.addClass("hiking");
        $("#buttonBox").append(newButton);
        var newButton2 = $("<button>");
        newButton2.text("Food");
        newButton2.attr("data-lat", $(this).attr("data-lat"));
        newButton2.attr("data-lng", $(this).attr("data-lng"));
        newButton2.addClass("food");
        $("#buttonBox").append(newButton2);
        var newBtn = $("<button>");
        newBtn.attr("prkCode", $(this).attr("prkCode"));
        newBtn.addClass("camping");
        newBtn.text("Camping");
        $("#buttonBox").append(newBtn);
    });

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

        queryURL = "https://developer.nps.gov/api/v1/parks?&limit=496&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";
        var parksArray = [];
        var index = 0;
        var closest = [];
        
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
            var mapQueryURL = "https://www.mapquestapi.com/staticmap/v5/map?key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq&locations=" + geocodeArray[0] + ", " + geocodeArray[1] + "||" + closest[0][4] + "," + closest[0][5] + "|marker-md-1||" + closest[1][4] + "," + closest[1][5] + "|marker-md-2||" + closest[2][4] + "," + closest[2][5] + "|marker-md-3&size=300,300@2x";
            newImg = $("<img>");
            newImg.attr("src", mapQueryURL);
            $(".areaMap").empty();
            $(".areaMap").append(newImg);
        };
        function makeButtons(){

            function newButton(){
            
                for(i=0;i<closest.length;i++){
        
                    var newButton = $("<button>");
                    newButton.attr("id", "npButton");
                    newButton.addClass("destination");
                    newButton.text((i+1) + "-" + closest[i][1] + " " + closest[i][2]);
                    newButton.attr("data-lat", closest[i][4]);
                    newButton.attr("data-lng", closest[i][5]);
                    newButton.attr("prkCode", closest[i][0])
                    $("#buttonBox").append(newButton);
        
                }
            }
            newButton();
        };
    });



        //Sort through parks data array, retrieve lattitude and longitude, compare them to user's city,
        // and find three closest, pull out name of park and park code and save to a variable.
    
    $(document).on('click', '.camping', function() {
        var parkCode = ($(this).attr("prkCode"));
        queryURL = "https://developer.nps.gov/api/v1/campgrounds?parkCode=" + parkCode + "&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";
        console.log(queryURL);
        $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) {
                console.log(response);
                campingButtons(response);
        });
    });
    $(document).on('click', '.food', function() {
        console.log("You clicked me");
        getFoodAddress($(this).attr("data-lat"), $(this).attr("data-lng"));

    });
    function getFoodAddress(foodLat, foodLng) {
        var queryURL = "https://www.mapquestapi.com/search/v2/radius?origin=" + foodLat + ",+" + foodLng + "&radius=20.00&maxMatches=3&ambiguities=ignore&hostedData=mqap.ntpois|group_sic_code=?|581208&outFormat=json&key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq"
        $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) {
                var restAddress, restCity, restST, restPhone, restName;
                restAddress = $("<p>");
                restCity = $("<p>");
                restST = $("<p>");
                restPhone = $("<p>");
                restName = $("<p>");
                restAddress1 = $("<p>");
                restCity1 = $("<p>");
                restST1 = $("<p>");
                restPhone1 = $("<p>");
                restName1 = $("<p>");
                restAddress2 = $("<p>");
                restCity2 = $("<p>");
                restST2 = $("<p>");
                restPhone2 = $("<p>");
                restName2 = $("<p>");
                restAddress.text(response.searchResults[0].fields.address);
                restCity.text(response.searchResults[0].fields.city);
                restName.text(response.searchResults[0].fields.name);
                restPhone.text(response.searchResults[0].fields.phone);
                restST.text(response.searchResults[0].fields.state);
                $("#campInfo").append(restAddress);
                $("#campInfo").append(restCity);
                $("#campInfo").append(restName);
                $("#campInfo").append(restPhone);
                $("#campInfo").append(restST);
                restAddress1.text(response.searchResults[1].fields.address);
                restCity1.text(response.searchResults[1].fields.city);
                restName1.text(response.searchResults[1].fields.name);
                restPhone1.text(response.searchResults[1].fields.phone);
                restST1.text(response.searchResults[1].fields.state);
                $("#campInfo").append(restAddress1);
                $("#campInfo").append(restCity1);
                $("#campInfo").append(restName1);
                $("#campInfo").append(restPhone1);
                $("#campInfo").append(restST1);
                restAddress2.text(response.searchResults[2].fields.address);
                restCity2.text(response.searchResults[2].fields.city);
                restName2.text(response.searchResults[2].fields.name);
                restPhone2.text(response.searchResults[2].fields.phone);
                restST2.text(response.searchResults[2].fields.state);
                $("#campInfo").append(restAddress2);
                $("#campInfo").append(restCity2);
                $("#campInfo").append(restName2);
                $("#campInfo").append(restPhone2);
                $("#campInfo").append(restST2);
            });
    };
    
    
    function campingButtons(campingArray) {
        $("#campInfo").empty();
        $("#activityButtons").empty();
        if (campingArray.data.length > 0) {
            if (campingArray.data.length < 5) {
                for (i=0; i<campingArray.data.length; i++) {
                    var thisCampDiv = $("<div>");
                    var campButton = $("<button>");
                    var addButton = $("<button>");
                    campButton.addClass("campingSite");
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
                    campButton.addClass("campingSite");
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
    };
    
    
    $(document).on('click', '.campingSite', function() {
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

   });
   
    function inputCorrection() {
        var modal = $('#myModal');
        $("#correction").text("Please enter the city in the correct format.")
        modal.css("display", "block");
        setTimeout(function(){ modal.css("display", "none"); }, 5000);
    };
});

