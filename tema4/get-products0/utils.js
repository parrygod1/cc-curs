
var mongoose = require('mongoose');
process.env.COSMOSDB_USER = 'c0sm0sdb0';
process.env.COSMOSDB_PASSWORD =
  '';
process.env.COSMOSDB_DBNAME = 'db0';
process.env.COSMOSDB_HOST = 'c0sm0sdb0.mongo.cosmos.azure.com';

process.env.COSMOSDB_PORT = 10255;
/*const Product = mongoose.model(
  'Product',
  new mongoose.Schema({
    Description: String,
    ImageLink: String,
    Name: String,
    Price: Number,
    Stores: String,
  })
);*/


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


module.exports.getProd = async () => {
    const Product = require('mongoose').model('Product')

    var lst = await Product.find({ });
    return lst;    
};
  