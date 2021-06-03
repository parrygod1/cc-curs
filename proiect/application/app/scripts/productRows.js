const createProductsRows = (
  container,
  productList,
  displayActionButton = true
) => {
  container.innerHTML = '';
  for (let rowOfKeys of _.chunk(Object.keys(productList), 4)) {
    const rowElement = document.createElement('div');
    rowElement.classList.add('row');
    for (let key of rowOfKeys) {
      const productCard = document
        .getElementById('product-card-item-template')
        .cloneNode(true);
      productCard.classList.remove('all-products-list__template-hidden');
      productCard.setAttribute(`product-id`, key);
      rowElement.appendChild(productCard);
      const cardImage = productCard.querySelector('.card-image img');
      const cardContent = productCard.querySelector(
        '.card-content p.description'
      );
      const cardStore = productCard.querySelector('.card-content p.store');
      const cardLink = productCard.querySelector('.card-content a');
      const cardTitle = productCard.querySelector('.card-title');
      const cardPrice = productCard.querySelector(
        '.all-products-list__card__price'
      );
      const cardActionBtn = productCard.querySelector(
        '.all-products-list__card__action-button'
      );
      cardImage.setAttribute(
        'src',
        `https://storage.googleapis.com/buuucket0/${productList[key]['ImageLink']}`
      );
      cardLink.setAttribute('href', `/product/` + key);
      cardContent.innerHTML = productList[key]['Description'];
      cardTitle.innerHTML = productList[key]['Name'];
      cardStore.innerHTML = productList[key]['Stores'];
      cardPrice.innerHTML = productList[key]['Price'] + ' lei';
      cardActionBtn.addEventListener('click', () => updateList(key));
      if (!displayActionButton) {
        cardActionBtn.remove();
      }
    }
    container.appendChild(rowElement);
  }
};
