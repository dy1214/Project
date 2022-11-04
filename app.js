const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const dotenv = require("dotenv");
const flash = require("connect-flash");
const User = require("./models/User");
const Party = require("./models/Party");
const Payment = require("./models/Payment");

const port = process.env.PORT || 3300;
dotenv.config();
const userRoutes = require("./routes/users");
const partyRoutes = require("./routes/parties");
const app = express();


app.set("view engine", "ejs");
//app.engine("html", require("ejs").renderFile);


/* 미들웨어 */
// connect-flash는 쿠키파서와 세션을 내부적으로 사용
app.use(cookieParser(process.env.SECRET)) // .env 비밀키 생성
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false
})
);
app.use(flash());


/* Passport 설정 */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/* 미들웨어 */
// body parser를 위한 express의 json, unrlencoded를 장착
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public")); // 정적 파일들을 서비스할 폴더를 public/으로 지정


/* MongoDB 연결 */
// 호스트: 127.0.0.1 포트: 27017 데이터베이스 이름: project
mongoose
    .connect("mongodb://127.0.0.1:27017/project_1")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
    });
    


/* Template 파일에 변수 전송 */
// user와 authentication, flash와 관련한 변수 전송
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.login = req.isAuthenticated();
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});


/* Routers 라우터 */
app.use("/", userRoutes); // 라우터 장착
app.use("/", partyRoutes); // 라우터 장착


const server = app.listen(port, () => { // 서버와 연결
    console.log("App is running on port " + port);
});