const KoaRouter = require('koa-router');
const router = new KoaRouter();
const axios = require('axios');
const paginate = require('koa-ctx-paginate');

const PERMITTED_FIELDS = [
    'origin',
    'destination',
    'startPoint',
    'endPoint',
    'distance',
    'ip'
];

/**
 * @fn searchNominatim()
 * @Description function to search a specific term in nominatim. The option used is query, because it's the recommended way to get the full capacity of nominatim. Although it isn't the smartest service around, if some OSM or Wikipedia data is missing, anyone can easily add or correct that information.
 * @param {string} term payload entrante.
 * @return {object} coordinates of the address if found
 */
const searchNominatim = async function(term) {
    const nominatim = "https://nominatim.openstreetmap.org/?addressdetails=1&q=";
    const url = encodeURI(nominatim+term+"&format=json&limit=1");
    const result = await axios.get(url);
    //when nominatim has no answer it comes back empty
    if(result && result.data.length > 0) {
        return {success: true, data: result.data[0]}
    } else{
        return {success: false, data: null, term: term }
    }
}

/**
 * @fn getDistanceKms().
 *
 * @Description Devuelve la distancia en kilomegtros entre dos puntos dados por su latitud y longitud
 * @param {float} lat1  Latitud del punto 1
 * @param {float} lon1  Longitud del punto 1
 * @param {float} lat2  Latitud del punto 2
 * @param {float} lon2  Longitud del punto 2
 * @returns {float} Distancia en kilometros
 */
const getDistanceKms = function(lat1, lon1, lat2,lon2) {
    const rad = function(x) {return x*Math.PI/180;}
    const R = 6378.137; //earth radius in km
    const dLat = rad( lat2 - lat1 );
    const dLong = rad( lon2 - lon1 );
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const d = R * c;
    return d.toFixed(2); //returns 2 decimals
}

/**
 * @fn checkLocation().
 *
 * @Description check if current location is already in the locations table to query its stored coordinates
 * @param {orm} location  sequilize location model
 * @param {string} address  actual text address
 * @returns {object} response (boolean) and locations if it already exists
 */
const checkLocation = async function(location,address){
     const exists = await location.findOne({ where: { address: address } });
    if (exists){
        return {success:true, data: {lon: exists.point[0], lat: exists.point[1]} }
    } else {
        return {success:false}

    }
}

/**
 * @fn saveLocation().
 *
 * @Description save current location in table
 * @param {orm} location  sequilize location model
 * @param {string} address  actual text address
 * @param {array} point coordinates [lon, lat]
 * @returns {object} response (boolean) and location
 */
const saveLocation = async function(location,address,point){
    const place = location.build({address,point});
    await place.save();
    return {success:true, data: place}
}

//recover specific historic query from fb
router.param('id', async (id, ctx, next) =>{
    const query = await ctx.orm.query.findByPk(id.toString());
    if (!query) ctx.throw(404);
    ctx.state.query = query;
    return next();
});

