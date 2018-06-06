$(document).ready(function() {

    var npArr = ["Zion", "Arches", "Grand Canyon"];

    function newButton(){
    
        for(i=0;i<npArr.length;i++){

            var newButton = $("<button>");
            newButton.attr("id", "npButton");
            newButton.text(npArr[i]);
            $("#buttonBox").append(newButton);

        }
    }

    newButton();
});