const setBtnIcon = (el, addedTofav) =>
  !addedTofav
    ? (el.innerHTML = 'favorite_border')
    : (el.innerHTML = 'favorite');

(async () => {
  const productInfoContainer = document.querySelector('.product-info');
  if (!productInfoContainer) return;
  var elems = document.querySelectorAll('.materialboxed');
  M.Materialbox.init(elems);
  // get productInfo from api...
  let id = getProductIdFromURL();
  let productInfo = await getSingleProduct(id);
  productInfo = productInfo[0];
  /*const productInfo = {
    Description: 'aaa',
    Price: 6,
    Name: 'Avocado',
    ImageLink:
      '144319732ed8794c1aa2bc95d260063084433b284f415e52a513b475a2798831',
    Stores: 'kaufland',
  };*/
  const productImage = productInfoContainer.querySelector('.product-image');
  const productTitle = productInfoContainer.querySelector('.product-title');
  const productPrice = productInfoContainer.querySelector('.product-price');
  const productDescription = productInfoContainer.querySelector(
    '.product-description'
  );
  const productStore = productInfoContainer.querySelector('.product-store');
  const productFavButton = productInfoContainer.querySelector(
    '.product-favorites-button'
  );

  firebase.auth().onAuthStateChanged(async (user) => {
    const favBtnIcon = productFavButton.querySelector('i');
    if (user) {
      favourites = await getFavorites(
        firebase.auth().currentUser.uid,
        await firebase.auth().currentUser.getIdToken(true)
      );
      productFavButton.style.opacity = '1';

      let addedTofav = !!favourites[id];

      setBtnIcon(favBtnIcon, addedTofav);
      productFavButton.addEventListener('click', () => {
        addedTofav = !addedTofav;
        if (addedTofav) {
          M.toast({
            html: `Product "${productInfo['Name']}" added to favorites!`,
          });
        } else {
          M.toast({
            html: `Product "${productInfo['Name']}" removed from favorites!`,
          });
        }
        setBtnIcon(favBtnIcon, addedTofav);
      });
    } else {
      productFavButton.style.opacity = '0';
    }
    console.log(user);
  });

  // set
  productImage.setAttribute(
    'src',
    `https://storage.googleapis.com/buuucket0/${productInfo['ImageLink']}`
  );
  productTitle.innerHTML = productInfo['Name'];
  productStore.innerHTML = `STORE: <strong>${productInfo[
    'Stores'
  ].toUpperCase()}</strong>`;
  productPrice.innerHTML = productInfo['Price'] + ' LEI';
  productDescription.innerHTML = productInfo['Description'];
})();
