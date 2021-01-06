const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const ObjectID = require("mongodb").ObjectID;
const { omit } = require("lodash")
const fileParser = require('koa-body')({multipart: true, uploadDir: '.'})
const Binary = require("mongodb").Binary;
const fs = require('fs')
const encryption = require('../security/encryption')
const constants = require('../constants/constants')
const moment = require('moment')

const app = new Koa();
require("../db/mongo")(app);
app.use(logger());
const router = new Router();
app.use(BodyParser());

router.post('/uploadResume', fileParser, async ctx => {
    try {
        const password = ctx.get('decryption-token')
        const file = ctx.request.files.file
        const {path, name, type} = file
        let fileData = fs.readFileSync(path);
        let insert_data = {name, type};
        const encrypted = encryption.encrypt(
            Buffer.from(fileData,"utf-8"),
            password
        )
        insert_data.file_data = Binary(
            encrypted.encryptedData
        );
        var filesCollection = ctx.app.files;
        const {insertedId} = await filesCollection.insertOne(insert_data)
        ctx.body = { insertedId, name, type } 
    } catch(err) {
        console.log('error is ', err)
    }
})

router.get('/downloadResume/:id/:fileName', async ctx => {
    try {
        const password = ctx.get('decryption-token')
        let params = ctx.params
        let documentQuery = {"_id": ObjectID(params.id)}; // Used to find the document
        const file = await ctx.app.files.find(documentQuery).toArray();
        const path = `./${params.fileName}`
        const decryptedBuffer = encryption.decrypt(file[0].file_data.buffer.toString(), password, true)
        await fs.writeFileSync(path, decryptedBuffer)
        const rs = await fs.createReadStream(path)
        ctx.attachment(params.fileName)
        ctx.body = rs
    } catch(err) {
        console.log(`error ${err.message}`, err)
    }
})

router.get("/user/findAll", async (ctx) => {
    const password = ctx.get('decryption-token')
    const unecrypted = await ctx.app.users.find().toArray()
    ctx.body = unecrypted.map(x => {
        x = encryption.decryptObject(x, password)
        return x
    })
});

router.put('/user/:id', async (ctx) => {
    let params = ctx.params
    const password = ctx.get('decryption-token')
    let documentQuery = {"_id": ObjectID(params.id)}; // Used to find the document
    let valuesToUpdate = omit(ctx.request.body, '_id');
    valuesToUpdate = encryption.encryptObject(valuesToUpdate, password)
    ctx.body = await ctx.app.users.updateOne(documentQuery, { $set: valuesToUpdate });
  }
)

router.post("/user", async (ctx) => {
    const password = ctx.get('decryption-token')
    let newUser = encryption.encryptObject(ctx.request.body, password)
    ctx.body = await ctx.app.users.insert(newUser);
});

router.post('/ex2/sensitiveData', async (ctx) => {
    let sensitiveInfo = encryption.encrypt(ctx.request.body.sensitiveInfo, constants.EX2_ENCRYPTION_KEY)
    await ctx.app.sensitiveData.remove({});
    const {ops} = await ctx.app.sensitiveData.insert({value: sensitiveInfo});
    ctx.body = ops
});

router.post('/ex2/generateToken', async (ctx) => {
    const stringified = encryption.stringifyToken(ctx.request.body)
    const {ops} = await ctx.app.secrets.insertOne(
        {token: stringified}
    )
    const parsed = encryption.parseToken(stringified)
    parsed['tokenId'] = ops[0]._id
    ctx.body = { stringified, parsed }
})

router.get('/ex2/sensitiveData/:token', async (ctx) => {
    const tokenId = ctx.query.tokenId
   const tokens = await ctx.app.secrets.find().toArray()
   const matchingToken = tokens.filter(x => { 
       return tokenId === x._id.toString() })[0]
   if (!matchingToken) {
      ctx.body = { message: 'token invalid'}
      return
   }
   const parsedToken = encryption.parseToken(matchingToken.token)
   const { oneTime, expiration } = parsedToken
   if (moment().isAfter(moment(expiration))) {
       ctx.body = { message: 'token expired' }
       return
   } 
   const items = await ctx.app.sensitiveData.find().toArray()
   ctx.body = { value: encryption.decrypt(items[0].value, constants.EX2_ENCRYPTION_KEY) }
   if (oneTime) {
       ctx.app.secrets.remove({"_id": ObjectID(tokenId)})
   }
})

app.use(router.routes()).use(router.allowedMethods());

const server = app.listen(3000);

module.exports = server