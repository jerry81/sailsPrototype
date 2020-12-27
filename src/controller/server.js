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
        insert_data.file_data= Binary(fileData);
        var filesCollection = ctx.app.files;
        const {insertedId} = await filesCollection.insertOne(insert_data)
        ctx.body = { insertedId, name, type } 
    } catch(err) {
        await ctx.render('error', {message: err.message})
    }
})

router.get('/downloadResume/:id/:fileName', async ctx => {
    try {
        let params = ctx.params
        let documentQuery = {"_id": ObjectID(params.id)}; // Used to find the document
        const file = await ctx.app.files.find(documentQuery).toArray();
        const path = `../temp/${params.fileName}`
        await fs.writeFileSync(path, file[0].file_data.buffer)
        const rs = await fs.createReadStream(path)
        ctx.attachment(params.fileName)
        ctx.body = rs
    } catch(err) {
        console.log(`error ${err.message}`)
        await ctx.render('error', {message: err.message})
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
    console.log('newUser is ', newUser)
    ctx.body = await ctx.app.users.insert(newUser);
});



app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);