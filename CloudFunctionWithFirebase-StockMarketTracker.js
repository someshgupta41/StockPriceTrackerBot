'use strict';

var https = require('https');

const functions = require('firebase-functions'); // Cloud Functions for Firebase library

exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) =>  {
    const action = request.body.result.action;
    
    response.setHeader('Content-Type', 'application/json');

    if (action != 'input.getStockPrice') {
        response.send(buildChatResponse("I'm sorry, I don't know this"))
        
        return;
    }
    
    const parameters = request.body.result.parameters;
    
    var companyName = parameters['company_name'];
    var priceType = parameters['price_type'];
    var date = parameters['date']

    getStockPrice(companyName, priceType, date, response);
});



function getStockPrice(companyName, priceType, date, cloudFnResponse) {
    console.log('In function getStockPrice');

    console.log("Company name: " + companyName);
    console.log("Price type: " + priceType);
    console.log("Date: " + date);

    var tickerMap = {
      "apple": "AAPL",
      "microsoft": "MSFT",
      "ibm": "IBM",
      "google": "GOOG",
      "facebook": "FB",
      "amazon": "AMZN"
    };
    
    var priceMap = {
      "opening": "open_price",
      "closing": "close_price",
      "maximum": "high_price",
      "high": "high_price",
      "low": "low_price",
      "minimum": "low_price"
    };

  var stockTicker = tickerMap[companyName.toLowerCase()];
  var priceTypeCode = priceMap[priceType.toLowerCase()];

  var pathString = "/historical_data?ticker=" + stockTicker +
    "&item=" + priceTypeCode +
    "&start_date=" + date +
    "&end_date=" + date;

    console.log('Path string: ' + pathString);
  
  var username = "6ea604409a369c169cf8a872f991be43";
  var password = "42bbcf61dcf0dd1fe706a62a6d83e20f";

  var username = “<your user name here>”;
  var password = “<your password here>”;

  var auth = "Basic " + new Buffer(username + ":" + password).toString('base64');

  var request = https.get({
    host: "api.intrinio.com",
    path: pathString,
    headers: {
      "Authorization": auth
    }
  }, function(response) {
    var json = "";
    response.on('data', function(chunk) {
        console.log("Received json response: " + chunk);
        json += chunk;
    });

    response.on('end', function() {
        var jsonData = JSON.parse(json);
        var stockPrice = jsonData.data[0].value;

        console.log("The stock price received is: " + stockPrice);

        var chat = "The " + priceType + " price for " + companyName + " on " + date + " was " + stockPrice;

        cloudFnResponse.send(buildChatResponse(chat));
    });
  });
}

function buildChatResponse(chat) {
    return JSON.stringify({ "speech": chat, "displayText": chat});
}










