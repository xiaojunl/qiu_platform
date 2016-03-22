'use strict';

var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser')
var swaggerize = require('swaggerize-express');
var path = require('path');
var qs = require('qs');
var passport = require('passport');
var qiniu = require('qiniu');
var auth = require('./lib/auth');
var config = require('./config/config.json');
var multipart = require('./lib/multipart');
var redisSession = require('./lib/redis-session');
var mongoose = require('mongoose');
var autoIncrement = require('mongoose-auto-increment');
var confPay = require('./lib/config-pay');
var redisQi = require('./lib/redis-qi');

var app = express();
var isProduction = 'production' == app.get('env');

app.use(express.static(`/srv/sources${isProduction ? '/release' : ''}`));
app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.raw({type: 'application/xml'}));
app.use(bodyParser.raw({type: 'text/xml'}));
app.use(multipart(config.multipart));
app.use(redisSession(config.session, 'production' == app.get('env') || 'prelease' == app.get('env')));

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => { // '/api/docs/swagger.json',
    res.header('Access-Control-Allow-Origin', req.header('origin'));
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Credentials', "true");
    res.header('Access-Control-Max-Age', "3600");
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, *');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

app.use('/api/*', auth.isAuthenticated());

// alipay post text/html.
app.use('/api/notify/alipay', (req, res, next)=> {
    req.body = req.body || {};
    if ('POST' != req.method) return next();
    var contenttype = req.headers['content-type'];
    if (!/application\/x-www-form-urlencoded/.test(contenttype)) return next();
    req._body = true;
    var buf = '';
    req.setEncoding('utf8');
    req.on('data', function (chunk) {
        buf += chunk
    });
    req.on('end', function () {
        req.body = qs.parse(buf);
        next();
    });
});

app.get('/api', (req, res)=> res.sendStatus(200));

app.get('/weixin', (req, res) => res.redirect('index.html'));

app.get('/wechat', (req, res) => res.redirect('index.html'));

app.get('/t/wechat', (req, res) => res.redirect('index.html'));

app.get('/admin', (req, res) => res.redirect('index.html'));

app.get('/', (req, res) => res.redirect('index.html'));

app.get('/api/docs', (req, res)=> {
    if (isProduction) {
        res.sendStatus(404);
    } else {
        res.redirect('index.html');
    }
});

mongoose.connect(`mongodb://localhost/${isProduction ? 'qqi_db' : 'qi_db'}`);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => console.log('db connection open'));

autoIncrement.initialize(db);

passport.use(auth.localStrategy()); //Tell passport to use our newly created local strategy for authentication
passport.serializeUser((user, done) => {
    console.log(`serializeUser:${user._id}`);
    done(null, user._id);
});
passport.deserializeUser((id, done) => {
    console.log(`deserializeUser:${id}`);
    const User = require('./models/userModel');
    User.getLoginUser(id, (err, user) => done(err, user));
});

app.use(swaggerize({
    api: path.resolve('./config/swagger.json'),
    docspath: '/docs/swagger.json',
    handlers: path.resolve('./handlers')
}));

var server = http.createServer(app);

server.listen(isProduction ? 80 : 8000, ()=> {
        app.swagger.api.host = `${server.address().address}:${server.address().port}`;
        qiniu.conf.ACCESS_KEY = config.qiniu.accessKey;
        qiniu.conf.SECRET_KEY = config.qiniu.secretKey;
        config.isProduction = isProduction;

        redisQi.config('production' == app.get('env') || 'prelease' == app.get('env'));

        confPay.init();

        let m = require('moment');
        console.log(`listening:${server.address().port},starting now! at time:${m().format('YYYY-MM-DD HH:mm:ss')}`);
    }
);