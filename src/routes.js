const KoaRouter = require('koa-router');

const index = require('./routes/index');
const location = require('./routes/locations');
const query = require('./routes/queries');

const router = new KoaRouter();

router.use(async (ctx, next) => {
  try {
    await next();
  } catch(err) {
    switch(err.status) {
      case 404:
        ctx.app.emit('error', err, ctx);
        ctx.redirect(ctx.router.url('index-404'));
        break;
      default:
        throw err;
    }
  }
})

router.use(async (ctx, next) => {

  Object.assign(ctx.state, {
    rootPath: ctx.router.url('index')
  });
  return next();
});

router.use('/', index.routes());
router.use('/locations', location.routes());
router.use('/queries', query.routes());
module.exports = router;
