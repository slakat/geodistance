const KoaRouter = require('koa-router');
const router = new KoaRouter();
//const limit = 2;

const renderIndex = async (ctx, permission_error) => {
  await ctx.render('index', {
    permission_error: permission_error,
    actionPath: ctx.router.url('queries-search'),
    queriesPath: ctx.router.url('queries'),
  });
};

router.get('index', '/', async (ctx) => {
  const permission_error = false;
  await renderIndex(ctx, permission_error);
});

router.get('index-404', '/404', async (ctx) => {
  await ctx.render('index')
});


module.exports = router;
