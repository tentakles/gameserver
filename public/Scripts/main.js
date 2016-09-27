
var repellViewModel;

function initViewModel() {

    var appName = "Repellbahn";
	
	var canvaselement = $('#canvas');
    
    repellViewModel = new RepellViewModel(appName,canvaselement);
    ko.applyBindings(repellViewModel, document.getElementById("htmlTop"));

}


$(function() {
  
    initViewModel();

});