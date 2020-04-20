# Description
This server is created using express in nodejs. It is used to connect to cosmosdb and storage in azure. 

# Endpoints
1. GET /users  
    This will return a json with user credentials.
2. GET /locations  
    This will return a json with all the locations added by the admin.
3. GET /subscribers
    This will return a json with details of all the subscribers.
4. POST /checkuser
    User credentials authentication can be done using this endpoint. This will return a json with the status and the username.
    Expected Data as JSON:
    * username
    * password
5. POST /livelocation  
    This endpoint is created to receive the live location of a user. The user details and location details are received as json and it is published to a consumable queue in the cloud.
    Expected Data as JSON:
    * username
    * lat
    * lon
    * uuid          (optional: -1 should be send if there is no beacon detected.)
    * major         (optional: -1 should be send if there is no beacon detected.)
    * minor         (optional: -1 should be send if there is no beacon detected.)
    * range         (optional: -1 should be send if there is no beacon detected.)
6. POST /adduser  
    This endpoint connects to the cosmosdb in azure and creates a user using the json received.
    Expected Data as JSON:
    * username 
    * password
    * firstname
    * lastname
    * email
    * phone
7. POST /addlocation
    This endpoint connects to the cosmosdb in azure and creates a location using the json received.
    Expected Data as JSON:
    * id
    * locationname
    * description
    * elat
    * elon
    * range
    * altitude
8. POST /addsubscriber  
    This endpoint is made to add subscribers. The details are then added to the cosmosdb database.
    Expected Data as JSON:
    * username
    * locationname
    * message

## Note
The names of the elements in each JSON endpoint should be strictly followed. (All Lowercase)