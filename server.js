const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const { v4: uuidv4 } = require('uuid');
const admin = require('firebase-admin');

const app = express();
const port = process.env.PORT || 3000;

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-adminsdk.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
});

const db = admin.firestore(); // Initialize Firestore

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'public/assets')));

app.use(session({
    secret: uuidv4(),
    resave: false,
    saveUninitialized: true
}));

// Pass the Firestore instance to the router
app.use((req, res, next) => {
    req.db = db;
    next();
});

const router = require('./router');
app.use('/route', router);

app.get('/', (req, res) => {
    res.render('base', { title: "Login System" });
});

app.listen(port, () => {
    console.log(`Listening to the server on http://localhost:${port}`);
});