//look up two locations and use their coordinates to calculate distance
router.post('queries-search','/search', async (ctx) => {

    //check if coords are available, if not, time to use nominatim and save the new addresses
    let origin = await checkLocation(ctx.orm.location,ctx.request.body.origin);
    let destination = await checkLocation(ctx.orm.location,ctx.request.body.destination);
    let saveO,saveD = false;

    if (!origin.success){
        origin = await searchNominatim(ctx.request.body.origin);
        saveO = true;
    }
    if(!destination.success){
        destination = await searchNominatim(ctx.request.body.destination);
        saveD = true;
    }

    //TODO: to refine the search we could use actual maps and routing to let the user move around the pin to point exactly to the place they are in case nominatim answer isn't satisfying (which could be really possible)
    // https://www.liedman.net/leaflet-routing-machine/api/

    //If we're still missing one or both of the locations coordinates, return the error
    if(!origin.success || !destination.success){
        const error = {failure:true, origin:origin, destination:destination};
        console.log(error);
        const fail_params = {
            origin: ctx.request.body.origin,
            destination: ctx.request.body.destination,
            startPoint: origin.data=== null ? null : [origin.data.lon, origin.data.lat],
            endPoint: destination.data=== null ? null :[destination.data.lon, destination.data.lat],
            ip: ctx.request.ip,
            distance: null
        }
        const queryFail = ctx.orm.query.build(fail_params);
        await queryFail.save();
        return await ctx.render('index', {
            errors: error,
            actionPath: ctx.router.url('queries-search'),
        });
    }

    const distance = getDistanceKms( origin.data.lat, origin.data.lon, destination.data.lat, destination.data.lon);

    const query_params = {
        origin: ctx.request.body.origin,
        destination: ctx.request.body.destination,
        startPoint: [origin.data.lon, origin.data.lat],
        endPoint: [destination.data.lon, destination.data.lat],
        ip: ctx.request.ip,
        distance: distance
    }

    const query = ctx.orm.query.build(query_params);
    try {
        const res = await query.save();
        if(saveO) await saveLocation(ctx.orm.location,query_params.origin, query_params.startPoint)
        if(saveD) await saveLocation(ctx.orm.location,query_params.destination, query_params.endPoint)
        ctx.redirect(ctx.router.url('query',res.id));
    } catch (error) {
        console.log(error);
        await ctx.render('index', {
            errors: error.errors,
            actionPath: ctx.router.url('queries-search'),
        });
    }
});

//get all queries saved with pagination. TODO: create filtering options for queries results
router.get('queries', '/', async (ctx) => {
    try {
        const [ results, itemCount ] = await Promise.all([
        ctx.orm.query.findAll({offset: ctx.paginate.skip, limit : 5}),
            ctx.orm.query.count()
        ]);

        const pageCount = Math.ceil(itemCount / ctx.query.limit);

        if (ctx.is('json')) {
            //to load new batch of results in next page
            ctx.body = {
                object: 'list',
                has_more: paginate.hasNextPages(ctx)(pageCount),
                data: results
            };
        } else {
            //rooth first page loading
            await ctx.render('queries/index', {
                data: results,
                pageCount,
                itemCount,
                currentPage: ctx.query.page,
                pages: paginate.getArrayPages(ctx)(3,pageCount, ctx.query.page),
                fullPages: paginate.getArrayPages(ctx)(pageCount, pageCount, ctx.query.page),
                queryPath: (id) => ctx.router.url('query', id),
                newQueryPath: ctx.router.url('index'),
            });
        }

    } catch (err) {
        ctx.throw(err);
    }

});

router.get('query-edit', '/:id/edit', (ctx) => {
   //TODO: implement lefleat map to show and manage pins to refine positions and coordinates of current locations in query
    //show map with pins in current coordinates for both locations in query id
    return ctx.redirect(ctx.router.url('index'));
})

//actual saving of new coordinates for both locations
router.post('query-update', '/:id/update', async (ctx) => {
    //after moving the pins, the user send the new coordinates for both locations origin and desntiny to save them
    const { query } = ctx.state;
    query.set(ctx.request.body);
    try {
        await query.save({ fields: PERMITTED_FIELDS });
        ctx.redirect(ctx.router.url('query', query.id));
    } catch (error) {
        await ctx.render('index', {
            query,
            errors: error.errors,
            actionPath: ctx.router.url('queries-search'),
        });
    }
});

//in case we need it later
router.get('query-delete', '/:id/delete', async (ctx) =>{
    const { query } = ctx.state;
    try {
        await query.destroy();
        ctx.redirect(ctx.router.url('queries'));
    } catch (error){
        ctx.redirect('query', query.id);
    }
})

// showing the query info
router.get('query', '/:id', async (ctx) => {
    const { query } = ctx.state;
    if(query.distance === null){
        return ctx.redirect(ctx.router.url('queries'));
    }
    query.distance = query.distance.toString().replace('.',',');
    return ctx.render('queries/show', {
        query,
        queriesPath: ctx.router.url('queries'),
        newSearchPath: ctx.router.url('index')
    });
});

module.exports = router;
