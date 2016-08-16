var indexApp = angular.module('IndexApp', ['ngRoute']);
indexApp.config(function($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: 'home.html',
        controller: 'HomeCtrl',
        css: 'css/home.css'
      }).
      when('/communities', {
        templateUrl: 'communities.html',
        controller: 'CommunitiesCtrl',
        css: 'css/communities.css'
      }).
      when('/login', {
        templateUrl: 'login.html',
        controller: 'LoginCtrl',
        css: 'css/login.css'
      }).
      when('/report_catalog', {
        templateUrl: 'report_catalog.html',
        controller: 'ReportCatalogCtrl',
        css: 'css/report_catalog.css'
      }).
      when('/data_sharing_agreements', {
        templateUrl: 'data_sharing_agreements.html',
        controller: 'DataSharingAgreementsCtrl',
        css: 'css/data_sharing_agreements.css'
      }).
      when('/data_quality_help_desk', {
        templateUrl: 'data_quality_help_desk.html',
        controller: 'DataQualityHelpDeskCtrl',
        css: 'css/data_quality_help_desk.css'
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
				url: 'https://gwu.collibra.com/rest/latest/search',
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
 });

indexApp.controller('IndexCtrl', function($scope, $route){
	$scope.$watch( function(){
		return $route.current.css;
	}, function(value){
		$scope.css = value;
	});
});

