const express = require("express");
const app = express();
const request = require("request"); // 모듈 import, request 가져오기

var mysql = require('mysql'); // DB 연동
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1183',
  database: 'fintech'
});

connection.connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // ejs 사용 코드 추가

app.use(express.json()); // // 리퀘스트 바디 허용 코드 추가
app.use(express.urlencoded({ extended: false })); // data를 받아 올수 있도록 허용

app.use(express.static(__dirname + '/public')); // public이라는 folder를 외부에 공개 하겠다

app.get("/", function (req, res) {
  res.send("Hello World");
});

app.get("/hello", function (req, res) {
  res.send("안녕하세요 !");
});

app.get("/htmlTest", function (req, res) {
  res.send("<html><h1>안녕하세요</h1><hr/><p>만들기 어렵습니다</p></html>");
});

app.get("/ejsTest", function (req, res) { // ejs 뷰파일 및 라우터 추가
  res.render("test");
});

app.get("/inputTest", function (req, res) {
  res.render("inputTest");
});

app.get("/designTest", function (req, res) {
  res.render("design");
});

app.get("/signup", function (req, res) { // 오픈 뱅킹 API 로그인
  res.render("signup");
});

app.get("/authResult", function (req, res) { // 인증 결과
  var authCode = req.query.code;
  console.log('인증코드 : ', authCode); // 인증코드 보여주기
  var option = { // object이기 때문에 중괄호!
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },

    //form 형태는 form / 리쿼스트링 형태는 qs / json 형태는 json ***
    form: {
      code: authCode,
      client_id: "md8ZEKlZ3OVjN5A8kEtXUBPahUHWU8cOL4oCe0Z2",
      //#자기 키로 스크릿 변경
      client_secret: "5pRQ2f3n62RtI1TNj4x195tX4OpSiXhDzWv5Z3FV",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code"
    },
  };

  request(option, function (error, response, body) {
    var accessRequestResult = JSON.parse(body); // 데이터
    console.log(accessRequestResult);
    res.render("resultChild", { data: accessRequestResult });
  });
});

// 비동기 통신 - 서버 프론트 통신 ajax
// 로그인 정보 전달 ajax 코드 및 라우터 완성
app.post("/getLoginData", function (req, res) {
  var userId = req.body.ajaxUserId;
  var userPassword = req.body.ajaxUserPassword;
  console.log("req body : ", req.body); // 리퀘스트 바디 허용 코드 추가
  console.log(userId, userPassword);

  res.json(userId + "분의 로그인 성공입니다."); // 서버 프론트 통신 ajax 완성
});

app.post("/signup", function (req, res) {
  console.log(req.body);
  var userName = req.body.userName;
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var userAccessToken = req.body.userAccessToken;
  var userRefreshToken = req.body.userRefreshToken;
  var userSeqNo = req.body.userSeqNo;

  var sql =
    "INSERT INTO `user` (`name`, `email`, `password`, `accesstoken`, `refreshtoken`, `userseqno`) VALUES (?, ?, ?, ?, ?, ?)";
  connection.query(sql, [userName, userEmail, userPassword, userAccessToken, userRefreshToken, userSeqNo,], function (error, results, fields) {
      if (error) throw error;
      else {
        console.log("sql :", this.sql);
        res.json(1);
      }
    }
  );
});

app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});
