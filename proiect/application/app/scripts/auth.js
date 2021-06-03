// listen for auth status changes
var config = {
  apiKey:
  authDomain: 
  databaseURL: 
  projectId: 
};
firebase.initializeApp(config);

const auth = firebase.auth();
//const db = firebase.database();


function toggleLoginElements(loggedin){
  for(const element of document.getElementsByClassName('logged-out')){
    element.style.display = (loggedin ? 'none' : 'block');
  };
  for(const element of document.getElementsByClassName('logged-in')){
    element.style.display = (loggedin ? 'block' : 'none');
  };
}

auth.onAuthStateChanged(user => {
  //let display = document.getElementById('username-display');
  if (user) {
    console.log('user logged in: ', user);
    toggleLoginElements(true);
    //display.innerText = 'Logged in as: ' + (user.displayName || user.email);
  } else {
    console.log('user logged out');
    toggleLoginElements(false);
    //display.innerText = '';
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
    if(auth.currentUser){
      addUser(auth.currentUser.uid);
    }
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
