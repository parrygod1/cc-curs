(async () => {
  const favouritesContainer = document.querySelector('.favorites-container');
  if (!favouritesContainer) return;

  // get favourites from api...
  // const favourites = await fetch('...')
  
  /* const favourites = {
    "1234567890" : {
      Description: 'aaa',
      Price: 6,
      Name: 'Avocado',
      ImageLink:
        '144319732ed8794c1aa2bc95d260063084433b284f415e52a513b475a2798831',
      Stores: 'kaufland',
    }, ...
  };*/

  let isFirebaseAppDefined = false;
  var appinitcheck = setInterval(async () => {
    if (!isFirebaseAppDefined) {
      if (firebase.app()) {
        isFirebaseAppDefined = true;
        firebase.auth().onAuthStateChanged(async user => {
          if(user){
          var favourites = await getFavorites(
            firebase.auth().currentUser.uid,
            await firebase.auth().currentUser.getIdToken(true)
          );
          console.log(await favourites)
          createProductsRows(favouritesContainer, favourites, false);
          } else {
            let host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
            window.location.replace(host);
          }
        });
      }
    } else { clearInterval(appinitcheck); }
  }, 100);
})(); 


async function clickFavoriteButton(){
  let uid = firebase.auth().currentUser.uid;
  if(uid){
    let token = await firebase.auth().currentUser.getIdToken(true).then(token => {return token;});
    let productid = getProductIdFromURL();
    updateFavorites(uid, token, productid);
  }
}
