const fetch = require('node-fetch');
const fs = require('fs');
const request = require('request');

var mongoose = require('mongoose');
process.env.COSMOSDB_USER = 'c0sm0sdb0';
process.env.COSMOSDB_PASSWORD =
  '';
process.env.COSMOSDB_DBNAME = 'db0';
process.env.COSMOSDB_HOST = 'c0sm0sdb0.mongo.cosmos.azure.com';

process.env.COSMOSDB_PORT = 10255;
const ONE_MEGABYTE = 1024 * 1024;
const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
const Product = mongoose.model(
  'Product',
  new mongoose.Schema({
    Description: String,
    ImageLink: String,
    Name: String,
    Price: Number,
    Stores: String,
  })
);

const { BlobServiceClient } = require('@azure/storage-blob');
process.env.BLOB_KEY =
  'DefaultEndpointsProtocol=https;AccountName=csb100320012fbbddb4;AccountKey=;EndpointSuffix=core.windows.net';
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.BLOB_KEY
);

const sha256 = require('sha256');

module.exports.dbConnect = async () => {
  await mongoose
    .connect(
      'mongodb://' +
        process.env.COSMOSDB_HOST +
        ':' +
        process.env.COSMOSDB_PORT +
        '/' +
        process.env.COSMOSDB_DBNAME +
        '?ssl=true&replicaSet=globaldb',
      {
        auth: {
          user: process.env.COSMOSDB_USER,
          password: process.env.COSMOSDB_PASSWORD,
        },
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryWrites: false,
      }
    )
    .then(() => console.log('Connection to CosmosDB successful'))
    .catch((err) => console.error(err));
};

module.exports.delContainer = async () => {
  const containerClient = blobServiceClient.getContainerClient('bc0');
  const deleteContainerResponse = await containerClient.delete();
  console.log(
    'Container was deleted successfully. requestId: ',
    deleteContainerResponse.requestId
  );
};

module.exports.insertProd = async (prod, store) => {
  // Get a reference to a container
  const containerClient = blobServiceClient.getContainerClient('bc0');

  // Create the container
  // const createContainerResponse = await containerClient.create();
  //console.log("Container was created successfully. requestId: ", createContainerResponse.requestId);

  for (i in prod) {
    // Create a unique name for the blob
    const blobName = 'img' + sha256(i.toString()) + '.jpeg';

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    console.log('\nUploading to Azure storage as blob:\n\t', blobName);

    let url = prod[i].image;

    const stream = await fetch(url);
    try {
      await blockBlobClient.uploadStream(
        stream.body,
        uploadOptions.bufferSize,
        uploadOptions.maxBuffers,
        { blobHTTPHeaders: { blobContentType: 'image/jpeg' } }
      );
      console.log('File uploaded to Azure Blob storage');
    } catch (err) {
      console.log('error at upload to blob st', err);
      process.exit();
    }

    const product = new Product({
      Description: prod[i].description,
      ImageLink: blobName,
      Name: prod[i].title,
      Price: prod[i].price,
      Stores: store,
    });

    await product.save((err, saveProduct) => {
      console.log(JSON.stringify(saveProduct));
    });
  }
};

module.exports.delProd = async () => {
  await mongoose.connection.dropCollection('products', function (err, result) {
    console.log('collection dropped');
  });
};
