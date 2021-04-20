const getDOM = require('./dom');
module.exports.lidl = async () => {
  const document = await getDOM('https://www.lidl.ro/oferte');
  const $productCards = document.querySelectorAll('.product--tile');
  const products = [];
  for (let $productCard of $productCards) {
    const image = $productCard
      .querySelector(`img.lazyload`)
      .getAttribute('src');
    const title = $productCard
      .querySelector('.product__title')
      .textContent.trim();
    const description = $productCard
      .querySelector('.product__desc')
      .textContent.trim();
    const price = parseFloat(
      $productCard
        .querySelector('.pricebox__price')
        .textContent.trim()
        .replace(',', '.')
    );
    products.push({
      title,
      description,
      price,
      image,
    });
  }
  return products;
};
module.exports.profi = async () => {
  const document = await getDOM('https://www.profi.ro/#oferte-profi-city');
  const $productCards = document.querySelectorAll(
    `[itemtype="http://schema.org/Product"]`
  );
  const products = [];
  for (let $productCard of $productCards) {
    const image =
      'https://www.profi.ro' +
      $productCard.querySelector(`.product-image > img`).getAttribute('src');
    const title = $productCard
      .querySelector('.product-content > h2')
      .textContent.trim();
    const description = $productCard
      .querySelector('.greutate')
      .textContent.trim();
    const price = parseFloat(
      $productCard.querySelector('.new-price-wrapper .price').textContent.trim()
    );
    products.push({
      title,
      description,
      price,
      image,
    });
  }
  return products;
};
module.exports.kaufland = async () => {
  const document = await getDOM(
    'https://www.kaufland.ro/oferte/oferte-saptamanale/saptamana-curenta.category=01a_Legume__fructe__flori.html'
  );
  const $productCards = document.querySelectorAll(
    `.o-overview-list__list-item`
  );

  const products = [];
  for (let $productCard of $productCards) {
    const image = $productCard
      .querySelector(`.a-image-responsive`)
      .getAttribute('src');
    const $titleElement = $productCard.querySelector(
      '.m-offer-tile__text .m-offer-tile__subtitle'
    );
    let title = '';
    if ($titleElement) {
      title = $productCard
        .querySelector('.m-offer-tile__text .m-offer-tile__subtitle')
        .textContent.trim();
    }

    const description = '';
    const price = parseFloat(
      $productCard.querySelector('.a-pricetag__price').textContent.trim()
    );
    products.push({
      title,
      description,
      price,
      image,
    });
  }
  return products;
};
// const altex = async () => {
//   const document = await getDOM(
//     'https://altex.ro/promo/oferte-catalog/laptop-desktop-it/laptopuri/'
//   );
//   const $productCards = document.querySelectorAll(
//     `.Products--promo .Products-item`
//   );
//   const products = [];
//   for (let $productCard of $productCards) {
//     // const image =
//     //   'https://www.profi.ro' +
//     //   $productCard.querySelector(`.product-image > img`).getAttribute('src');
//     const title = $productCard
//       .querySelector('.Product-name')
//       .textContent.trim();
//     // const description = $productCard
//     //   .querySelector('.greutate')
//     //   .textContent.trim();
//     const price = $productCard
//       .querySelector('.Price-current .Price-int')
//       .textContent.trim()
//       .replace('.', '');
//     products.push({
//       title,
//       // description,
//       price,
//       // image,
//     });
//   }
//   return products;
// };
/**
 * 
 https://scrap1234.azurewebsites.net/api/scrap123?code=g5rfiNDFycI4nizYVvKw5TCEqynTJzFqvHjsaGmz53Puu5fn4N8zPg==&store=lidl
 https://scrap1234.azurewebsites.net/api/scrap123?code=g5rfiNDFycI4nizYVvKw5TCEqynTJzFqvHjsaGmz53Puu5fn4N8zPg==&store=profi
 https://scrap1234.azurewebsites.net/api/scrap123?code=g5rfiNDFycI4nizYVvKw5TCEqynTJzFqvHjsaGmz53Puu5fn4N8zPg==&store=kaufland
 */
