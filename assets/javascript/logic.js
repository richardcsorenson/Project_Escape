//job - use mapquest api to find lat and long of searched for city and prep for loop check, tie to go button

$("#going").on("click", function(){
    var geocode = $(".searchingCity").val().trim();
    var geocodeArray = geocode.split(",");
    var queryURL = "https://www.mapquestapi.com/geocoding/v1/address?key=" + "bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq" + "&inFormat=kvp&outFormat=json&location=" + geocodeArray[0] + "%2C+" + geocodeArray[1] + "&thumbMaps=false";
    $.ajax({
        url: queryURL,
        method: "GET"
      }).then(function(response) {
        console.log(response);
        var lat = response.results[0].locations[0].latLng.lat;
        var lng = response.results[0].locations[0].latLng.lng;
        console.log(lat);
        console.log(lng);
      });
    var mapQueryURL = "https://www.mapquestapi.com/staticmap/v5/map?key=bx4GNHAnYTNfXXmUFGyUv4wjDPfomZIq&center=" + geocodeArray[0] + ", " + geocodeArray[1] + "&size=300,300@2x";
    newImg = $("<img>");
    newImg.attr("src", mapQueryURL);
    $(".areaMap").empty();
    $(".areaMap").append(newImg);

});