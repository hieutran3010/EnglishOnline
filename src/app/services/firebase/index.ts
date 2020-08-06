import * as firebase from 'firebase/app';

const initializeFirebase = () => {
  const config = require('./config.json');
  // Initialize Firebase
  firebase.initializeApp(config);
};

export { initializeFirebase };
