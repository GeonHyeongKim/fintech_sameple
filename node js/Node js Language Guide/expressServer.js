const express = require("express");
const app = express();
const request = require("request"); // 모듈 import, request 가져오기
const jwt = require('jsonwebtoken');
const auth = require('./lib/auth');

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

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/authTest", auth, function (req, res) {
  res.json("환영합니다. 우리 고객님")
});

app.get("/main", function (req, res) {
  res.render("main");
});

// app.get("/list", auth, function (req, res) {
//   res.json("사용자 정보 조회")
// });

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

app.post("/login", function (req, res) {
  console.log("사용자 입력정보 :", req.body);
  var userEmail = req.body.userEmail;
  var userPassword = req.body.userPassword;
  var sql = "SELECT * FROM user WHERE email = ?";
  connection.query(sql, [userEmail], function (error, results, fields) {
    if (error) throw error;
    else {
      if (results.length == 0) {
        res.json("등록되지 않은 아이디 입니다.");
      } else {
        var dbPassword = results[0].password;
        if (userPassword == dbPassword) {
          res.json("로그인 성공");
          var tokenKey = "fintech";
          jwt.sign(
            {
              userId: results[0].id,
              userEmail: results[0].email,
            },
            tokenKey,
            {
              expiresIn: "10d",
              issuer: "fintech.admin",
              subject: "user.login.info",
            },
            function (err, token) {
              console.log("로그인 성공", token);
              res.json(token);
            }
          );
        } else {
          res.json("비밀번호가 다릅니다!");
        }
      }
    }
  });
});

app.post('/list', function (req, res) {
  var option = { // object이기 때문에 중괄호!
    method: "Get",
    url: "https://testapi.openbanking.or.kr/v2.0/user/me",
    headers: {
      Authorization: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiIxMTAwNzYwNTU5Iiwic2NvcGUiOlsiaW5xdWlyeSIsImxvZ2luIiwidHJhbnNmZXIiXSwiaXNzIjoiaHR0cHM6Ly93d3cub3BlbmJhbmtpbmcub3Iua3IiLCJleHAiOjE2MDI0ODA1NDgsImp0aSI6IjA0Yzc5M2JlLTk4Y2UtNDE2OS04M2Y1LTA1M2Q2ZTJmNDA5OCJ9.Lt_WG-QFvSaHKpuydI2ByESjijIuhFEC2ACuD7ew8gg",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
    },

    //form 형태는 form / 리쿼스트링 형태는 qs / json 형태는 json ***
    qs: {
      user_seq_no: "1100760559",
      //#자기 키로 시크릿 변경
    },
  };

  request(option, function (erorr, response, body) {
    var listResult = JSON.parse(body);
    console.log(listResult);
    res.json(listResult);
  });
});

app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});
