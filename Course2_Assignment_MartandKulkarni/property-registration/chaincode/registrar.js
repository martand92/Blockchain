'use strict';

const {Contract} = require('fabric-contract-api');

class RegistrarContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.property-registration-network.registrar');
    }

    /* ****** All custom functions are defined below ***** */
    
    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Property Registration Smart Contract Instantiated');
    }
    


    /**
     * To register a new user on the ledger based on the request received
     * @param ctx - The transaction context object
     * @param name - name of the User who need to be registered
     * @param aadharNumber - Aadhar number of the user
     * @returns {newUserObject}  
     */
    async approveNewUser(ctx, name, aadharNumber) {
     // Create a new composite key to fetch user's request object
     const userRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.request', [name + '-' + aadharNumber]);
        
     // Fetch User's request with given name and aadharNumber from blockchain
     let userReqBuffer = await ctx.stub
        .getState(userRequestKey)
        .catch(err => console.log(err));


        //Check if user request is in network
        if(userReqBuffer.toString().includes(name)){
            let user = JSON.parse(userReqBuffer.toString());

            // Create a user object to be stored in blockchain
            let newUserObject = {
                name: user.name,
                email: user.email,
                phoneNumber : user.phoneNumber,
                aadharNumber : user.aadharNumber,
                createdAt: user.createdAt,
                updatedAt: new Date(),
                upgradCoins: 0
            };

            //Create composite key for user asset
            const userObjKey = ctx.stub.createCompositeKey('org.property-registration-network.user', [name + '-' + aadharNumber]);   
            
            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newUserObject));
            await ctx.stub.putState(userObjKey, dataBuffer);
            
            // Return value of newly created user
            return newUserObject;

        } else {
            throw new Error ("User request with name : " + name + " and aadhar number : " + aadharNumber + " for approval is not found as in network ");
        }
    
    }


    /**
	 * To view current state of the User
	 * @param ctx - The transaction context object
	 * @param name - name of the User
     * @param aadharNumber - Aadhar number of the user
     * @returns {userObj}
	 */
	async viewUser(ctx, name, aadharNumber) {

        // Create a composite key to fetch existing user's object
        const userRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.user', [name + '-' + aadharNumber]);
        
        // Fetch User and check if he exists in network
		let userBuffer = await ctx.stub
        .getState(userRequestKey)
        .catch(err => console.log(err));

       
         if(userBuffer.toString().includes(name)){
             return JSON.parse(userBuffer.toString());
         } else {
             throw new Error ("User : " + name + " with aadhar number : "+ aadharNumber + " not found");  
         }  
    }

    
    /**
     * To approve registered property of user by registrar
     * @param ctx - The transaction context object
     * @param propertyID - ID of the property being registered by user
     * @returns {propObject}
     */
    async approvePropertyRegistration(ctx, propertyID) {

     // Create a composite key fetch propert details using propertyID
     const propertyRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.request', [propertyID]);
        
     // Fetch property details to check if property is already registered
     let propertyReqBuffer = await ctx.stub
        .getState(propertyRequestKey)
        .catch(err => console.log(err));

            if(propertyReqBuffer.toString().includes(propertyID)){

                let property = JSON.parse(propertyReqBuffer.toString());

                // Update property Asset to be stored in blockchain
                let propObject = {
                    name: property.name,
                    aadharNumber : property.aadharNumber,
                    propertyID : propertyID,
                    price : property.price,
                    owner : property.owner,
                    status : property.status
                };

                //Create composite key for property asset
                const propertyObjKey = ctx.stub.createCompositeKey('org.property-registration-network.property', [propertyID]);
                

                // Convert the JSON object to a buffer and send it to blockchain for storage
                let dataBuffer = Buffer.from(JSON.stringify(propObject));
                await ctx.stub.putState(propertyObjKey, dataBuffer); 
             
                return propObject;

            } else {
                throw new Error ("Request for Property with ID : "+ propertyID + " is not found in network");   
            }   
    }

    
    /**
	 * To view property of user
	 * @param ctx - The transaction context object
     * @param propertyID - ID of the property being registered by user
     * @returns {propObject}
	 */
	async viewProperty(ctx, propertyID) {

        // Create a composite key fetch propert details using propertyID
        const propertyRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.property', [propertyID]);
         
         // Fetch property details
         let propertyBuffer = await ctx.stub
         .getState(propertyRequestKey)
         .catch(err => console.log(err));
 
        if(propertyBuffer.toString().includes(propertyID)){
            let propObject = JSON.parse(propertyBuffer.toString());
            return propObject;

        } else {
            throw new Error ("Property with ID " + propertyID + " is not found in network");   
        }   
    }
    

}

module.exports = RegistrarContract;
