

var indexApp = angular.module('IndexApp', ['ngRoute']);
indexApp.config(function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'home.html',
        controller: 'HomeCtrl'
      }).
      when('/communities', {
        templateUrl: 'communities.html',
        controller: 'CommunitiesCtrl'
      }).
      when('/login', {
        templateUrl: 'login.html'
      }).
      otherwise({
        redirectTo: '/'
      });
});

indexApp.run( function($rootScope, $location, $http) {

    // register listener to watch route changes
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    	var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","comment","attributes"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":1,"query":"whatever"};			
		$http({
				method: 'POST',
				url: 'https://gwu.collibra.com/rest/1.0/search',
				contentType: "application/json",
				data: JSON.stringify(data)
		}).then(
			function successCallback(response) {
			}, function errorCallback(response) {
				if ( next.templateUrl == "login.html" ) {
		          // already going to #login, no redirect needed
		        } else {
		          // not going to #login, we should redirect now
		          $location.path( "/login" );
		        }
			}
		);       
    });
 })


indexApp.controller('HomeCtrl', function($scope, $http, $location, $rootScope){
	// -------jQuery START----------
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
	// -------jQuery END----------

	$scope.search = function(){
		$(".search-result").animate({scrollTop: 0}, "fast");
		if($scope.searchContent == '')
			return;
		var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","comment","attributes"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":20,"query":$scope.searchContent};			
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
				$location.path("/Collibra/");
				$rootScope.msg="Time out! Please log in and try again!";
			}
		);
	}
});

indexApp.controller('CommunitiesCtrl', function($scope, $http, $location, $rootScope){

	var data = {"filter":{"category":["CO"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","00000000-0000-0000-0000-000000003114","00000000-0000-0000-0000-000000000202","comment"],"order":{"by":"name","sort":"asc"},"offset":0,"limit":1000,"query":"*"};
	$http({
		method: 'POST',
		url: 'https://gwu.collibra.com/rest/1.0/search',
		contentType: "application/json",
		data: JSON.stringify(data)
	}).then(
		function successCallback(response) {
			$scope.results = response.data.results;
			var results = angular.copy(response.data.results);
		   	$scope.restructureResult = [];

		   	for (var i = results.length - 1; i >= 0; i--) {
			    if (results[i].context.val == null || results[i].context.val == '') {
			    	$scope.restructureResult.push({"title": results[i].name.val, "content": []});
			    	results.splice(i, 1);
			    }
			}

			for (var i = $scope.restructureResult.length - 1; i >= 0; i--) {
			    for(var j = results.length - 1; j >= 0; j--){
			    	if($scope.restructureResult[i].title == results[j].context.val){
			    		$scope.restructureResult[i].content.push({"title": results[j].name.val, "content": []});
			    		results.splice(j, 1);
			    	}
			    }
			}

			for (var i = $scope.restructureResult.length - 1; i >= 0; i--) {
				for(var j = $scope.restructureResult[i].content.length - 1; j >= 0; j--){
					for(var m = results.length - 1; m >= 0; m--){
				    	if($scope.restructureResult[i].content[j].title == results[m].context.val){
				    		$scope.restructureResult[i].content[j].content.push({"title": results[m].name.val, "content": []});
				    		results.splice(m, 1);
				    	}
				    }
				}
			}

			for (var i = $scope.restructureResult.length - 1; i >= 0; i--) {
				for(var j = $scope.restructureResult[i].content.length - 1; j >= 0; j--){
					for(var m = $scope.restructureResult[i].content[j].content.length - 1; m>= 0; m--){
						for(var n = results.length - 1; n >= 0; n--){
					    	if($scope.restructureResult[i].content[j].content[m].title == results[n].context.val){
					    		$scope.restructureResult[i].content[j].content[m].content.push({"title": results[n].name.val, "content": []});
					    		results.splice(n, 1);
					    	}
					    }
					}
				}
			}
		   	console.log($scope.restructureResult);
		}, function errorCallback(response) {
			$location.path("/Collibra/");
			$rootScope.msg="Time out! Please log in and try again!";
		}
	);

	$scope.updateSearchBox = function(content){
		$scope.query=content;
	}
});


indexApp.controller('LoginCtrl', function($scope, $http, $location, $rootScope){
	$scope.login= function(){
		window.open("https://gwu.collibra.com");
	}
	$scope.back = function(){
		$rootScope.msg="Please wait...";
		$scope.btn_disabled = true;
		var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","comment","attributes"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":1,"query":"age"};			
		$http({
			method: 'POST',
			url: 'https://gwu.collibra.com/rest/1.0/search',
			contentType: "application/json",
			data: JSON.stringify(data)
		}).then(
			function successCallback(response) {
				$rootScope.msg="";
				$location.path("/Collibra/");
			}, function errorCallback(response) {
				$rootScope.msg="You have not logged in. Please log in and try again!";
				$scope.btn_disabled = false;
			}
		);
	}
});
  