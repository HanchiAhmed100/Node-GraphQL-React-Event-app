/*******************************
    setup
********************************/
let express = require('express')
let bodyParser = require('body-parser')
let graphqlHttp = require('express-graphql')
let { buildSchema } = require('graphql')
let mongoose = require('mongoose')
let app = express()





/*******************************
    Middelwares
********************************/
app.use(bodyParser.json())
const Event = require('./models/event')





/************************************************************
 *      Graphql EndPoint
 *      GRAPHQL Doc
    Rq : graphql is a type language

    schema define the routes of query and mutations
    RootQuery : list of possible query {
        return the type like ' events ' : object 
        and each object must have the return type in a []
        to define a list of something you must add the ' ! ' 
    }
    RootMutation: {
        list of query or we can call it function 
        to add , update or delete data 
        createEvent the name of the function
        arguments : name and with type of String 
        and the return of this function is also a String 
    }

    rootValue {
        Is a bundle of resulvers
        and each resolver must match the query or mutation name 

    }

    input : type used to define a list of specific type
*************************************************************/
app.use('/graphql', graphqlHttp({
    schema: buildSchema(`

        type Event {
            _id: ID!
            title : String!
            description : String!
            price : Float!
            number : Int!
            date : String!
        }


        input EventInput{
            title : String! 
            description : String!
            price : Float!
            number : Int!
            date : String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(EventInput : EventInput ): Event
        }

        schema {
            query:  RootQuery
            mutation : RootMutation
        }
    `),
    rootValue: {
        /**************************************************
         *  Method to get all event from the DataBase 
         ***************************************************/
        events: () => {
            return Event.find().then(events => {
                return events.map(event => {
                    return {...event._doc, _id: event.id }
                })
            }).catch(err => {
                console.log(err)
            })
        },
        /**************************************************
         *   Method for adding an event
         ***************************************************/

        createEvent: (args) => {
            /**************************************************
             *   Mapping the agrs to new Event Model
             ***************************************************/
            const event = new Event({
                title: args.EventInput.title,
                description: args.EventInput.description,
                price: +args.EventInput.price,
                number: +args.EventInput.number,
                date: new Date(args.EventInput.date)
            })

            /**************************************************
             *   Inserting the event 
             ***************************************************/
            return event
                .save()
                .then(result => {
                    console.log(result)
                    return {...result._doc, _id: result._doc._id.toString() }
                })
                .catch(err => {
                    console.log(err)
                    throw err
                })
        }
    },
    /************************************************
     *   setting the graphQL tool interface to true 
     *************************************************/
    graphiql: true

}))


/*****************************************************************
 *  setting up the port and the connection to the mongo data base
 ******************************************************************/
mongoose.connect(`mongodb+srv://ahmed:azerty@cluster0-hxo3u.mongodb.net/event-app?retryWrites=true`).then(() => {
        app.listen(3000, function() {
            console.log('server running on port : 3000')
        })
    })
    .catch(err => {
        console.log(err)
    })