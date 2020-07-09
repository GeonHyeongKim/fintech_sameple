/*
좋은 예재는 아닙니다.
목적 : callback 함수에서 데이터를 어떻게 전달이 되는지를 확인한다.
*/

var fs = require('fs');

console.log("start");
var readData = "none";

function callbackFunc(callback) {
    fs.readFile("./example/test.txt", "utf8", function (err, result){  // callback 함수
        if (err) {
            console.error(err);
            throw err;
        } else {
            data = result;
            callback(readData)
        }
    });
}

console.log("A");

callbackFunc(function (data){ // 다른 라이브러리를 사용할 때 이러한 유형을 많이 보게 될 것이다.
    console.log(data);
    console.log("C");
})