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

var mainApp = angular.module('MainApp', []);
mainApp.controller('SearchCtrl', function($scope, $http){
	$scope.search = function(){
		$(".search-result").animate({scrollTop: 0}, "fast");
		if($scope.searchContent == '')
			return;
		var data = {'query':$scope.searchContent,
					'filter':{
						'category':[
						   'CO',
						   'VC',
						   'UR',
						   'GR',
						   'TE',
						   'SS'
						]
					},
					'fields':[
					   'name'
					]};
		$http({
				method: 'POST',
				url: 'https://gwu.collibra.com/rest/1.0/search',
				contentType: "application/json",
				data: JSON.stringify(data)
		}).then(
			function successCallback(response) {
			    $scope.results = response.data.results;
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