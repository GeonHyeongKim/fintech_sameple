const express = require("express");
const app = express();
const request = require("request");  // 모듈 import, request 가져오기
const jwt = require("jsonwebtoken");
const auth = require("./lib/auth"); // DB 연동

var mysql = require("mysql");

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "1183",
  database: "fintech",
});

connection.connect();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs"); // ejs 사용 코드 추가
app.use(express.json()); // // 리퀘스트 바디 허용 코드 추가
app.use(express.urlencoded({ extended: false })); // data를 받아 올수 있도록 허용

app.use(express.static(__dirname + "/public")); // public이라는 folder를 외부에 공개 하겠다

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.get("/login", function (req, res) { // 오픈 뱅킹 API 로그인
  res.render("login");
});

app.get("/authTest", auth, function (req, res) {
  console.log(req.decoded);
  res.json("환영합니다 우리 고객님");
});

app.get("/main", function (req, res) {
  res.render("main");
});

app.get("/balance", function (req, res) {
  res.render("balance");
});

app.get("/transactionList", function (req, res) {
  res.render("transactionList");
});

app.get("/qrcode", function (req, res) {
  res.render("qrcode");
});

app.get("/qrreader", function (req, res) {
  res.render("qrreader");
});

app.get("/authResult", function (req, res) { // 인증 결과
  var authCode = req.query.code;
  console.log("인증코드 : ", authCode); // 인증코드 보여주기

  var option = { // object이기 때문에 중괄호!
    method: "POST",
    url: "https://testapi.openbanking.or.kr/oauth/2.0/token",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
    form: {
      code: authCode,
      client_id: "md8ZEKlZ3OVjN5A8kEtXUBPahUHWU8cOL4oCe0Z2",
      client_secret: "5pRQ2f3n62RtI1TNj4x195tX4OpSiXhDzWv5Z3FV",
      redirect_uri: "http://localhost:3000/authResult",
      grant_type: "authorization_code",
      //#자기 키로 시크릿 변경
    },
  };

  request(option, function (error, response, body) {
    var accessRequestResult = JSON.parse(body); // 데이터
    console.log(accessRequestResult);
    res.render("resultChild", { data: accessRequestResult });
  });
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
  connection.query(
    sql,
    [
      userName,
      userEmail,
      userPassword,
      userAccessToken,
      userRefreshToken,
      userSeqNo,
    ],
    function (error, results, fields) {
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

app.post("/list", auth, function (req, res) {
  var userId = req.decoded.userId;
  var sql = "SELECT * FROM user WHERE id = ?";
  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/user/me",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          user_seq_no: results[0].userseqno,
          //#자기 키로 시크릿 변경
        },
      };
      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});

app.post("/balance", auth, function (req, res) {
  var userId = req.decoded.userId;
  var fin_use_num = req.body.fin_use_num;
  var sql = "SELECT * FROM user WHERE id = ?";
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991641630U" + countnum; //이용기과번호 본인것 입력

  console.log("유저 아이디, 핀테크 번호: ", userId, fin_use_num)
  console.log("transId: ", transId);

  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/balance/fin_num?",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          bank_tran_id: transId,
          fintech_use_num: fin_use_num,
          tran_dtime: "20200714142907",
        },
      };

      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});

app.post("/transactionList", auth, function (req, res) {
  var userId = req.decoded.userId;
  var fin_use_num = req.body.fin_use_num;
  console.log("유저 아이디, 핀테크번호 : ", userId, fin_use_num);

  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991641630U" + countnum; //이용기과번호 본인것 입력
  var sql = "SELECT * FROM user WHERE id = ?";

  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      console.log(("list 에서 조회한 개인 값 :", results));
      var option = {
        method: "GET",
        url: "https://testapi.openbanking.or.kr/v2.0/account/transaction_list/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        qs: {
          bank_tran_id: transId,
          fintech_use_num: fin_use_num,
          inquiry_type: "A",
          inquiry_base: "D",
          from_date: "20190101",
          to_date: "20190101",
          sort_order: "D",
          tran_dtime: "20200714142907",
        },
      };
      request(option, function (error, response, body) {
        var listResult = JSON.parse(body);
        console.log(listResult);
        res.json(listResult);
      });
    }
  });
});

app.post("/withdraw", auth, function (req, res) {
  // 출금이체 request 요청 코드 작성
  var userId = req.decoded.userId;
  var fin_use_num = req.body.fin_use_num;
  var amount = req.body.amount;
  var to_fin_use_num = req.body.to_fin_use_num;
  console.log("받아온 데이터", userId, fin_use_num, amount, to_fin_use_num);

  var sql = "SELECT * FROM user WHERE id = ?";
  var countnum = Math.floor(Math.random() * 1000000000) + 1;
  var transId = "T991641630U" + countnum; //이용기과번호 본인것 입력
  console.log("유저 아이디, 핀테크 번호: ", userId, fin_use_num)
  console.log("transId: ", transId);

  connection.query(sql, [userId], function (err, results) {
    if (err) {
      console.error(err);
      throw err;
    } else {
      var option = {
        method: "POST",
        url: "https://testapi.openbanking.or.kr/v2.0/transfer/withdraw/fin_num",
        headers: {
          Authorization: "Bearer " + results[0].accesstoken,
          "Content-Type": "application/json",
        },
        //form 형태는 form / 쿼리스트링 형태는 qs / json 형태는 json ***
        json: {
          bank_tran_id: transId,
          cntr_account_type: "N",
          cntr_account_num: "1675750816",
          dps_print_content: "쇼핑몰환불",
          fintech_use_num: fin_use_num,
          wd_print_content: "오픈뱅킹출금",
          tran_amt: amount,
          tran_dtime: "20200720114100",
          req_client_name: "홍길동",
          req_client_num: "HONGGILDONG1234",
          transfer_purpose: "ST",
          req_client_fintech_use_num: "199159919057870971744807",
          recv_client_name: "홍길동",
          recv_client_bank_code: "097",
          recv_client_account_num: "1675750816",
        },
      };

      request(option, function (error, response, body) {
        console.log(body);
        res.json(body);
      });
    }
  });
})

app.listen(3000, function () {
  console.log("Example app listening at http://localhost:3000");
});

  // let today = new Date();
  // let year = today.getFullYear();
  // let month = ("0" + (today.getMonth() + 1)).slice(-2) // 0 ~ 11
  // let day = ("0" + today.getDate()).slice(-2);
  // let hours = ("00" + today.getHours()).slice(-2) // 시
  // let minutes = ("00" + today.getMinutes()).slice(-2);  // 분
  // let seconds = ("00" + today.getSeconds()).slice(-2);  // 초
  // let tranDime = "" + year + month + day + hours + minutes + seconds;