'use strict';

/**
* Web Scraper
*/


//install Colors (made by Marak) with npm install colors (https://github.com/marak/colors.js/)
var colors = require('./node_modules/colors/');

// You should (okay: could) use your OWN implementation here!
var EventEmitter = require('events').EventEmitter;
 
// We create a global EventEmitter (Mediator pattern: http://en.wikipedia.org/wiki/Mediator_pattern )
var em = new EventEmitter();

createEmitter();


// Url regexp from http://daringfireball.net/2010/07/improved_regex_for_matching_urls
var EXTRACT_URL_REG = /\b((?:https?:\/\/|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}\/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:'".,<>?«»“”‘’]))/gi;
var PORT = 3000;

var monApi = require('./node_modules/monapi');


var request = require('request');
 
// See: http://expressjs.com/guide.html
var express = require('express');
var app = express();

monApi.recupPort(PORT);

monApi.recupExpress(app);

monApi.ListenPort();


//Import mongoose to use MongoDB (you have to install it)
var mongoose = require('mongoose');
//Create the var which will define the "tables" structure
var urlScrapSchema;
//Create the var which will store the data
var urlScrapModel;

//store the data from the DB
var theData="";

//This is an array which will store urlScrapModel objects
var theLinksToStore = new Array();

var oldConsoleLog = console.log;
console.log = function() {

  var args = Array.prototype.slice(arguments);
  var retour;
  switch(arguments[0]) {
    case "Loading..." : 
      retour = arguments[0].cyan;
      break;
    case "We got a new page!" : 
      retour = arguments[0].yellow;
      break;
    case "Oops an error occured on" : 
      retour = arguments[0].red;
      break;
    case "We got a link!" : 
      retour = arguments[0].rainbow;
      break;
    default:
      retour = arguments[0].white;
      break;
  }

  if (arguments[1] !== undefined) {
    oldConsoleLog(retour, arguments[1]);
  }
  else {
    oldConsoleLog(retour);
  }
    
};


/**
 * Get arguments
 * Argument 0 is node
 * Argument 1 is file path
 * Argument 2 is the URL
 * Argument 3 is the keyword searched
 */
var args = process.argv;
//If no arguments are given
if (args[2] == undefined) {
  var str = "You can launch this script by two different ways. One to store data in the DB, and the second to print data stored in the DB in a text file.";
  var str1 = "To store data : node scraper.js URL KEYWORD";
  var str2 = "To print data stored : node scraper.js LOCATION/FILENAME.txt";
  console.log(str.white + "\n" + str1.cyan + "\n" + str2.yellow + "\n");
  return;
}
else {

  //if two arguments are given (url and keyword)
  if(args[3] != undefined) {
    var site = args[2];
    var keyword = args[3];
    connectionDB(function() {
      get_page(site);
    });
  }
  //if one argument is given (filename and location)
  else {
    var file = args[2];
    connectionDB(function() {
      getDataFromDB(function() {
        writeToFile(theData);
      });
    })
  }
}
 
/**
* Remainder:
* queue.push("http://..."); // add an element at the end of the queue
* queue.shift(); // remove and get the first element of the queue (return `undefined` if the queue is empty)
*
* // It may be a good idea to encapsulate queue inside its own class/module and require it with:
* var queue = require('./queue');
*/
var queue = [];
 
/**
* Get the page from `page_url`
* @param {String} page_url String page url to get
*
* `get_page` will emit
*/
function get_page(page_url){
  
  em.emit('page:scraping', page_url);
   
  // See: https://github.com/mikeal/request
  request({
    url:page_url,
  }, function(error, http_client_response, html_str){
    /**
    * The callback argument gets 3 arguments.
    * The first is an error when applicable (usually from the http.Client option not the http.ClientRequest object).
    * The second is an http.ClientResponse object.
    * The third is the response body String or Buffer.
    */
     
    /**
    * You may improve what get_page is returning by:
    * - emitting HTTP headers information like:
    * -> page size
    * -> language/server behind the web page (php ? apache ? nginx ? using X-Powered-By)
    * -> was compression active ? (Content-Encoding: gzip ?)
    * -> the Content-Type
    */
     
    if(error){
      em.emit('page:error', page_url, error);
    return;
    }
   
    em.emit('page', page_url, html_str);
  });
}
 
/**
* Extract links from the web pagr
* @param {String} html_str String that represents the HTML page
*
* `extract_links` should emit an `link(` event each
*/
function extract_links(page_url, html_str){
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/match
  // "match" can return "null" instead of an array of url
  // So here I do "(match() || []) in order to always work on an array (and yes, that's another pattern).
  (html_str.match(EXTRACT_URL_REG) || []).forEach(function(url){
    // see: http://nodejs.org/api/all.html#all_emitter_emit_event_arg1_arg2
    // Here you could improve the code in order to:
    // - check if we already crawled this url
    // - ...
    em.emit('url', page_url, html_str, url);
  });
 
}
 
function handle_new_url(from_page_url, from_page_str, url){
  // Add the url to the queue
  queue.push(url);
  
  // ... and may be do other things like saving it to a database
  // in order to then provide a Web UI to request the data (or monitoring the scraper maybe ?)
  // You'll want to use `express` to do so
}

function createEmitter() {
  em.on('page:scraping', function(page_url){
    console.log('Loading...', page_url);
  });
   
  // Listen to events, see: http://nodejs.org/api/all.html#all_emitter_on_event_listener
  em.on('page', function(page_url, html_str){
    console.log('We got a new page!', page_url);
  });
   
  em.on('page:error', function(page_url, error){
    console.error('Oops an error occured on', page_url, ' : ', error);
  });
   
  em.on('page', extract_links);
   
  em.on('url', function(page_url, html_str, url){
    console.log('We got a link!', url);
    storeData(url);
  });
   
   //useless ???
  em.on('url', handle_new_url);
}



/**
 * Save the URL if the keyword is found into the URL. 
 * if the indexOf(keyword) returns -1 : I've asked to return
 * I could do the opposite, but the connection doesn't close, and refuses to close another way than this one.
 * And despite my researches, I didn't found how to solve this issue. And I'm ashamed...
 */


//This will store the URLs where the scrapper found the keyword in an array.
//If the link has already been stored, it won't be another time.
function storeData(url) {

  if(url.indexOf(keyword) != -1) {
    var str = "Keyword '" + keyword + "' found in this URL";
    oldConsoleLog(str.white);
    if(url.indexOf(site) == -1) {
      url = site+url;
    }

    var theUrl = new urlScrapModel({urlStock : url});
  
      if(theLinksToStore.length != 0) {
        theLinksToStore.forEach(function(v) {
          if(v.urlStock.indexOf(url) == -1) {
            theLinksToStore.push(theUrl);
            storeDataToDB(theUrl);
          }
        });
      }
      else {
        theLinksToStore.push(theUrl);
        storeDataToDB(theUrl);
    }
  }
  else {
    var str = "Keyword '" + keyword + "' not found in this URL";
    oldConsoleLog(str.cyan);
  }
}

function storeDataToDB(theURLToStore) {
  theURLToStore.save(function(err) {
      if(err) {
        throw err;
      }
    });
}

function getDataFromDB(callback) {
  urlScrapModel.find({ }, function(err, theLinks) {
    if(err) {
      throw err;
    }
    for(var i =0; i< theLinks.length ; i++) {
      oldConsoleLog(theLinks[i].urlStock);
      theData+="Link : '" + theLinks[i].urlStock + "' \n";
    }
    callback();
  });

}

function writeToFile(data) {
  var fs = require('fs');
  fs.writeFile(file, data, function(err) {
      if(err) {
          throw err;
      } 
      else {
        oldConsoleLog("Data written into '" + file + "'.");
      }
  });
  disconnectionDB();
}

//Connection to the the local database "scrappedlinks". If this DB hasn't been created, now it's.
function connectionDB(callback) {

  mongoose.connect('mongodb://localhost/scrappedlinks', function(err) {
    if (err) { 
      throw err; 
    }
    oldConsoleLog("You are connected");
    defineStructure();
    callback();
  });

}


//Define the schema of the "table". This indicates which kind of data we can store in the "table"
function defineStructure() {
  urlScrapSchema = new mongoose.Schema({
    urlStock : String
  });

  //Define the table name and its schema.
  urlScrapModel = mongoose.model('scrappedurls', urlScrapSchema);
}


//Disconnection to the database
function disconnectionDB() {
  mongoose.connection.close();
}


 
// #debug Start the crawler with a link
//get_page('http://twitter.com/FGRIBREAU');