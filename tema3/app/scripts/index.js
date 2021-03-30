// setup materialize components
//https://github.com/iamshaunjp/firebase-auth/tree/lesson-8
document.addEventListener('DOMContentLoaded', function() {

  var modals = document.querySelectorAll('.modal');
  M.Modal.init(modals);

  var items = document.querySelectorAll('.collapsible');
  M.Collapsible.init(items);

});

var tempList = [];
var storeList = [];
var productList = [];

function updateList(id){
  if (tempList.includes(id)){
    let index = tempList.indexOf(id);
    tempList.splice(index, 1);
  }
  else{
    tempList.push(id);
  }
  if(!storeList.includes(productList[id]['Stores'])){
    storeList.push(productList[id]['Stores']);
  }

  console.log(productList);
  console.log(tempList);
  console.log(storeList);
}


async function listAllProducts(){
  getAllProducts().then(data => {  
    console.log(data);  
    let container = document.getElementById('all-products-list');
    let html = '<li class="collection-header"><h5>Products</h5></li>';

    for(id in data){
      html += `<li product-id = ${id} class = "collection-item">
        <img src = "https://storage.googleapis.com/buuucket0/${data[id]['ImageLink']}" width="100" height="100"</img> 
        Name: ${data[id]['Name']}, Price: ${data[id]['Price']}, Stores: ${data[id]['Stores']}
        <label>
          <input type="checkbox" onclick = "updateList('${id}')"/> 
          <span></span>
        </label>
      </li>`; //horrible but it works for now   
    }
    productList = data;
    container.innerHTML = html;
  });
}

async function getMapsIframe(){
  if (auth.currentUser){
    insertList(auth.currentUser.uid, tempList);
  }

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      getDirections(`${pos.coords.latitude}, ${pos.coords.longitude}`, storeList).then(iframe =>{
        console.log(iframe);
        document.getElementById('iframe-container').innerHTML = iframe;
      });
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

listAllProducts();