indexApp.controller('HomeCtrl', function($scope, $http, $location, $rootScope, $route){
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

	$scope.delaySearch = function(){
		$scope.delay($scope.search, 400);
	}

	$scope.delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();

	$scope.search = function(){
		$(".search-result").animate({scrollTop: 0}, "fast");
		if($scope.searchContent == '')
			return;
		var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","comment","attributes"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":20,"query":$scope.searchContent};			
		$http({
				method: 'POST',
				url: 'https://gwu.collibra.com/rest/latest/search',
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

	var data = {"filter":{"category":["CO"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","00000000-0000-0000-0000-000000003114","00000000-0000-0000-0000-000000000202","comment"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":1000,"query":"*"};
	$http({
		method: 'POST',
		url: 'https://gwu.collibra.com/rest/latest/search',
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
			url: 'https://gwu.collibra.com/rest/latest/search',
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
  

indexApp.controller('ReportCatalogCtrl', function($scope, $http, $location){
	$scope.report_status_selected = {};
	$scope.report_types_selected = {};
	$scope.communities_selected = {};

	//Get report catalog
	var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":["00000000-0000-0000-0000-000000031102"],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","00000000-0000-0000-0000-000000003114","00000000-0000-0000-0000-000000000202","comment"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":1000,"query":"*"};
	$http({
		method: 'POST',
		url: 'https://gwu.collibra.com/rest/latest/search',
		contentType: "application/json",
		data: JSON.stringify(data)
	}).then(
		function successCallback(response) {
			$scope.results = response.data.results;
			var totalCount = 0;
			var count = 0;
			angular.forEach($scope.results, function(result){
				angular.forEach(result.attributes, function(attribute){
					if(attribute.type == 'Link'){
						totalCount++;
						$http({
							method: 'GET',
							url: attribute.restUrl,
							contentType: "application/json"
						}).then(
							function successCallback(response) {
								angular.forEach(response.data.attributeReferences.attributeReference, function(attributeReference){
									if(attributeReference.value != undefined){
										var indexStart = attributeReference.value.indexOf('href="https://gsource.gwu.edu/');
										if(indexStart >= 0){
											var tempUrl = attributeReference.value.substring(indexStart+6);
											var finalUrl = tempUrl.substring(0, tempUrl.indexOf('"'));
											result.gsourceLink = finalUrl;
										}
									}
								});
								count++;
								if(count == totalCount){
									$scope.loading_icon_display = false;
								}
							}, function errorCallback(response) {
								$location.path("/Collibra/");
								$rootScope.msg="Time out! Please log in and try again!";
							}
						);
					}
				});
			});
		}, function errorCallback(response) {
			$location.path("/Collibra/");
			$rootScope.msg="Time out! Please log in and try again!";
		}
	);


	$scope.scrollTop = function(){
		$(".table>tbody").animate({scrollTop: 0}, "fast");
	}

	$scope.changeCheckedBox = function(type, id){
		$scope.currentPage = 1;
		switch(type){
			case 1:
				if($scope.report_status_selected[id]){
					if(id == 0){
						angular.forEach($scope.report_status_selected,function(value, key){
		                	$scope.report_status_selected[key] = false;
			            });
			            $scope.report_status_selected[0] = true;
						$scope.disable_selection_all_1 = true;
					}else{
						$scope.report_status_selected[0] = false;
						$scope.disable_selection_all_1 = false;
					}
				}else{
					var updateAllSelection = true;
					angular.forEach($scope.report_status_selected,function(value, key){
	                	if($scope.report_status_selected[key] != false){
							updateAllSelection = false;
						}
		            });
					if(updateAllSelection){
						$scope.report_status_selected[0] = true;
						$scope.disable_selection_all_1 = true;
					}
				}
				break;
			case 2:
				if($scope.report_types_selected[id]){
					if(id == 0){
						angular.forEach($scope.report_types_selected,function(value, key){
		                	$scope.report_types_selected[key] = false;
			            });
			            $scope.report_types_selected[0] = true;
						$scope.disable_selection_all_2 = true;
					}else{
						$scope.report_types_selected[0] = false;
						$scope.disable_selection_all_2 = false;
					}
				}else{
					var updateAllSelection = true;
					angular.forEach($scope.report_types_selected,function(value, key){
	                	if($scope.report_types_selected[key] != false){
							updateAllSelection = false;
						}
		            });
					if(updateAllSelection){
						$scope.report_types_selected[0] = true;
						$scope.disable_selection_all_2 = true;
					}
				}
				break;
			case 3:
				if($scope.communities_selected[id]){
					if(id == 0){
						angular.forEach($scope.communities_selected,function(value, key){
		                	$scope.communities_selected[key] = false;
			            });
			            $scope.communities_selected[0] = true;
						$scope.disable_selection_all_3 = true;
					}else{
						$scope.communities_selected[0] = false;
						$scope.disable_selection_all_3 = false;
					}
				}else{
					var updateAllSelection = true;
					angular.forEach($scope.communities_selected,function(value, key){
	                	if($scope.communities_selected[key] != false){
							updateAllSelection = false;
						}
		            });
					if(updateAllSelection){
						$scope.communities_selected[0] = true;
						$scope.disable_selection_all_3 = true;
					}
				}
				break;
		}
	}

	$scope.clearFilters = function(){
		$scope.query = '';
		$scope.report_status_selected[0]=true;
		$scope.report_types_selected[0]=true;
		$scope.communities_selected[0]=true;
		$scope.disable_selection_all_1=true;
		$scope.disable_selection_all_2=true;
		$scope.disable_selection_all_3=true;
		var report_status_selected_length = Object.keys($scope.report_status_selected)[Object.keys($scope.report_status_selected).length-1];
		var report_types_selected_length = Object.keys($scope.report_types_selected)[Object.keys($scope.report_types_selected).length-1];
		var communities_selected_length = Object.keys($scope.communities_selected)[Object.keys($scope.communities_selected).length-1];
		for(var i=1; i<=report_status_selected_length; i++)
			$scope.report_status_selected[i]=false;
		for(var i=1; i<=report_types_selected_length; i++)
			$scope.report_types_selected[i]=false;
		for(var i=1; i<=communities_selected_length; i++)
			$scope.communities_selected[i]=false;
	}
});

indexApp.controller('DataSharingAgreementsCtrl', function($scope, $http, $location){
	$scope.status_selected = {};

	//Get Data Sharing Agreements
	var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":["0f30917a-2199-4240-a409-8395aabc7237"],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","00000000-0000-0000-0000-000000003114","00000000-0000-0000-0000-000000000202","comment"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":1000,"query":"*"};
	$http({
		method: 'POST',
		url: 'https://gwu.collibra.com/rest/latest/search',
		contentType: "application/json",
		data: JSON.stringify(data)
	}).then(
		function successCallback(response) {
			$scope.results = response.data.results;
		}, function errorCallback(response) {
			$location.path("/Collibra/");
			$rootScope.msg="Time out! Please log in and try again!";
		}
	);

	$scope.changeCheckedBox = function(id){
		if($scope.status_selected[id]){
			if(id == 0){
				angular.forEach($scope.status_selected,function(value, key){
                	$scope.status_selected[key] = false;
	            });
	            $scope.status_selected[0] = true;
				$scope.disable_selection_all = true;
			}else{
				$scope.status_selected[0] = false;
				$scope.disable_selection_all = false;
			}
		}else{
			var updateAllSelection = true;
			angular.forEach($scope.status_selected,function(value, key){
            	if($scope.status_selected[key] != false){
					updateAllSelection = false;
				}
            });
			if(updateAllSelection){
				$scope.status_selected[0] = true;
				$scope.disable_selection_all = true;
			}
		}
	}
});

indexApp.controller('DataQualityHelpDeskCtrl', function($scope, $http, $location){
	// -------jQuery START----------
	$(function(){
		$('.relevant-assets').on('focus', function() {
			$(".search-result").fadeIn();
		});
		$('.relevant-assets').on('blur', function() {
			if(!$(".search-result").is(":hover")) {
				$(".search-result").fadeOut();
			}else{
				$(this).focus();
			}
		});
	});
	// -------jQuery END----------

	// Textarea Plugin Initialization
	tinymce.init({
		selector: 'textarea',
		resize: false,
		height: 130,
		width: window.innerWidth*0.53
	});

	$scope.status_selected = {};
	$scope.issue={relatedTerm:[]}

	//Get Data Issues
	var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":["00000000-0000-0000-0000-000000031001"],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","00000000-0000-0000-0000-000000003114","00000000-0000-0000-0000-000000000202","comment"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":1000,"query":"*"};
	$http({
		method: 'POST',
		url: 'https://gwu.collibra.com/rest/latest/search',
		contentType: "application/json",
		data: JSON.stringify(data)
	}).then(
		function successCallback(response) {
			$scope.results = response.data.results;
			console.log($scope.results);
		}, function errorCallback(response) {
			$location.path("/Collibra/");
			$rootScope.msg="Time out! Please log in and try again!";
		}
	);

	
	$http({
		method: 'GET',
		url: 'https://gwu.collibra.com/rest/latest/community/all',
		contentType: "application/json"
	}).then(
		function successCallback(response) {
			console.log(response);
			$scope.communities =  response.data.communityReference;
		}, function errorCallback(response) {
			$location.path("/Collibra/");
			$rootScope.msg="Time out! Please log in and try again!";
		}
	);

	$scope.changeCheckedBox = function(id){
		if($scope.status_selected[id]){
			if(id == 0){
				angular.forEach($scope.status_selected,function(value, key){
                	$scope.status_selected[key] = false;
	            });
	            $scope.status_selected[0] = true;
				$scope.disable_selection_all = true;
			}else{
				$scope.status_selected[0] = false;
				$scope.disable_selection_all = false;
			}
		}else{
			var updateAllSelection = true;
			angular.forEach($scope.status_selected,function(value, key){
            	if($scope.status_selected[key] != false){
					updateAllSelection = false;
				}
            });
			if(updateAllSelection){
				$scope.status_selected[0] = true;
				$scope.disable_selection_all = true;
			}
		}
	}

	$scope.createIssue = function(){
		$http({
			method: 'POST',
			url: 'https://gwu.collibra.com/rest/1.0/issue',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			transformRequest: function(obj) {
		        var str = [];
		        for(var p in obj)
		        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		        return str.join("&");
		    },
			data: {requester:'a79f4257-016f-4704-a0b3-952c547d7a50', signifier: 'test', type: 'test'}
		}).then(
			function successCallback(response) {
				console.log(response);
			}, function errorCallback(response) {
				console.log("FAIL+++++++++++++++");
			}
		);
	}

	$scope.addRelevantAssets = function(newData){
		$scope.newRelatedTerm = "";
		$scope.issue.relatedTerm.push(newData);
		$scope.inputFocused = true;
		console.log($scope.issue.relatedTerm);
	}

	$scope.deleteRelevantAssets = function(index){
		$scope.issue.relatedTerm.splice(index, 1); 
	}

	$scope.delaySearch = function(){
		$scope.delay($scope.search, 400);
	}

	$scope.delay = (function(){
		var timer = 0;
		return function(callback, ms){
			clearTimeout (timer);
			timer = setTimeout(callback, ms);
		};
	})();

	$scope.search = function(){
		$(".search-result").animate({scrollTop: 0}, "fast");
		if($scope.newRelatedTerm == '')
			return;
		var index = $scope.newRelatedTerm.lastIndexOf(";");
		var searchContent = $scope.newRelatedTerm.substring(index+1);
		var data = {"filter":{"category":["TE","VC","CO","SS","UR","GR"],"includeMeta":false,"type":{"asset":[],"domain":[]},"community":[],"vocabulary":[],"status":[]},"fields":["name","comment","attributes"],"order":{"by":"score","sort":"desc"},"offset":0,"limit":20,"query":searchContent};			
		$http({
				method: 'POST',
				url: 'https://gwu.collibra.com/rest/latest/search',
				contentType: "application/json",
				data: JSON.stringify(data)
		}).then(
			function successCallback(response) {
			    $scope.relavantAssets = response.data.results;
			    angular.forEach($scope.relavantAssets, function(result){
			    	if(result.context.restUrl != ''){
			    		$http({
							method: 'GET',
							url: result.context.restUrl
						}).then(
							function successCallback(response) {
			    				if(response.data.communityReference)
							    	result.higherReference = response.data.communityReference.name;
							}, function errorCallback(response) {

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


//===========================Filters===========================
indexApp.filter("deleteDuplicate", function(){
	return function(collection, keyname) {
    	var output = [], 
        keys = [];
	    angular.forEach(collection, function(item) {
	        var key = item[keyname];
	        if(key == null){
	        	key == "";
	        	item.reportType="UNDEFINED";
	        }
	        if(keys.indexOf(key) === -1) {
	            keys.push(key);
	            output.push(item);
	        }
	    });
	    return output;
    };
});
indexApp.filter("deleteDuplicateForCommunities", function(){
	return function(collection) {
    	var output = [], 
    	keys = [];
	    angular.forEach(collection, function(item) {
	        var key = item.context.val;
	        if(keys.indexOf(key) === -1) {
	            keys.push(key);
	            output.push(item);
	        }
	    });
    return output;
    };
});
indexApp.filter("RCResultFilter", function(){
	return function(collection, report_status_selected, report_types_selected, communities_selected) {
    	var output = [];
    	if(report_status_selected[0] && report_types_selected[0] && communities_selected[0])
    		return collection;
	    angular.forEach(collection, function(item) {
	    	var pass1=false, pass2=false, pass3=false;
    		if(!report_status_selected[0]){
		        angular.forEach(report_status_selected, function(item2) {
		        	if(!pass1 && item.status == item2)
		        		pass1=true;
		        });
			}else{
				pass1 = true;
			}
			if(pass1 && !report_types_selected[0]){
		        angular.forEach(report_types_selected, function(item2) {
		        	if(!pass2 && item.reportType == item2 )
		        		pass2=true;
		        });
		    }else if(report_types_selected[0]){
		    	pass2 = true;
		    }
	        if(pass1 && pass2 && !communities_selected[0]){
		        angular.forEach(communities_selected, function(item2) {
		        	if(!pass3 && item.context.val == item2)
		        		pass3=true;
		        });
		    }else if(communities_selected[0]){
		    	pass3 = true;
		    }
		    if(pass1 && pass2 & pass3)
		    	output.push(item);
	    });
    	return output;
    };
});
indexApp.filter("searchBarFilter", function(){
	return function(collection, content){
		if(content == "" || content == null)
			return collection;
		var output = [];
		content = content.toLowerCase();
		angular.forEach(collection, function(item) {
			if(item.description == undefined){
				if(~item.name.val.toLowerCase().indexOf(content))
					output.push(item);
			}else{
				if(~item.name.val.toLowerCase().indexOf(content) || ~item.description.toLowerCase().indexOf(content))
					output.push(item);
			}
		});
		return output;
	}
});
indexApp.filter("DSAResultFilter", function(){
	return function(collection, status_selected) {
		if(status_selected[0])
			return collection;
		var output = [];
		angular.forEach(collection, function(item) {
			angular.forEach(status_selected, function(item2) {
				if(item.status == item2)
					output.push(item);
			});
		});
		return output;
	}
});