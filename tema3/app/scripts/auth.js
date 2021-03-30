// listen for auth status changes
var config = {
  apiKey: "AIzaSyBrXzUGMbFTOExsHW2c3j2yAHojkx84cwY",
  authDomain: "disco-dispatch-307814.firebaseapp.com",
  databaseURL: "https://disco-dispatch-307814-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "disco-dispatch-307814"
};
firebase.initializeApp(config);

const auth = firebase.auth();
//const db = firebase.database();


auth.onAuthStateChanged(user => {
  let display = document.getElementById('username-display');
  if (user) {
    console.log('user logged in: ', user);
    display.innerText = 'Logged in as: ' + (user.displayName || user.email);
  } else {
    console.log('user logged out');
    display.innerText = '';
  }
})

// signup
const signupForm = document.querySelector('#signup-form');
signupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = signupForm['signup-email'].value;
  const password = signupForm['signup-password'].value;

  // sign up the user
  auth.createUserWithEmailAndPassword(email, password).then(cred => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-signup');
    M.Modal.getInstance(modal).close();
    signupForm.reset();
  });
});

// logout
const logout = document.querySelector('#logout');
logout.addEventListener('click', (e) => {
  e.preventDefault();
  auth.signOut();
});

// login
const loginForm = document.querySelector('#login-form');
loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // get user info
  const email = loginForm['login-email'].value;
  const password = loginForm['login-password'].value;

  // log the user in
  auth.signInWithEmailAndPassword(email, password).then((cred) => {
    // close the signup modal & reset form
    const modal = document.querySelector('#modal-login');
    M.Modal.getInstance(modal).close();
    loginForm.reset();
  });

});