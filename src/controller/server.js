const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');
const ObjectID = require("mongodb").ObjectID;
const { omit } = require("lodash")

const app = new Koa();
require("../db/mongo")(app);
app.use(logger());
const router = new Router();

app.use(BodyParser());

router.get("/user/findAll", async function (ctx) {
    ctx.body = await ctx.app.users.find().toArray()
});

router.get("/paramTest", async function (ctx) {
    let name = ctx.request.query.name || "World";
    ctx.body = {message: `Hello ${name}!`}
});

router.put('/user/:id', async (ctx) => {
    let params = ctx.params
    console.log('params is ', params)
    let documentQuery = {"_id": ObjectID(params.id)}; // Used to find the document
    let valuesToUpdate = omit(ctx.request.body, '_id');
    console.log('valuesToUpdate', valuesToUpdate)
    console.log('documentQuery is ', documentQuery)
    ctx.body = await ctx.app.users.updateOne(documentQuery, { $set: valuesToUpdate });
  }
)

router.post("/user", async function (ctx) {
    let newUser = ctx.request.body
    ctx.body = await ctx.app.users.insert(newUser);
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);