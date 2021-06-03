// setup materialize components
//https://github.com/iamshaunjp/firebase-auth/tree/lesson-8
document.addEventListener('DOMContentLoaded', function () {
  let modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  let items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);
});
const searchInput = document.getElementById('search-products');

let tempList = [];
let storeList = [];
let productList = [];

function hideCurrentList() {
  document.getElementById('current-products-list').style.display = 'none';
  document.getElementById('all-products-list').style.minWidth = '';
  document.getElementById('current-products-list').style.minWidth = '';
}

function showCurrentList() {
  document.getElementById('current-products-list').style.display = 'block';
  document.getElementById('all-products-list').style.minWidth = '900px';
  document.getElementById('current-products-list').style.minWidth = '600px';
}

function updateProductIdList(id) {
  if (tempList.includes(id)) {
    let index = tempList.indexOf(id);
    tempList.splice(index, 1);
    document
      .querySelector('#current-products-list [product-id="' + id + '"]')
      .remove();
    document.querySelector(
      '[product-id="' + id + '"] .all-products-list__card__action-button i'
    ).innerText = 'add';
    if (tempList.length == 0) {
      hideCurrentList();
    }
    M.toast({
      html: `Product "${productList[id]['Name']}" removed from products list!`,
    });
  } else {
    tempList.push(id);

    showCurrentList();
    let element = document.querySelector('[product-id="' + id + '"]');
    const newElement = element.cloneNode(true);
    const actionButton = newElement.querySelector(
      '.all-products-list__card__action-button'
    );
    actionButton.querySelector('i').innerText = 'clear';
    element.querySelector(
      '.all-products-list__card__action-button i'
    ).innerText = 'clear';
    newElement.querySelector('.card').classList.add('horizontal');
    document.getElementById('current-products-list').append(newElement);
    actionButton.addEventListener('click', () => updateList(id));

    M.toast({
      html: `Product "${productList[id]['Name']}" added to products list!`,
    });
  }
}

function updateStoreList() {
  storeList = [];
  if (tempList.length > 0) {
    for (let i in tempList) {
      if (!storeList.includes(productList[tempList[i]]['Stores'])) {
        storeList.push(productList[tempList[i]]['Stores']);
      }
    }
  }
}

function updateList(id) {
  updateProductIdList(id);
  updateStoreList();
  /*console.log('update');
  console.log(productList);
  console.log(tempList);
  console.log(storeList);*/
  localStorage.setItem('current-products-list', JSON.stringify(tempList));
}

async function listAllProducts() {
  //search input
  console.log(searchInput.value);
  productList = await getAllProducts(searchInput.value);
  let container = document.getElementById('all-products-list');
  createProductsRows(container, productList);
  // update from localStrage
  let savedTempList = JSON.parse(localStorage.getItem('current-products-list'));
  if (savedTempList) {
    for (let product of savedTempList) {
      updateList(product);
    }
  }
}

async function saveList() {
  if (auth.currentUser) {
    let name = document.getElementById('list-name').value;
    insertList(auth.currentUser.uid, tempList, name);
  } else {
    alert('You need to be logged in to save a list!');
  }
}

async function getMapsIframe() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((pos) => {
      getDirections(
        `${pos.coords.latitude}, ${pos.coords.longitude}`,
        storeList
      ).then((iframe) => {
        console.log(iframe);
        let element = document.getElementById('iframe-container');
        element.innerHTML = iframe;
        setIframeStyle();
        element.scrollIntoView({ behavior: 'smooth' });
      });
    });
  } else {
    console.log('Geolocation is not supported by this browser.');
  }
}

async function getDirectionsClick() {
  if (firebase.auth().currentUser) {
    const isPremium = await checkPremium(firebase.auth().currentUser.uid);
    if (isPremium['PremiumStatus'] == '1') {
      getMapsIframe();
    } else {
      alert('You need premium to get maps directions!');
      window.location.replace(
        window.location.protocol + '//' + window.location.host + '/buypremium'
      );
    }
  } else {
    alert('You need to be logged in to find directions!');

  }
}

function setIframeStyle() {
  let iframe = document.getElementsByTagName('iframe')[0];
  iframe.setAttribute('width', window.screen.availWidth - 30);
  iframe.setAttribute('height', window.screen.availHeight - 120);
  iframe.setAttribute('style', 'border: 3px; border-style: groove');
}

if (window.location.pathname == '/') {
  listAllProducts();
  searchInput.addEventListener(
    'input',
    _.debounce(() => {
      listAllProducts();
    }, 300)
  );
}
