// Fetch your Stripe publishable key to initialize Stripe.js
// In practice, you might just hard code the publishable API
// key here.
var config = {
  apiKey: "AIzaSyBeTg7s0FL_8c78xpXRcDyKeMlKYny5F7E",
  authDomain: "disco-dispatch-307814.firebaseapp.com",
  databaseURL: "https://disco-dispatch-307814-default-rtdb.europe-west1.firebasedatabase.app/",
  projectId: "disco-dispatch-307814"
};
firebase.initializeApp(config);

const auth = firebase.auth();

auth.onAuthStateChanged(user => {
  if (user) {
    fetch('/config')
      .then(function (result) {
        return result.json();
      })
      .then(function (json) {
        window.config = json;
        window.stripe = Stripe(config.publicKey);
      });

    // When the form is submitted...
    var submitBtn = document.querySelector('#submit');
    submitBtn.addEventListener('click', function (evt) {
      //var inputEl = document.getElementById('quantity-input');
      //var quantity = parseInt(inputEl.value);

      // Create the checkout session.
      fetch('/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: 1,
          userid: auth.currentUser.uid
        }),
      }).then(function (result) {
        return result.json();
      }).then(function (data) {
        // Redirect to Checkout. with the ID of the
        // CheckoutSession created on the server.
        stripe.redirectToCheckout({
          sessionId: data.sessionId,
        })
          .then(function (result) {
            // If redirection fails, display an error to the customer.
            if (result.error) {
              var displayError = document.getElementById('error-message');
              displayError.textContent = result.error.message;
            }
          });
      });
    });

    /*
    // The max and min number of photos a customer can purchase
    var MIN_PHOTOS = 1;
    var MAX_PHOTOS = 10;

    var quantityInput = document.getElementById('quantity-input');
    quantityInput.addEventListener('change', function (e) {
      // Ensure customers only buy between 1 and 10 photos
      if (quantityInput.value < MIN_PHOTOS) {
        quantityInput.value = MIN_PHOTOS;
      }
      if (quantityInput.value > MAX_PHOTOS) {
        quantityInput.value = MAX_PHOTOS;
      }
    });

    var addBtn = document.getElementById("add");
    var subtractBtn = document.getElementById("subtract");
    var updateQuantity = function (evt) {
      if (evt && evt.type === 'keypress' && evt.keyCode !== 13) {
        return;
      }
      var delta = evt && evt.target.id === 'add' && 1 || -1;

      addBtn.disabled = false;
      subtractBtn.disabled = false;

      // Update number input with new value.
      quantityInput.value = parseInt(quantityInput.value) + delta;

      // Disable the button if the customers hits the max or min
      if (quantityInput.value == MIN_PHOTOS) {
        subtractBtn.disabled = true;
      }
      if (quantityInput.value == MAX_PHOTOS) {
        addBtn.disabled = true;
      }
    };

    addBtn.addEventListener('click', updateQuantity);
    subtractBtn.addEventListener('click', updateQuantity);*/
  }
  else
  {
    let host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
    window.location.replace(host);
  }
});
