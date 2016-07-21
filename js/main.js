$(function(){
	$(".search-content")
	.focus(function(){
		$(".search-result").fadeIn();
	})
	.blur(function(){
		if(!$(".search-result").is(":hover")) {
			$(".search-result").fadeOut();
		}else{
			$(this).focus();
		}
	});
});

var indexApp = angular.module('IndexApp', []);
indexApp.controller('SearchCtrl', function($scope, $http){
	$scope.search = function(){
		$(".search-result").animate({scrollTop: 0}, "fast");
		if($scope.searchContent == '')
			return;
		var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","comment","attributes"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":20,"query":$scope.searchContent};			
		// var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":["00000000-0000-0000-0000-000000031102"],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","00000000-0000-0000-0000-000000003114","00000000-0000-0000-0000-000000000202","comment"],"order":{"by":"name","sort":"asc"},"offset":0,"limit":500,"query":$scope.searchContent};
		$http({
				method: 'POST',
				url: 'https://gwu.collibra.com/rest/1.0/search',
				contentType: "application/json",
				data: JSON.stringify(data)
		}).then(
			function successCallback(response) {
			    $scope.results = response.data.results;
			    console.log($scope.results);
			    angular.forEach($scope.results, function(result){
			    	if(result.context.restUrl != ''){
			    		$http({
							method: 'GET',
							url: result.context.restUrl
						}).then(
							function successCallback(response) {
			    				if(response.data.communityReference)
							    	result.higherReference = response.data.communityReference.name;
							}, function errorCallback(response) {
								console.log('ERROR');
							}
						);
			    	}
			    });
			}, function errorCallback(response) {
				console.log('ERROR');
			}
		);
	}
});




var communitiesApp = angular.module('CommunitiesApp', []);
communitiesApp.controller('SearchCtrl', function($scope, $http){
	$http({
		method: 'GET',
		url: 'https://gwu.collibra.com/rest/1.0/community/all',
		contentType: "application/json"
	}).then(
		function successCallback(response) {
		   $scope.results = response.data.communityReference;
		   console.log(response);
		}, function errorCallback(response) {
			console.log('ERROR');
		}
	);
});