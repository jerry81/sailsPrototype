const MongoClient = new require('mongodb').MongoClient;
const USERNAME = process.env.MONGO_INITDB_ROOT_USERNAME || 'admin'
const PASSWORD = process.env.MONGO_INITDB_ROOT_PASSWORD || 'admin'
console.log('userName password are ', process.env.MONGO_INITDB_ROOT_USERNAME, process.env.MONGO_INITDB_ROOT_PASSWORD)
const DBHOST = 'mongodb'
const DBPORT = '27017'
const DBNAME = 'trustana'
const MONGO_URL=`${DBHOST}://${USERNAME}:${PASSWORD}@${DBHOST}:${DBPORT}/${DBNAME}`
function attemptConnect (app) {
    const interval = setInterval(() => {
        MongoClient.connect(MONGO_URL, (err, client) => {
          if (!err) {
              clearInterval(interval)
              const trustana = client.db(DBNAME)
              app.users = trustana.collection('users')
              app.files = trustana.collection('files')
              app.sensitiveData = trustana.collection('sensitiveData')
              app.secrets = trustana.collection('secrets')
              console.log("Database connection established")
          } else {
              console.error('error while connecting ', err)
          }
        })
    }, 5000)
}
module.exports = function (app) {
   attemptConnect(app)
};