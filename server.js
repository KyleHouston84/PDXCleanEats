var st = require('st');
var request = require("request");
var http = require('http');
var Router = require("routes-router");
var router = Router();

var body = '';
var body2 = '';

//Call for inspection records around a certain LatLng
function getRestaurants(response, query) {

    var arrBackbone = [];

    console.log("Query:");
    query = query.substring(5);
    console.log(query);

    //making API GET request
    http.get("http://api.civicapps.org/restaurant-inspections/near/" + query + "?distance=1&count=20000", function (res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function (chunk) {
            body += chunk;
            console.log("---------------Recieved a chunk of data from API--------------");
        });
        res.on('end', function () {
            
            var obj = JSON.parse(body);
            console.log("---------------closing connection with server--------------");
            if (!obj.hasOwnProperty("results")) {
                console.log("<<<<<<<<<< no results >>>>>>>>>>>");
                arrBackbone.push(obj[0]);
            } else {
                //removing inspections with the score of 0
                for (var i = (obj.results.length - 1); i > -1; i--) {
                    //Changing inspection_number to an array of objects
                    obj.results[i].inspection_number = [{
                    	'record_num' : obj.results[i].inspection_number, 
                    	'score' : obj.results[i].score, 
                    	'date' : obj.results[i].date
                    }];

                    if (obj.results[i].score != 0) {
                        //This record has a score over 0

                        var index = -1;

                        for(var j = 0; j < arrBackbone.length; j++) {
                            //searching arrBackbone for a record with the same id
                            if (arrBackbone[j].id === obj.results[i].id) {
                                //found it, pass along the index of the record
                                index = j;
                                break;
                            }
                        };
                        if (index >= 0){
                        	var tempObj = {
                        		'record_num' : obj.results[i].inspection_number[0].record_num, 
                        		'score' : obj.results[i].score, 
                        		'date' : obj.results[i].date
                        	};
                            arrBackbone[index].inspection_number.push(tempObj)
                        } else {
                            //This restaurant is not in arrBackbone yet
                            arrBackbone.push(obj.results[i])
                        };
                    };
                }
                arrBackbone.sort(function(a,b) {return parseFloat(a.distance - b.distance)});
            }
            response.end(JSON.stringify(arrBackbone));
        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    });
    console.log("---------------End of API function--------------");
    return true;
};

function seachRestaurants(response, query) {

    var arrBackbone = [];

    console.log("Query:");
    query = query.substring(5);
    console.log(query);

    //making API GET request
    http.get("http://api.civicapps.org/restaurant-inspections/?restaurant_name=" + query + "", function (res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function (chunk) {
            body += chunk;
            console.log("---------------Recieved a chunk of data from API--------------");
        });
        res.on('end', function () {
            
            var obj = JSON.parse(body);
            console.log(obj);
            console.log("---------------closing connection with server--------------");
            console.log(typeof obj);
            //console.log(obj[0].hasOwnProperty("message"));
            if (!obj.hasOwnProperty("results")) {
                console.log("<<<<<<<<<< no results >>>>>>>>>>>");
                arrBackbone.push(obj[0]);
            } else {
                //removing inspections with the score of 0
                for (var i = (obj.results.length - 1); i > -1; i--) {
                    //Changing inspection_number to an array of objects
                    obj.results[i].inspection_number = [{
                    	'record_num' : obj.results[i].inspection_number, 
                    	'score' : obj.results[i].score, 
                    	'date' : obj.results[i].date
                    }];

                    if (obj.results[i].score != 0) {
                        //This record has a score over 0

                        var index = -1;

                        for(var j = 0; j < arrBackbone.length; j++) {
                            //searching arrBackbone for a record with the same id
                            if (arrBackbone[j].restaurant_id === obj.results[i].restaurant_id) {
                                //found it, pass along the index of the record
                                index = j;
                                break;
                            }
                        };
                        if (index >= 0){
                        	var tempObj = {
                        		'record_num' : obj.results[i].inspection_number[0].record_num, 
                        		'score' : obj.results[i].score, 
                        		'date' : obj.results[i].date
                        	};
                            arrBackbone[index].inspection_number.push(tempObj)
                        } else {
                            //This restaurant is not in arrBackbone yet
                            arrBackbone.push(obj.results[i])
                        };
                    };
                }
                arrBackbone.sort(function(a,b) {return parseFloat(a.distance - b.distance)});
            }
            response.end(JSON.stringify(arrBackbone));
        });
        res.on('error', function (e) {
            console.log("Got error: " + e.message);
        });
    });
    console.log("---------------End of API function--------------");
    return true;
};

function getInspection(response, query) {
    var queryArr = [];
    var responseData = [];

	console.log("Query:");
    query = query.substring(5);
    console.log(query);

    //building and async call for all of the elements in the array...
    var bodyTest = '';

    http.get("http://api.civicapps.org/restaurant-inspections/inspection/" + query, function (res) {
        console.log("Got response: " + res.statusCode);
        res.on('data', function (chunk) {
            bodyTest += chunk;
            console.log("chunk :" + chunk);
            console.log("---------------Recieved a chunk of data from API--------------");
        });
        res.on('end', function () {
            console.log("---------------Parsing body--------------");
            var obj = JSON.parse(bodyTest);
            console.log('obj = '+obj);
            responseData.push(obj.results);
            console.log("---------------Sending data to client--------------");
            console.log(JSON.stringify(responseData));
            response.end(JSON.stringify(responseData));
            console.log("---------------closing connection with server--------------");
            console.log('--------------Clearing variables-----------');
        });
        })   
    console.log("---------------End of API function--------------");
};

//Getting inspections
router.addRoute("/restaurants", {
    GET: function(req,res,opts) {
        body = '';
        console.log("---------------Calling GET function--------------");
        getRestaurants(res,opts.parsedUrl.query);
        console.log("---------------Passing data to client--------------");
        console.log("---------------Finished Sending data to the client--------------");
    }
});

//Getting inspections searching by keyword
router.addRoute("/keywordSearch", {
    GET: function(req,res,opts) {
        body = '';
        console.log("---------------Calling GET function--------------");
        seachRestaurants(res,opts.parsedUrl.query);
        console.log("---------------Passing data to client--------------");
        console.log("---------------Finished Sending data to the client--------------");
    }
});

router.addRoute("/inspectionID", {
    GET: function(req,res,opts) {
        body2 = '';
        console.log("---------------Calling GET for inspection report function--------------");
        console.log(opts.parsedUrl.query);
        getInspection(res,opts.parsedUrl.query);
        console.log("---------------Passing data to client--------------");
        console.log("---------------Finished Sending data to the client--------------");
    }
});

//Getting index.html if one isn't specified
var indexFile = process.argv[2] || 'index';

router.addRoute("/*", st({
    path: __dirname,
    index:'/'+indexFile+'.html' //allows alternative files
}));

//Creating server and start listening on port 8080
var server = http.createServer(router);
console.log('server listening on port # 8080');
server.listen(8080);