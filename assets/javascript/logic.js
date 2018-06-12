//job - use mapquest api to find lat and long of searched for city and prep for loop check, tie to go button
$(document).ready(function() {
    var newValues = false;
    var geocode;
    var geocodeArray;
    var lat;
    var lng;
    tripArr = [];
    
    $(document).on("click", "#npButton", function(){   
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
        var mapQueryURL = "https://www.mapquestapi.com/staticmap/v5/map?key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq&locations=" + $(this).attr("data-lat") + "," + $(this).attr("data-lng") + "&size=300,300@2x";
        newImg = $("<img>");
        newImg.attr("src", mapQueryURL);
        $(".areaMap").empty();
        $(".areaMap").append(newImg);
    });

    $("#going").on("click", function(){
        //empty any info from previous searches
        $("#buttonBox").empty();
        $(".areaMap").empty();
        $("#activityButtons").empty();
        $("#campInfo").empty();
        //grab search parameters and check to see if they follow requeried formating
        var geocode = $(".searchingCity").val().trim();
        var re = /(([A-Z]{1})[A-Za-z]+(?: [A-Za-z]+)*[,]),? ([A-Z]{2})/;
        var OK = re.exec(geocode);  
        if (!OK) {
            inputCorrection();
        }
        else {
            //turn user input into format that will fit into the api query for mapquest
            var geocode = $(".searchingCity").val().trim();
            var geocodeArray = geocode.split(",");
            var queryURL = "https://www.mapquestapi.com/geocoding/v1/address?key=" + "bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq" + "&inFormat=kvp&outFormat=json&location=" + geocodeArray[0] + "%2C+" + geocodeArray[1] + "&thumbMaps=false";
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function(response) {
                lat = response.results[0].locations[0].latLng.lat;
                lng = response.results[0].locations[0].latLng.lng;
                newValues = true;
            });
            //create api url for national parks
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
                //create map that has the three nearest national parks to the entered city
                var mapQueryURL = "https://www.mapquestapi.com/staticmap/v5/map?key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq&locations=" + geocodeArray[0] + ", " + geocodeArray[1] + "||" + closest[0][4] + "," + closest[0][5] + "|marker-md-1||" + closest[1][4] + "," + closest[1][5] + "|marker-md-2||" + closest[2][4] + "," + closest[2][5] + "|marker-md-3&size=300,300@2x";
                newImg = $("<img>");
                newImg.attr("src", mapQueryURL);
                $(".areaMap").empty();
                $(".areaMap").append(newImg);
            };

            //function to create buttons assosiated with each national park
            function makeButtons(){
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
            };
        }
    });

    //find dynamicly created buttons with camping class and find campgrounds near/in that park using api
    $(document).on('click', '.camping', function() {
        var parkCode = ($(this).attr("prkCode"));
        queryURL = "https://developer.nps.gov/api/v1/campgrounds?parkCode=" + parkCode + "&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";
        $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) {
                campingButtons(response);
        });
    });
    
    //find dynamicly created buttons with food class and find resturants using mapquest api within 20 miles of national park
    $(document).on('click', '.food', function() {
        getFoodAddress($(this).attr("data-lat"), $(this).attr("data-lng"));

    });
    function getFoodAddress(foodLat, foodLng) {
        $("#campInfo").empty();
        $("#activityButtons").empty();
        var queryURL = "https://www.mapquestapi.com/search/v2/radius?origin=" + foodLat + ",+" + foodLng + "&radius=20.00&maxMatches=3&ambiguities=ignore&hostedData=mqap.ntpois|group_sic_code=?|581208&outFormat=json&key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq"
        $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) {
                var restAddress = [], restCity = [], restST = [], restPhone = [], restName = [];
                for (var i = 0; i < 3; i++){
                    restAddress[i] = response.searchResults[i].fields.address;
                    restCity[i] = response.searchResults[i].fields.city;
                    restName[i] = response.searchResults[i].fields.name;
                    restPhone[i] = response.searchResults[i].fields.phone;
                    restST[i] = response.searchResults[i].fields.state;
                }
                for (var i = 0; i < 3; i++){
                    var newP = $("<p>");
                    newP.text(restName[i] + " " + restAddress[i] + " " + restCity[i] + " " + restPhone[i]);
                    $("#campInfo").append(newP);
                    var addButton = $("<button>");
                    addButton.text("Add");
                    addButton.attr({"name": restName[i], "contact": restPhone[i]});
                    addButton.addClass("store");
                    $("#campInfo").append(addButton);
                }
            });
    };
    
    //create buttons for campgrounds nearby
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
                    addButton.attr({"name": campingArray.data[i].name, "contact": campingArray.data[i].regulationsUrl});
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
                    addButton.attr({"name": campingArray.data[i].name, "contact": campingArray.data[i].regulationsUrl});
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
    });

   //creates modal if user input doesn't match correct format
    function inputCorrection() {
        var modal = $('#myModal');
        $("#correction").text("Please enter the city in the correct format.")
        modal.css("display", "block");
        setTimeout(function(){ modal.css("display", "none"); }, 3000);
    };

    //User can store the name and some contact information in local storage
    $(document).on('click', '.store', function() {
        var name = ($(this).attr("name"));
        var contact = ($(this).attr("contact"));
        nameContact = [];
        nameContact.push(name, contact);    
        tripArr.push(nameContact);
        localStorage.setItem("array", JSON.stringify(tripArr));
        displayActivities();
    });

    //Reads trip array from local storage and displays it so user can see it, also creates a delete button to remove item
    function displayActivities() {
        $("#currentTrip").empty();
        var data = JSON.parse(localStorage.getItem("array"));        
        for (var i= 0; i < data.length; i++) {
            var s = $("<div>");
            s.attr("id", "item-" + i);
            var item = data[i][0].toString() + " " + data[i][1].toString();
            s.text(item);
            var remover = $("<button>");
            remover.addClass("delete");
            remover.attr("value", i);
            remover.text("✘");
            s.prepend(remover);
            $('#currentTrip').append(s);
        }
    }

    //When clicked, removes the activity from the trip array and visible list and also resets the stored array
    $(document).on("click", '.delete', function(){
        var index = $(this).attr("value");
        tripArr.splice(index, 1);
        $("#item-" + index).remove();
        localStorage.setItem("array", JSON.stringify(tripArr));
        displayActivities();
    });


    $(document).on("click", '.hiking', function(){
        $("#campInfo").empty();
        $("#activityButtons").empty();
        var trLat = $(this).attr("data-lat");
        var trLng = $(this).attr("data-lng");

        console.log("you clicked: " + trLat);

        var apiKeyTrails = "200285437-63e8df6ae924026feee1c05737ea2d62"
        var queryTrailURL = "https://www.hikingproject.com/data/get-trails?lat="+ trLat + "&lon="+ trLng + "&maxDistance=10&key=" + apiKeyTrails;

        console.log(queryTrailURL);

        function mapInfo(){
            
            $.ajax({
               url:queryTrailURL,
                method: "GET"
            }).then(function(response){

               var mapData = response.trails;
               var counter = 0;
                if (mapData.length === 0) {
                    var noHikes = $("<p>");
                    noHikes.text("Sorry, there are no trails nearby.");
                    $("#campInfo").append(noHikes);
                }
                else if (mapData.length < 5)  {
                    for (var i = 0; i <mapData.length; i++){
                        var hikeInfo = $("<div>");
                        hikeInfo.text(mapData[i].name);
                        hikeInfo.attr({
                            "url":mapData[i].url,
                            "name":mapData[i].name,
                            "location":mapData[i].location, 
                            "length":mapData[i].length, 
                            "status":mapData[i].conditionStatus,
                            "ascent":mapData[i].ascent});
                
                        hikeInfo.attr("id", "hikeBtn");
                        $("#campInfo").append(hikeInfo);
                     }
                }   
                else {
                    for (var i = 0; i < 5; i++) {
                        var hikeInfo = $("<div>");
                        hikeInfo.text(mapData[i].name);
                        hikeInfo.attr({
                            "url":mapData[i].url,
                            "name":mapData[i].name,
                            "location":mapData[i].location, 
                            "length":mapData[i].length, 
                            "status":mapData[i].conditionStatus,
                            "ascent":mapData[i].ascent});
                
                        hikeInfo.attr("id", "hikeBtn");
                        $("#campInfo").append(hikeInfo);
                    }
                }
                            
            });
        }
        mapInfo();
    });
    
    $(document).on("click", "#hikeBtn", function(event){
        $("#campInfo").empty();
        console.log("clicked");
        var location = $(this).attr("location");
        var length = $(this).attr("length");
        var status = $(this).attr("status");
        var ascent = $(this).attr("ascent");

        $("#campInfo").append("Location: " + location + "<br>");
        $("#campInfo").append("Length: " + length + " miles<br>");
        $("#campInfo").append("Weather: " + status + "<br>");
        $("#campInfo").append("Ascent: " + ascent + " feet<br>");
        var newBtn = $("<button>");
        newBtn.attr("name", $(this).attr("name"));
        newBtn.attr("contact", $(this).attr("url"));
        newBtn.text("Save");
        newBtn.addClass("store");
        $("#campInfo").append(newBtn);
    });

});