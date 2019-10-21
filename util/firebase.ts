import firebase from "firebase";

const firebaseConfig = {
  apiKey: "AIzaSyBZcyk3X6gyaVA8AAUkTgaurr_q4MomLn0",
  authDomain: "rightguy-ac06f.firebaseapp.com",
  databaseURL: "https://rightguy-ac06f.firebaseio.com",
  projectId: "rightguy-ac06f",
  storageBucket: "rightguy-ac06f.appspot.com",
  messagingSenderId: "974273184624",
  appId: "1:974273184624:web:a1630a4f1ad04ff5b8c5b5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

export default firebase
