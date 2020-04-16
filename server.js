// Creating a server using express in NodeJS

const express = require('express') 
const app = express()
const port = process.env.PORT || 3000;
const config = require('./config');
var azure = require('azure-storage');
const QueueMessageEncoder = azure.QueueMessageEncoder;
var queueSvc = azure.createQueueService(config.azureStorageAccount, config.azureStorageAccessKey)
const CosmosClient = require("@azure/cosmos").CosmosClient

//Queue Connection
queueSvc.createQueueIfNotExists('queue', (error, result, response) => {
    if(error) {
        console.log(error)
    }
    if(result.created) {
        console.log("Queue created.")
    }
})
queueSvc.messageEncoder = new QueueMessageEncoder.TextBase64QueueMessageEncoder();
// CosmosDB connection
endpoint = config.endpoint
key = config.key
const client = new CosmosClient({endpoint, key});
const userdatabase = client.database(config.userdatabaseId)
const usercontainer = userdatabase.container(config.usercontainerId)
const locationdatabase = client.database(config.locationdatabaseId)
const locationcontainer = locationdatabase.container(config.locationcontainerId)
const subscribercontainer = locationdatabase.container(config.subscribercontainerId)
//REST API Starts here
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

// Default Error Handler
app.use (function (error, request, response, next){
    console.error("WARNING: error detected...")
    console.error(error.stack)
    response.status(500).send("Error handling request: " + error.message)
});

// Handler for get request to return information about users
app.get('/users', async(request, response) => {
    try{
        const querySpec = {
            query: "SELECT * from c"
        };
        //Query is performed in the container specified and the result is stored in items
        const { resources: items } = await usercontainer.items
            .query(querySpec)
            .fetchAll();
        //The result is sent to the client.
        response.json(items)
        console.log('List of Users sent!')
    } catch(err) {
        console.log(err)
        return response.send(err);
    }
});

// Handler for get request to return information about locations
app.get('/locations', async(request, response) => {
    try{
        const querySpec = {
            query: "SELECT * from c"
        };
        //Query is performed in the container specified and the result is stored in items
        const { resources: items } = await locationcontainer.items
            .query(querySpec)
            .fetchAll();
        //The result is sent to the client.
        response.json(items)
        console.log('List of Admin added locations sent!')
    } catch(err) {
        console.log(err)
        return response.send(err);
    }
});

// Handler for get request to return information about subscribers
app.get('/subscribers', async(request, response) => {
    try{
        const querySpec = {
            query: "SELECT * from c"
        };
        //Query is performed in the container specified and the result is stored in items
        const { resources: items } = await subscribercontainer.items
            .query(querySpec)
            .fetchAll();
        //The result is sent to the client.
        response.json(items)
        console.log('List of Subscribers sent!')
    } catch(err) {
        console.log(err)
        return response.send(err);
    }
});

// Handler for authentication requests
app.post('/checkuser', async(request, response) => {
    /*
        Here the username and password is passed as json
        for authentication.
    */
    try{
        const user_details = request.body
        const res = {
            status: "FAILED",
            username: user_details.username
        }
        const querySpec = {
            query: "SELECT * from c"
        };
        const {resources} = await usercontainer.items.query(querySpec).fetchAll();
        for (var queryResult of resources) {
            let query_user = queryResult.username;
            let query_password = queryResult.password;
            if (user_details.username == query_user && user_details.password == query_password) {
                console.log('Authentication Successful.');
                res.status = "SUCCESS";
                return response.json(res);
            }
        }
        console.log('Authentication Unsuccessful.');
        return response.json(res);
    } catch(err) {
        console.log(err)
        return response.json(res);
    }
});

// Handler for a post request for live location details
app.post('/livelocation', (request, response) => {
    /*
        Here the data is recieved as json
        After it is received it is added to the consumable queue.
    */
    queueSvc.createMessage(config.queueName, JSON.stringify(request.body), (error, result, res) =>{
        if(error) {
            console.log(error);
            response.send('Error occured!\n');
        }
        else 
            console.log("Messaged added to the queue.");
            return response.send('Message added to consumable queue!\n');
    })

});

// Handler for a post request for user details
app.post('/adduser', async(request, response) => {
    /*
        Here the user credentials are recieved through json
        After it is received it is added to the database.
    */
    try{
        const {resource: createdItem} = await usercontainer.items.create(request.body)
        console.log("User Added!")
        response.send('User Added! Good Job!\n');
    } catch(err) {
        console.log(err.message);
        return response.send('Error Occured\n');
    }
});

// Handler for a post request for adding location details
app.post('/addlocation', async(request, response) => {
    /*
        Here the location details are recieved through json
        After it is received it is added to the database.
    */
    try{
        const {resource: createdItem} = await locationcontainer.items.create(request.body)
        console.log("Location Added!")
        response.send('Location Added! Good Job!\n');
    } catch(err) {
        console.log(err.message);
        return response.send('Error Occured\n');
    }
}); 

// Handler for a post request for adding subscribers 
app.post('/addsubscriber', async(request, response) => {
    /*
        Here the subscriber credentials are recieved through json
        After it is received it is added to the database.
    */
    try{
        const {resource: createdItem} = await subscribercontainer.items.create(request.body)
        console.log("Subscriber Added!")
        response.send('Subscriber Added! Good Job!\n');
    } catch(err) {
        console.log(err.message);
        return response.send('Error Occured\n');
    }
});



// Starting the server at the specified port
app.listen(port, () => console.log("Listening on port " + port));