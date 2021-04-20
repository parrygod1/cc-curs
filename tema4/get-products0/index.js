const { dbConnect, getProd} = require('./utils');

module.exports = async function (context, req) {

    context.log('JavaScript HTTP trigger function processed a request.');    

    await dbConnect();
    let prods = await getProd();
    //console.log(prods); 
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(prods)
    };
}