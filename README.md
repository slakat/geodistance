# GeoDistance prototype

Simple app to get the distance between two points.

Coordinates are used to calculate the distance. Locations are presented by their names and transformed into the respective latitude/longitude later to do the process.

## Running app
to install run
```
yarn install
```
Then
```
yarn dev
```

## Database Schema
The database is built in postgres to store the games and user saves is hosted in Atlas and uses MongoDB. Check the database file to adjust the access to it or create it with:
> yarn sequelize db:create

And run the migrations:
> yarn sequelize db:migrate


The Schemas for it are as follows:

1. queries: This schema stores a historical register of queries
```javascript
{
    origin: string
    destination: string
    start_point: array //origin address | GeoJson format: [longitude,latitude]
    end_point: array //destination address | GeoJson format: [longitude,latitude]
    distance: float //distance in kms
    ip: string //just to have a sort of user id
    created_at: timestamp

    
}
```

Note: maybe we could use PostGIS for geolocation points, but for the prototype will do it just with an array, but following the usual order format, to be ready to migrate.

2. cache_routes: this schema will save every unique pair of points to be used as a cache resource.
we can reduce the use of nominatim service with this and use it to refine the data in every location adapting what the users look up as prompt, and later we can even fix the coordinates with user's help through maps.
```javascript
{
    address: string
    point: array //origin address | GeoJson format: [longitude,latitude]
    created_at: timestamp

    
}
```
The reason why we're not saving the actual name of the place in the nominatim's service is, because sometimes it's not the exact place or even the right one, so can't assume the coordinates are actually the right address that the user's looking for. For that we have to invest time in checking with the user and get their feedback about how the place we answer as coordinates correlates with the address they wrote. So for now, the best we can do is to give the structure to make that process easy and work on the better address-coordinates aligner in a later phase. We can even use the statistics saved from queries and from locations to understand how good nominatim is doing as a service and how we can make this process better.

## views
To access the data from the searched places:

### New query
Create a new query for distance in the root:
```
GET <host>/
```

### Show query
See details of queries.
```
GET <host>/queries/:id
```
### Create query of distance
Look up two locations and create a new query if coordinates are available for both
```
POST <host>/queries/search
```
The body of this call should be like this:
```json
{
    "origin": "address 01",
    "destination": "address 02"
}
```

### Show all distance queries
See the historical saved queries done by the users, includes the one with errors, but in this case there won't be an individual page
```
GET <host>/queries
```

### TODO
Thinking in refining the search we could use actual maps and routing to let the user move around the pin to point exactly to the place they are in case nominatim answer isn't satisfying (which could be really possible)

Something like this:
>https://www.liedman.net/leaflet-routing-machine/api/

#### Dockerfile *TBA*

## Challenge's questionnaire
[➡️ Check the six answers here](https://github.com/slakat/geodistance/blob/master/docs/questions.md)
