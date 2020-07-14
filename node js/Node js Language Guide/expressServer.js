const express = require("express");
const app = express();

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

// 비동기 통신 - 서버 프론트 통신 ajax
// 로그인 정보 전달 ajax 코드 및 라우터 완성
app.post("/getLoginData", function (req, res) {
  var userId = req.body.ajaxUserId;
  var userPassword = req.body.ajaxUserPassword;
  console.log("req body : ", req.body); // 리퀘스트 바디 허용 코드 추가
  console.log(userId, userPassword);

  res.json(userId + "분의 로그인 성공입니다."); // 서버 프론트 통신 ajax 완성
});

app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});
