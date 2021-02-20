window.onload = function () {
    var requestURI = '/api/pricecheck/';
    var button = document.getElementById("submit_button");
    var address = document.getElementById("btc_address");
    var btc_balance = document.getElementById("btc_balance_val");
    var usd_balance = document.getElementById("usd_balance_val");
    var price_total = document.getElementById("price_total_val");
    var resultContainer = document.getElementById("content");
    var itemCount = 0;

    var ajax = null;

    button.addEventListener("click", function () {
        searchForData();
    });

    function searchForData() {
        if (ajax && typeof ajax.abort === 'function') {
            ajax.abort(); // abort previous requests
        }

        clearResult();

        ajax = new XMLHttpRequest(); //php response will be in this variable
        ajax.onreadystatechange = function () {
            if (ajax.readyState === 4 && ajax.status === 200) {
                //console.log(ajax.responseText);
                var json = ajax.responseText.replaceAll("\'", "\"");
                //console.log(json);
                json = JSON.parse(json);
                
                if (json === false) {
                    console.log('failed to get response');
                } else {
                    //itemCount = json['item_list'].length;
                    showItems(json);
                }
            }
        }
        ajax.open('GET', requestURI + address.value, true);
        ajax.send();
    }

    function showItems(itemJSONobj) {
        btc_balance.innerText = "BTC balance: " + itemJSONobj['btc_balance'];
        usd_balance.innerText = "USD value: " + itemJSONobj['usd_balance'];
        price_total.innerText = "Total cost: " + itemJSONobj['price_total'];

        createItemElements(itemJSONobj['item_list']);
    }

    function createItemElements(itemList) {
        i = 0;
        for (const item in itemList) {
            let link = document.createElement("a");
            link.href = itemList[item]['link'];
            link.innerText = item;

            resultContainer.appendChild(link);

            let price = document.createElement("p");
            price.innerText = "Price: " + itemList[item]['price'];

            resultContainer.appendChild(price);

            i++;
        }
    }

    function clearResult() {
        resultContainer.innerHTML = "";
        page = 1;
    }
};