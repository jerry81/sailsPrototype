const MongoClient = new require('mongodb').MongoClient;
const MONGO_URL = "mongodb://localhost:27017/trustana";
module.exports = function (app) {
    MongoClient.connect(MONGO_URL, (err, client) => {
        const trustana = client.db('trustana')
        app.users = trustana.collection('users')
        console.log("Database connection established")
    })
};