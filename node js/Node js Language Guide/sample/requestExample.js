// npm i request를 통해 'node_modules'와 'package-lock.json' 자동 생성, requestExample.js 생성

const request = require('request');
request('http://localhost:3000', function (error, response, body) {
  console.error('error:', error); // Print the error if one occurred
  console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
  console.log('body:', body); // Print the HTML for the Google homepage.
});