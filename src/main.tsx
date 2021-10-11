import { render } from "preact";
import "./index.css";
import App from "./App";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { BrowserRouter as Router } from "react-router-dom";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBPEd0m182UJDZm5Yl0ba5uUgBDzQvTqNg",
  authDomain: "course-reminder.firebaseapp.com",
  projectId: "course-reminder",
  storageBucket: "course-reminder.appspot.com",
  messagingSenderId: "39700599464",
  appId: "1:39700599464:web:d3a7a53e9d584b1d5de89d",
  measurementId: "G-E4YSG1YTBC",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
if (window.location.hostname === "localhost") {
  // connectFirestoreEmulator(getFirestore(app), "localhost", 8080)
  // connectAuthEmulator(getAuth(), "http://localhost:9099")
  // connectFunctionsEmulator(getFunctions(), "localhost", 5001)
}

render(
  <Router>
    <App firebaseApp={app} />
  </Router>,
  document.getElementById("app")!
);
