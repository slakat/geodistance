const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const KoaRouter = require('koa-router');
const router = new KoaRouter();

const PERMITTED_FIELDS = [
    'address',
    'point',
    'hint'
];

//recover specific location/place from fb
router.param('id', async (id, ctx, next) =>{
    const user = await ctx.orm.user.findByPk(id.toString());
    if (!user) ctx.throw(404);
    ctx.state.user = user;
    return next();
});

//get all places already saved in db similar to a term, a sort of address cache
router.post('locations-suggestions','/suggestions', async (ctx) => {
    const search = ctx.request.body.hint;
    const locations = await ctx.orm.location.findAll({
        where: {
            address: { [Op.like]: `%${search}%` },
        },
    }).catch((err) => {console.log("Error while finding locations : ", err)});
    ctx.status=200;
    ctx.body={results: locations};
})

//Other CRUD routes to build later
router.get('locations', '/', async (ctx) => {
    //TODO: show all locations saved in a view
    return ctx.redirect(ctx.router.url('index'));
});

router.get('locations-new', '/new', (ctx) => {
    //TODO: create new location from app (making a robust address directoru)
    return ctx.redirect(ctx.router.url('index'));
});

router.post('locations-create', '/', async (ctx) => {
    const location = ctx.orm.user.build(ctx.request.body);
    try {
        await location.save({ fields: PERMITTED_FIELDS });
        return ctx.redirect(ctx.router.url('index'));
    } catch (error) {
        await ctx.render('/new', {
            location,
            errors: error.errors,
            actionPath: ctx.router.url('queries-search'),
        });
    }
});

router.get('location-edit', '/:id/edit', (ctx) => {
    return ctx.redirect(ctx.router.url('index'));
})

router.post('location-update', '/:id/update', async (ctx) => {
    return ctx.redirect(ctx.router.url('index'));
});

router.get('location-delete', '/:id/delete', async (ctx) =>{
    return ctx.redirect(ctx.router.url('index'));
})

router.get('location', '/:id', async (ctx) => {
    return ctx.redirect(ctx.router.url('index'));
});

module.exports = router;
