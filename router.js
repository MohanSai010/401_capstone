const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Render signup page
router.get('/signup', (req, res) => {
    res.render('signup', { title: "Signup System" });
});

// Signup user
router.post('/signup', async (req, res) => {
    const { email, password } = req.body;
    const db = req.db;

    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
        });

        await db.collection('users').doc(userRecord.uid).set({
            email: userRecord.email,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.redirect('/route/login');
    } catch (error) {
        console.error('Error signing up:', error);
        res.status(500).send('Error signing up: ' + error.message);
    }
});

// Render login page
router.get('/login', (req, res) => {
    res.render('base', { title: "Login System" });
});

// Login user
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const db = req.db;

    try {
        const user = await admin.auth().getUserByEmail(email);

        req.session.user = user.email;

        await db.collection('logins').add({
            email: user.email,
            loginTime: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.redirect('/route/dashboard');
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in: ' + error.message);
    }
});

router.get('/dashboard', (req, res) => {
    if (req.session.user) {
        res.render('dashboard', { title: "Dashboard", user: req.session.user });
    } else {
        res.send("Unauthorized User");
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        if (err) {
            console.log(err);
            res.send("Error");
        } else {
            res.render('base', { title: "Login System", logout: "Logout Successfully...!" });
        }
    });
});

module.exports = router;
