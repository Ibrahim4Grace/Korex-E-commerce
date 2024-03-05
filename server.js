if (process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
  }
  
  const mongoose = require('mongoose');
  const express = require('express');
  const flash = require('connect-flash');
  const passport = require('passport');
  const session = require('express-session');
  const helmet = require("helmet")
//   const methodOverride = require('method-override');
  const connectToMongoDB = require('./database/conn');
  const cors = require('cors');
  const MongoDBStore = require('connect-mongodb-session')(session);
  const cookieParser = require('cookie-parser'); //for our jwt storage
  const morgan = require('morgan');
//   const Chat = require('./models/chat');
  const bodyParser = require('body-parser');
  const nodemon = require('nodemon');
  const http = require('http');
  const socketIO = require('socket.io');
//   const wrap = middleware => (socket, next) => middleware(socket.request, {}, next);
//   const chatIoSetup = require("./sockets/socket");
//   const notificationIoSetup = require("./sockets/notification");
// const cron = require('node-cron');
// const cleanupInactiveUsers = require('./utils/cleanupInactiveUsers');

  const ejs = require('ejs');
  const app = express();
  const server = http.createServer(app);
  
  // Set no-cache headers middleware
  app.use((req, res, next) => {
    res.header('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.header('Pragma', 'no-cache');
    next();
  });
  

  
  const trustedOrigins = [process.env.BASE_URL];
  app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? trustedOrigins : '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  }));
  
  
  // Connect to MongoDB using this method because it returns a promise
  connectToMongoDB()
    .then(() => {
      const port = process.env.PORT;
      // app.listen
      // server.listen allow socket to work .
      server.listen(port, () => {
        console.log(`Server started on port ${port}`);
      });
    })
    .catch((err) => {
      console.error('Unable to start the server:', err.message);
  });
    
  const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
  });
  
  
  //Catch errors
  store.on('error', function(error) {
    console.error(error);
  });
  
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 1000 * 60 * 60, // Set maxAge to 1 hour
    },
  }));
  
  
  
  // TO CALL OUR EJS
  app.set(`view engine`, `ejs`);
  
  //TO BE ABLE TO ACCESS OUR STATIC FILES -- IMG, CSS, VIDEOS
  app.use(express.static(__dirname + "/public/"));
  app.use(express.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  // app.use(express());
  app.use(cookieParser());
  
  
       //creating global variable for color changing
  app.use(flash())
  app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
  });
  
  
  //Passport Middleware
  app.use(passport.initialize());
  app.use(passport.session());
//   app.use(methodOverride('_method'));
  app.use(morgan('tiny'));
  app.disable('x-powered-by'); //less hacker know about our stack

  app.use(helmet({
    contentSecurityPolicy: false, // Disable default CSP middleware to provide custom directives
  }));
  
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow resources to be loaded from the same origin
      scriptSrc: ["'self'", "https://code.jquery.com", "https://stackpath.bootstrapcdn.com"],
      styleSrc: ["'self'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com", "'unsafe-inline'"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:"],
      objectSrc: ["'none'"],
      manifestSrc: ["'self'"],
      frameSrc: ["'self'"],
      connectSrc: ["'self'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      mediaSrc: ["'self'"],
    },
  }));
  

  
//   const chatIo = chatIoSetup(server, app, wrap, Chat);
//   const notificationIo = notificationIoSetup(io);
  
  
  //IMPORT THE ROUTE FILES
  app.use('/', require('./route/landingPageRoute'));
  app.use('/user', require('./route/authRoute'));
  app.use('/', require('./route/authRoute'));//declared endpoint
  app.use('/user', require('./route/userRoute'));
  //app.use('/', require('./route/userRoute')); //declared endpoint
//   app.use('/users', require('./route/userRoute'));
//   app.use('/', require('./route/userRoute'));//declared endpoint
//   app.use('/admin', require('./route/adminRoute'));
//   app.use('/', require('./route/adminRoute'));//declared endpoint
  
  