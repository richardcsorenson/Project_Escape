//job - use mapquest api to find lat and long of searched for city and prep for loop check, tie to go button
$(document).ready(function() {
    var newValues = false;
    var geocode;
    var geocodeArray;
    var lat;
    var lng;
    var tripArr = [];
    //creates modal if user input doesn't match correct format
    function inputCorrection() {
        var modal = $('#myModal');
        $("#correction").text("Please enter the City and State in the correct format.")
        modal.css("display", "block");
        setTimeout(function(){ modal.css("display", "none"); }, 3000);
    };
    //function to start the search and create 3 buttons relating to the 3 closest national parks
    $("#going").on("click", function(){
        $("#campInfo").empty();
        $("#activityButtons").empty();
        //empty any info from previous searches
        $("#buttonBox").empty();
        $(".areaMap").empty();
        //grab search parameters and check to see if they follow requeried formating
        var geocode = $(".searchingCity").val().trim();
        var re = /(([A-Za-z])[A-Za-z]+(?: [A-Za-z]+)*[,]),? ([A-Za-z]{2})/;
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
                    if (!(res.data[i].latLong === "")) {
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
                newImg.addClass("mapStyle");
                $(".areaMap").empty();
                $(".areaMap").append(newImg);
            };

            //function to create buttons assosiated with each national park, adds data to each with lat, lng, park code and adds class destination
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
    //Function to create buttons assosiated with Food, Hiking, and camping based on data in button clicked
    $(document).on("click", "#npButton", function(){   
        $("#buttonBox").empty();
        var newButton = $("<button>");
        newButton.attr("data-lat", $(this).attr("data-lat"));
        newButton.text("Hiking");
        newButton.attr("data-lng", $(this).attr("data-lng"));
        newButton.addClass("hiking");
        newButton.attr("id", "btnStyle");
        $("#buttonBox").append(newButton);
        var newButton2 = $("<button>");
        newButton2.text("Food");
        newButton2.attr("data-lat", $(this).attr("data-lat"));
        newButton2.attr("data-lng", $(this).attr("data-lng"));
        newButton2.addClass("food");
        newButton2.attr("id", "btnStyle");
        $("#buttonBox").append(newButton2);
        var newBtn = $("<button>");
        newBtn.attr("prkCode", $(this).attr("prkCode"));
        newBtn.addClass("camping");
        newBtn.text("Camping");
        newBtn.attr("id", "btnStyle");
        $("#buttonBox").append(newBtn); 
        var mapQueryURL = "https://www.mapquestapi.com/staticmap/v5/map?key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq&locations=" + $(this).attr("data-lat") + "," + $(this).attr("data-lng") + "&size=300,300@2x";
        newImg = $("<img>");
        newImg.attr("src", mapQueryURL);
        newImg.addClass("mapStyle");
        $(".areaMap").empty();
        $(".areaMap").append(newImg);
    });

    //find dynamicly created buttons with camping class and find campgrounds near/in that park using api
    $(document).on('click', '.camping', function() {
        var parkCode = ($(this).attr("prkCode"));
        queryURL = "https://developer.nps.gov/api/v1/campgrounds?parkCode=" + parkCode + "&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";
        $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) {
                campingButtonsCreation(response);
        });
    });
    
    //find dynamicly created buttons with food class and find resturants using mapquest api within 20 miles of national park
    $(document).on('click', '.food', function() {
        $("#activityButtons").empty();
        $("#campInfo").empty();
        getFoodAddress($(this).attr("data-lat"), $(this).attr("data-lng"));

    });

    //logic behind creating buttons for food
    function getFoodAddress(foodLat, foodLng) {
        var queryURL = "https://www.mapquestapi.com/search/v2/radius?origin=" + foodLat + ",+" + foodLng + "&radius=20.00&maxMatches=3&ambiguities=ignore&hostedData=mqap.ntpois|group_sic_code=?|581208&outFormat=json&key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq"
        $.ajax({
            url: queryURL,
            method: "GET"
            }).then(function(response) {
                $("#activityButtons").empty();
                var restAddress = [], restCity = [], restST = [], restPhone = [], restName = [];
                if(response.resultsCount == 0){
                    $("#activityButtons").text("Sorry, there are no resturants within a 20 mile radius");
                }
                else{
                    var restAddress = [], restCity = [], restST = [], restPhone = [], restName = [];
                    if(response.resultsCount < 5){
                        for (var i = 0; i < response.resultsCount; i++){
                            restAddress[i] = response.searchResults[i].fields.address;
                            restCity[i] = response.searchResults[i].fields.city;
                            restName[i] = response.searchResults[i].fields.name;
                            restPhone[i] = response.searchResults[i].fields.phone;
                            restST[i] = response.searchResults[i].fields.state;
                        }
                        for (var i = 0; i < response.resultsCount; i++){
                            var newP = $("<p>");
                            newP.text(restName[i] + " " + restAddress[i] + " " + restCity[i] + " " + restPhone[i]);
                            newP.addClass("specialP");
                            $("#activityButtons").append(newP);
                            var addButton = $("<div>");
                            addButton.text("Add");
                            addButton.attr({"name": restName[i], "contact": restPhone[i]});
                            addButton.addClass("store");
                            addButton.addClass("specialButton");
                            $("#activityButtons").append(addButton);
                        }
                    }
                    else{
                        for (var i = 0; i < 5; i++){
                            restAddress[i] = response.searchResults[i].fields.address;
                            restCity[i] = response.searchResults[i].fields.city;
                            restName[i] = response.searchResults[i].fields.name;
                            restPhone[i] = response.searchResults[i].fields.phone;
                            restST[i] = response.searchResults[i].fields.state;
                        }
                        for (var i = 0; i < 3; i++){
                            var newP = $("<p>");
                            newP.text(restName[i] + " " + restAddress[i] + " " + restCity[i] + " " + restPhone[i]);
                            $("#activityButtons").append(newP);
                            var addButton = $("<div>");
                            addButton.text("Add");
                            addButton.attr({"name": restName[i], "contact": restPhone[i]});
                            addButton.addClass("store");
                            $("#activityButtons").append(addButton);
                        }
                    }
                }
            });
    };
    
    //repeating code should be put into funtions
    function campingButtons(info, i){
        var thisCampDiv = $("<div>");
        var campButton = $("<button>");
        var addButton = $("<button>");
        campButton.addClass("campingSite");
        campButton.attr("description", info.data[i].description);
        campButton.text(info.data[i].name);
        addButton.text("Add");
        addButton.attr({"name": info.data[i].name, "contact": info.data[i].regulationsUrl});
        addButton.addClass("store");
        thisCampDiv.append(campButton);
        $("#activityButtons").append(thisCampDiv);
        $("#activityButtons").append(addButton);
    };

    //create buttons for campgrounds nearby
    function campingButtonsCreation(campingArray) {
        $("#campInfo").empty();
        $("#activityButtons").empty();
        if (campingArray.data.length > 0) {
            //Some parks have less than 5 campgrounds, so we don't want to have a constant 5 to cause a break
            if (campingArray.data.length < 5) {
                for (i=0; i<campingArray.data.length; i++) {
                    campingButtons(campingArray, i);
                }
            }
            //for parks with at least 5 campgrounds
            else {
                for (i=0; i<5; i++) {
                    campingButtons(campingArray, i);
                }
            }
        }
        //for parks with no campgrounds
        else {
            var noCamps = $("<p>");
            noCamps.text("Sorry, there are no campgrounds at this national park.");
            $("#campInfo").append(noCamps);
        }
    };
    
    //grabs discription of campsite and puts into campInfo div
    $(document).on('click', '.campingSite', function() {
        $("#campInfo").empty();
        var description = ($(this).attr("description"));
        var p = $("<p>");
        p.text(description);
        $("#campInfo").append(p);
    });

   
    //store information user is interested in
    $(document).on('click', '.store', function() {
        var name = ($(this).attr("name"));
        var contact = ($(this).attr("contact"));
        nameContact = [];
        nameContact.push(name, contact);    
        tripArr.push(nameContact);
        localStorage.setItem("array", JSON.stringify(tripArr));
        displayActivities();
    });

    //Creates hiking information and displays in proper area
    $(document).on("click", '.hiking', function(){
        $("#campInfo").empty();
        $("#activityButtons").empty();
        var trLat = $(this).attr("data-lat");
        var trLng = $(this).attr("data-lng");
        var apiKeyTrails = "200285437-63e8df6ae924026feee1c05737ea2d62"
        var queryTrailURL = "https://www.hikingproject.com/data/get-trails?lat="+ trLat + "&lon="+ trLng + "&maxDistance=10&key=" + apiKeyTrails;
        function mapInfo(){
            $.ajax({
               url:queryTrailURL,
                method: "GET"
            }).then(function(response){
               var mapData = response.trails;     
            if(mapData.length >= 1){
               for(i=0;i<mapData.length;i++){
                   if(mapData[i].stars == 5 || mapData[i].stars < 5 && mapData[i].stars != 5){
                        var hikeInfo = $("<div>");
                        hikeInfo.text(mapData[i].name);
                        hikeInfo.attr({
                            "url":mapData[i].url,
                            "name":mapData[i].name,
                            "location":mapData[i].location, 
                            "length":mapData[i].length, 
                            "status":mapData[i].conditionStatus,
                            "ascent":mapData[i].ascent,
                            "Rating":mapData[i].stars});
                        hikeInfo.attr("id", "hikeBtn");
                        $("#activityButtons").append(hikeInfo);
                   }  
                }       
                   
            }
            else{
                $("#activityButtons").text("Sorry, there are no hikes at this National Park");
            
           };
               $(document).on("click", "#hikeBtn", function(event){
                $("#campInfo").empty();
                var location = $(this).attr("location");
                var length = $(this).attr("length");
                var status = $(this).attr("status");
                var ascent = $(this).attr("ascent");
                var rating = $(this).attr("rating");
                $("#campInfo").append("Location: " + location + "<br>");
                $("#campInfo").append("Length: " + length + " miles<br>");
                $("#campInfo").append("Weather: " + status + "<br>");
                $("#campInfo").append("Ascent: " + ascent + " feet<br>");
                $("#campInfo").append("Rating: " + rating + " /5<br>");
                var newBtn = $("<button>");
                newBtn.attr("name", $(this).attr("name"));
                newBtn.attr("contact", $(this).attr("url"));
                newBtn.text("Save");
                newBtn.addClass("store");
                $("#campInfo").append(newBtn);
               });
            });
        }
        mapInfo();
    });

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
    //remove items from the user generated list
    $(document).on("click", '.delete', function(){
        var index = $(this).attr("value");
        tripArr.splice(index, 1);
        $("#item-" + index).remove();
        console.log(tripArr);
        localStorage.setItem("array", JSON.stringify(tripArr));
        displayActivities();
    });
    //reset all information
    $("#reset").on("click", function(){
        $(".searchingCity").val("");
        $("#buttonBox").empty();
        $(".areaMap").empty();
        $("#activityButtons").empty();
        $("#campInfo").empty();
        newValues = false;
        geocode = null;
        geocodeArray = [];
        lat = null;
        lng = null;
        tripArr = [];
        localStorage.setItem("array", JSON.stringify(tripArr));
        displayActivities();
    });
    $("#oldInfo").on("click", function(){
        displayActivities();
        tripArr = JSON.parse(localStorage.getItem("array"));
    });
});