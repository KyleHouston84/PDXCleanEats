var app = angular.module('roachPatrol', [
  'angular-loading-bar', 
  'ui.router'
])
.config(['$urlRouterProvider', '$stateProvider', function($urlRouterProvider, $stateProvider) {
  $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('list', {
        url: '/',
        templateUrl: 'templates/listView.html',
        controller: 'restaurantController'
      })
      .state('map', {
        url: '/map',
        templateUrl: 'templates/mapView.html',
        controller: 'restaurantController'
      })
}]);

app.controller('restaurantController', function($scope, apiCall) {
	$scope.complete = true;
	$scope.noResults = false;
	$scope.loadingAni = true;
	$scope.grades = [
		{grade: 'A', color: 'green'},
		{grade: 'B', color: 'orange'},
		{grade: 'C', color: 'red'},
	];

    $scope.init = function () {
      apiCall.search('restaurants', '-122.676193,45.523773', 1).then(function (data) {
        //-122.610775,45.448050 less data for testing
        //-122.676193,45.523773
        $scope.restaurants = data;
        $scope.loadingAni = false;
        $scope.mapCenter = '45.523773,-122.676193';
      });
    };

    $scope.initalizeMap = function() {
        var center = new google.maps.LatLng(45.522234, -122.676309); //<< pass in center latlng from either zip or myPos
        var styles = [
            {
                elementType: "geometry",
                stylers: [
                    {lightness: 33},
                    {saturation: -90}
                ]
            }
        ];


        var mapOptions = {
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            center: center,
            styles: styles
        };

        map = new google.maps.Map(document.getElementById('mapCanvas'),mapOptions);

        google.maps.event.addDomListener(window, "resize", function() {
          var center = map.getCenter();
          google.maps.event.trigger(map, "resize");
          map.setCenter(center); 
        });
    };

  	$scope.searchByName = function(searchKeyword, distance) {
  		$scope.noResults = false;
  		apiCall.search('keywordSearch',searchKeyword, distance).then(function (data){
  			console.log(data[0].message);
  			(data[0].message == "No records found.") ? $scope.noResults = true : $scope.restaurants = data;
  		});
  	};

  	$scope.searchMyLatLng = function() {
  		$scope.noResults = false;
		if (navigator.geolocation) {
	        // Use method getCurrentPosition to get coordinates
	        navigator.geolocation.getCurrentPosition(function (position) {
	            var zipLat = position.coords.latitude;
	            var zipLng = position.coords.longitude;
	            var lngLat = zipLng + ',' + zipLat;
	            var latLng = zipLat + ',' + zipLng;
	            console.log(lngLat);
              $scope.mapCenter = latLng;

	            apiCall.search('restaurants',lngLat,distance).then(function (data) {
    				(data[0].message == "No records found.") ? $scope.noResults = true : $scope.restaurants = data;
  				});

	        });
	    } else {
	        alert('Geolocation not supported, please select zipcode from drop down menu');
	        return false;
	    }
  	};

  	$scope.searchByArea = function(area, distance) {
		var areaCoords = {
			N: '-122.710774,45.585251',
			NE: '-122.618728,45.553242',
			SE: '-122.601849,45.503453',
			SW: '-122.715649,45.467799',
			NW: '-122.698944,45.534587'
		};

		apiCall.search('restaurants', areaCoords[area], distance).then(function (data) {
    		(data[0].message == "No records found.") ? $scope.noResults = true : $scope.restaurants = data;
  		});
  	};

  	$scope.getInspection = function(ID) {
  		console.log("searching for inspection ID: "+ ID);
  		apiCall.search('inspectionID', ID).then(function (data) {
    		//(data[0].message == "No records found.") ? $scope.noResults = true : $scope.restaurants = data;
    		console.log("Inspection Data: ");
    		console.log(data);
    		$scope.inspectionsRecord = {};
    		$scope.inspectionsRecord[ID] = data;
  		});
  	};

  	$scope.filterEmpty = function(violation) {
  		if(violation.violation_comments.replace(/\s+/g, '') == "") {
  			return false
  		} else {
  			return true;
  		}
  	};

  	$scope.giveColor = function(score) {
  		if (score >= 90) {
  			return $scope.grades[0].color;
  		} else if (score >= 80) {
  			return $scope.grades[1].color;
  		} else {
  			return $scope.grades[2].color;
  		}
  	}

  	$scope.showGrade = function(score) {
  		if (score >= 90) {
  			return $scope.grades[0].grade;
  		} else if (score >= 80) {
  			return $scope.grades[1].grade;
  		} else {
  			return $scope.grades[2].grade;
  		}
  	}
});

app.service('apiCall', function ($http, $q){
	var drown;

	var search = function(route, option, d) {
		var defferer = $q.defer();
		$http.get('/'+route, {params:{data:option,dis:d}})
			.success(function(data) {
				console.log(data);
				drown = data;
				defferer.resolve(data);
			})
			.error(function() {
				console.log("Error: " + data);
			})
		return defferer.promise;
	};

	return {
		data: drown,
		search: search
	}

});	