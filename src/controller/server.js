const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const ObjectID = require("mongodb").ObjectID;
const { omit } = require("lodash")
const fileParser = require('koa-body')({multipart: true, uploadDir: '.'})
const Binary = require("mongodb").Binary;
const fs = require('fs')

const app = new Koa();
require("../db/mongo")(app);
app.use(logger());
const router = new Router();

app.use(BodyParser());


router.post('/uploadResume', fileParser, async ctx => {
    try {
        const file = ctx.request.files.file
        const {path, name, type} = file
        let fileData = fs.readFileSync(path);
        let insert_data = {name, type};
        insert_data.file_data= Binary(fileData);
        var filesCollection = ctx.app.files;
        const {insertedId} = await filesCollection.insertOne(insert_data)
        console.log('inserted is ', name, type)
        ctx.body = { insertedId, name, type } 
    } catch(err) {
        console.log(`error ${err.message}`)
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

router.get("/user/findAll", async function (ctx) {
    ctx.body = await ctx.app.users.find().toArray()
});

router.put('/user/:id', async (ctx) => {
    let params = ctx.params
    let documentQuery = {"_id": ObjectID(params.id)}; // Used to find the document
    let valuesToUpdate = omit(ctx.request.body, '_id');
    ctx.body = await ctx.app.users.updateOne(documentQuery, { $set: valuesToUpdate });
  }
)

router.post("/user", async function (ctx) {
    let newUser = ctx.request.body
    ctx.body = await ctx.app.users.insert(newUser);
});



app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);