const Koa = require("koa");
const Router = require("koa-router");
const BodyParser = require("koa-bodyparser");
const logger = require('koa-logger');

const app = new Koa();
require("../db/mongo")(app);
app.use(logger());
const router = new Router();

app.use(BodyParser());

router.get("/user/findAll", async function (ctx) {
    console.log('ctx.app', ctx.app)
    ctx.body = await ctx.app.users.find().toArray()
});

router.get("/paramTest", async function (ctx) {
    let name = ctx.request.query.name || "World";
    ctx.body = {message: `Hello ${name}!`}
});

router.post("/", async function (ctx) {
    let name = ctx.request.body.name || "World";
    ctx.body = {message: `Hello ${name}!`}
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(3000);