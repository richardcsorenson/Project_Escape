$(document).ready(function() {

//Sort through parks data array, retrieve lattitude and longitude, compare them to user's city,
// and find three closest, pull out name of park and park code and save to a variable.
var queryURL = "https://developer.nps.gov/api/v1/parks?&limit=496&api_key=sc8zC5tqF4V2Qu2btmhXRepIwuZBKzoN1Wu23a5z";

var citylat = 41.881832;
var citylong = -87.623177;
parksArray = [];
var index = 0;
var closestFirst;
var closestSecond;
var closestThird;

$.ajax({
    url: queryURL,
    method: "GET"
  })
      .then(function(response) {

        createDistance(response);
        closestThree();

      });

//This function calculates distance from user's city to the National Park coordinates. Some parks do not have
//coordinates and we can deal with those edge cases later if we have time.  The parksArray holds information
// including name and designation, latitude, longitude, distance, and park code.
      function createDistance(res) {
          for (var i = 0; i <res.data.length; i++) {
            
              if (res.data[i].latLong === "") {
                  console.log("No coordinates.");
              }
              else {
                    var parkOne = res.data[i].latLong.split(",");
                    var latNum = parkOne[0].split(":");
                    var longNum = parkOne[1].split(":"); 
                    var lat = latNum[1];
                    var long = longNum[1];
                    var distance = Math.sqrt(Math.pow((long - citylong),2) + Math.pow((lat - citylat),2));
                    var myPark = [res.data[i].parkCode, res.data[i].name, res.data[i].designation, distance, lat, long];
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
      }

});
