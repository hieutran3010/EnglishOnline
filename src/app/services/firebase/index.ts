const firebase = require('firebase');

const initializeFirebase = () => {
  const config = require('./config.json');
  // Initialize Firebase
  firebase.initializeApp(config);
};

export { initializeFirebase };
