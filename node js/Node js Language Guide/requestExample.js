// npm i request를 통해 'node_modules'와 'package-lock.json' 자동 생성, requestExample.js 생성

const request = require('request');

// New API(https://newsapi.org/)를 통해 뉴스 내용을 뽑는다.
var url = 'http://newsapi.org/v2/top-headlines?' +'country=kr&' + 'apiKey=78bc6ddd8cdb48ceac76f5f9b9dfc4c5';
request(url2, function (error, response, body) {
  // console.error('error:', error); // Print the error if one occurred
  // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
  var jsObj = JSON.parse(body);
  // console.dir(jsObj); // dir : 보는 형식을 바꿈
  console.dir(jsObj.articles[0].title);
});


// 기상청 육상 중기예보n
var url2 = "http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnld=109";
request(url2, function (error, response, body) {
  console.log('body:', body); // Print the HTML for the Google homepage.
});


// 내가 원하는 데이터만 뽑기! 기상예보시간: rss -> channel -> item -> description -> header -> wf
var parseString = require("xml2js").parseString;
var url3 = "http://www.weather.go.kr/weather/forecast/mid-term-rss3.jsp?stnld=109";
request(url3, function (error, response, body) {
  parseString(body, function (err, result) {
    console.dir(result.rss.channel[0].item[0].description[0].header[0].wf[0]);
  });
});

