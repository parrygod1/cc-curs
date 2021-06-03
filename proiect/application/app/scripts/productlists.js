const listsContainer = document.querySelector('#lists-container');
const singleListContainer = document.querySelector('#list-products-container');

(async () => {
  if (!listsContainer && !singleListContainer) return;

  let isFirebaseAppDefined = false;
  var appinitcheck = setInterval(async () => {
    if (!isFirebaseAppDefined) {
      if (firebase.app()) {
        isFirebaseAppDefined = true;
        firebase.auth().onAuthStateChanged(async user => {
          if (user) {
            if (listsContainer) {
              var lists = await getLists(
                firebase.auth().currentUser.uid,
                await firebase.auth().currentUser.getIdToken(true)
              );
              console.log(await lists)
              createListCollection(lists);
            } else {
              showListProducts();
            }
          } else {
            if (singleListContainer) {
              showListProducts();
            } else {
              let host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
              window.location.replace(host);
            }
          }
        });
      }
    } else { clearInterval(appinitcheck); }
  }, 100);
})();

var listPageProductList = {};

const createListCollection = function (data) {
  if (!listsContainer) return;
  for (let id in data) {
    const listEntry = document
      .getElementById('list-template')
      .cloneNode(true);
    listEntry.classList.remove('list-template-hidden');
    listsContainer.appendChild(listEntry);
    listEntry.firstElementChild.innerHTML = data[id]['ListName'] + `  (${data[id]['ProductIds'].length} items)`;
    listEntry.firstElementChild.href = `/list/${id}`;
  }
}

const showListProducts = async function () {
  if (window.location.pathname.includes('/list')) {
    const listid = window.location.pathname.replace('/list/', '');
    let uid = firebase.auth().currentUser ? firebase.auth().currentUser.uid : 'none';
    const list = await getSingleList(
      uid,
      listid
    );
    console.log(await list);
    if (!('message' in list)) {
      if (Object.keys(list['products']).length > 0) {
        listPageProductList = list['products'];
        document.querySelector('#list-name').innerText = list['name'];
        createProductsRows(singleListContainer, list['products'], false);
        addShareButton();
        addDirectionsButton();
      }
    } else {
      alert(list['message']);
      let host = `${window.location.protocol}//${window.location.hostname}:${window.location.port}`;
      window.location.replace(host);
    }
  }
}

const addShareButton = async function () {
  if (window.location.pathname.includes('/list') && firebase.auth().currentUser) {
    title = document.getElementById('title-container');
    button = document.createElement('button');
    button.innerText = 'Share';
    button.setAttribute("class", "waves-effect waves-light btn");
    button.setAttribute("style", "margin-left: 20px; margin-top: 20px");
    button.setAttribute("onclick", "shareButtonClick()");
    title.append(button);
  }
}

const addDirectionsButton = async function () {
  if (window.location.pathname.includes('/list') && firebase.auth().currentUser) {
    title = document.getElementById('title-container');
    button = document.createElement('button');
    button.innerText = 'Get Directions';
    button.setAttribute("class", "waves-effect waves-light btn");
    button.setAttribute("style", "margin-left: 20px; margin-top: 20px");
    button.setAttribute("onclick", "directionsButtonClick()");
    title.append(button);
  }
}

async function shareButtonClick() {
  const isPremium = await checkPremium(firebase.auth().currentUser.uid);
  if (isPremium['PremiumStatus'] == '1') {
    navigator.clipboard.writeText(window.location.href);
    M.toast({
      html: `Copied link to clipboard!`,
    });
  }
  else {
    alert('You need premium to share lists with other users!');
    window.location.replace(window.location.protocol + '//' + window.location.host + '/buypremium');
  }
}

async function directionsButtonClick() {
  const isPremium = await checkPremium(firebase.auth().currentUser.uid);
  if (isPremium['PremiumStatus'] == '1') {
    if (Object.keys(listPageProductList).length > 0) {
      let stores = [];
      for(let i in listPageProductList){
        if (!stores.includes(listPageProductList[i]['Stores'])){
          stores.push(listPageProductList[i]['Stores']);
        }
      }
      if(stores.length > 0){
        storeList = stores;
        getMapsIframe();
      }
    }
  }
  else {
    alert('You need premium to get maps directions!');
    window.location.replace(window.location.protocol + '//' + window.location.host + '/buypremium');
  }
}