'use strict';

const {Contract} = require('fabric-contract-api');

class UserContract extends Contract {

    constructor() {
		// Provide a custom name to refer to this smart contract
        //super('org.property-registration-network.userregnet');
        super('org.property-registration-network.user');
    }

    /* ****** All custom functions are defined below ***** */
	
	// This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('User Registration Smart Contract Instantiated');
    }


    /**
	 * To register request by user to add them to network
	 * @param ctx - The transaction context object
	 * @param name - name of the User who need to be registered
     * @param email - EmailID of the user
     * @param phoneNumber - Phone number of the user
     * @param aadharNumber - Aadhar number of the user
	 * @returns {newReqObject}  
	 */
	async requestNewUser(ctx, name, email, phoneNumber, aadharNumber) {

        // Create a new composite key to store user's request object
        const userRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.request', [name + '-' + aadharNumber]);
        
        //Check if user is already present
        let userBuffer = await ctx.stub
        .getState(userRequestKey)
        .catch(err => console.log(err));

        if(userBuffer.toString().includes(name)){
            throw new Error ("User with name : " + name + " and with aadhar : "+ aadharNumber + " is already present");
        } else{
        // Create a request object to be stored in blockchain
		let newReqObject = {
			name: name,
            email: email,
            phoneNumber : phoneNumber,
            aadharNumber : aadharNumber,
            createdAt: new Date(),
            updatedAt: new Date()
		};
		
		// Convert the JSON object to a buffer and send it to blockchain for storage
		let dataBuffer = Buffer.from(JSON.stringify(newReqObject));
		await ctx.stub.putState(userRequestKey, dataBuffer);
		// Return value of newly created user
		return newReqObject;     
        }	   
    }



    /**
	 * User to recharge their account with upgradCoins
	 * @param ctx - The transaction context object
	 * @param name - name of the User
     * @param aadharNumber - Aadhar number of the user
     * @param bankTxID - Bank transaction ID received as part of payment done to get upgradCoins
	 */
	async rechargeAccount(ctx, name, aadharNumber, bankTxID) {

        if(bankTxID === "upg100" || bankTxID === "upg500" || bankTxID === "upg1000" ){
        // Create a composite key to fetch existing user's object
        const userRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.user', [name + '-' + aadharNumber]);
        
        // Fetch User and check if he exists in network
		let userBuffer = await ctx.stub
        .getState(userRequestKey)
        .catch(err => console.log(err));
            let upgradCoins = 0; 
            if(userBuffer.toString().includes(name)){
                if(bankTxID === "upg100"){
                    upgradCoins = 100;
                }else if(bankTxID === "upg500"){
                    upgradCoins = 500;
                }else if(bankTxID === "upg1000"){
                    upgradCoins = 1000;
             }
            let user =  JSON.parse(userBuffer.toString());  

            // Update user object to be stored in blockchain
		    let userObject = {
			    name: user.name,
                email: user.email,
                phoneNumber : user.phoneNumber,
                aadharNumber : user.aadharNumber,
                createdAt: user.createdAt,
                updatedAt: new Date(),
                upgradCoins: user.upgradCoins + upgradCoins
		    };
            

		    // Convert the JSON object to a buffer and send it to blockchain for storage
		    let dataBuffer = Buffer.from(JSON.stringify(userObject));
            await ctx.stub.putState(userRequestKey, dataBuffer);
            
            return userObject;

            } else {
                throw new Error ("User : " + name + " with aadhar number : "+ aadharNumber + " not found");  
            }

        } else {
            throw new Error ("Invalid Bank Transaction ID : " + bankTxID);
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
	 * User to register the details of their property on the network
	 * @param ctx - The transaction context object
	 * @param name - name of the User
     * @param propertyID - ID of the property being registered by user
     * @param price - price of this property
     * @param aadharNumber - Aadhar number of the user
     * @returns {propReqObject}
	 */
	async propertyRegistrationRequest(ctx, name, aadharNumber, propertyID, price) {

        // Create a composite key to fetch owner details 
        const ownerCompKey = ctx.stub.createCompositeKey('org.property-registration-network.user', [name + '-' + aadharNumber]);
        
        //Create propertyReq Asset with propertyCompKey
        const propReqCompKey = ctx.stub.createCompositeKey('org.property-registration-network.request', [propertyID]);


        //Create property Asset composite key to check if property already registered
        const propCompKey = ctx.stub.createCompositeKey('org.property-registration-network.property', [propertyID]);
        
		let ownerBuffer = await ctx.stub
        .getState(ownerCompKey)
        .catch(err => console.log(err));

        
		let propertyBuffer = await ctx.stub
        .getState(propCompKey)
        .catch(err => console.log(err));
        
        // Check if owner is in network
        if(ownerBuffer.toString().includes(name)){

            // Check if property is already in network
            if(!propertyBuffer.toString().includes(propertyID)){

                // Update user object to be stored in blockchain
                let propReqObject = {
                    name: name,
                    aadharNumber : aadharNumber,
                    propertyID : propertyID,
                    price : price,
                    owner : ownerCompKey,
                    status : "registered"
                };

                // Convert the JSON object to a buffer and send it to blockchain for storage
                let dataBuffer = Buffer.from(JSON.stringify(propReqObject));
                await ctx.stub.putState(propReqCompKey, dataBuffer);
                
                return propReqObject; 

            } else {
                throw new Error ("Property : "+ propertyID +" about to be registered is already in network")
            }

        } else {
                throw new Error ("Owner : " + name + " with aadhar number : "+ aadharNumber + " not found in network"); 
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
            throw new Error ("Property with ID " + propertyID + " is not found for provided propertyID");   
        }   
    }



    /**
	 * To update status of the property of user 
	 * @param ctx - The transaction context object
     * @param propertyID - ID of the property being registered by user
     * @param name - name of the user
     * @param aadharNumber - Aadhar number of the user
     * @param status - Status of the property to be updated
     * @returns {propObject}
	 */
	 async updateProperty(ctx, propertyID, name, aadharNumber, status) {
        if(["registered","onSale"].includes(status)){

        // Create a composite key fetch propert details using propertyID
        const propertyRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.property', [propertyID]);
         
        // Fetch property details to check if property is already registered
        let propertyBuffer = await ctx.stub
        .getState(propertyRequestKey)
        .catch(err => console.log(err));
            
        //Check if property exist in network
        if(propertyBuffer.toString().includes(propertyID)){
 
            let property = JSON.parse(propertyBuffer.toString());

            //Check if user trying to update his property is the actual owner
            if (property.owner === ctx.stub.createCompositeKey('org.property-registration-network.user', [name + '-' + aadharNumber])){

                // Updated property Asset to be stored in blockchain
                let propObject = {
                    name: property.name,
                    aadharNumber : property.aadharNumber,
                    propertyID : propertyID,
                    price : property.price,
                    owner : property.owner,
                    status : status
                };

            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(propObject));
            await ctx.stub.putState(propertyRequestKey, dataBuffer); 
              
            return propObject;

            }else {
                throw new Error ("UnAuthorized user " + name + " with aadhar number " + aadharNumber + " is trying to update status of property");
            }   
 
        } else {
            throw new Error ("Property is not found for provided propertyID : " + propertyID);   
         }  
         
        } else {
            throw new Error ("Improper status value provided, accepted values are only registered or onSale : " + status);  
        }
     }




     /**
	 * To approve registered property of user by registrar
	 * @param ctx - The transaction context object
     * @param propertyID - ID of the property being registered by user
     * @param name - Name of the buyer
     * @param aadharNumber - Aadhar number of the buyer 
	 */
	async purchaseProperty(ctx, propertyID, name, aadharNumber) {

        // Create a composite key fetch propert details using propertyID
        const propertyRequestKey = ctx.stub.createCompositeKey('org.property-registration-network.property', [propertyID]);
         
        // Fetch property details to check if property is up for sale
        let propertyBuffer = await ctx.stub
        .getState(propertyRequestKey)
        .catch(err => console.log(err));
        
        //Check if property is in network
        if(propertyBuffer.toString().includes(propertyID)){
 
            let property = JSON.parse(propertyBuffer.toString());
             
            //Check if property is for sale
            if(property.status === "onSale" ){

                //To check if initiator (buyer) has enough acct balance
                // Create a composite key to fetch owner details 
                const buyerCompKey = ctx.stub.createCompositeKey('org.property-registration-network.user', [name + '-' + aadharNumber]);
                const sellerCompKey = ctx.stub.createCompositeKey('org.property-registration-network.user', [property.name + '-' + property.aadharNumber]);
        

                // get buyer details
                let buyerBuffer = await ctx.stub
                .getState(buyerCompKey)
                .catch(err => console.log(err));


                // get Seller details
                let sellerBuffer = await ctx.stub
                .getState(sellerCompKey)
                .catch(err => console.log(err));  
                
                
                //Check if buyer is in network 
                if(buyerBuffer.toString().includes(name)){

                let buyer = JSON.parse(buyerBuffer.toString());
                let seller = JSON.parse(sellerBuffer.toString());

                    if(parseInt(buyer.upgradCoins) >= parseInt(property.price)){

                        //Update property Asset with changes ownership and status to be stored in blockchain
                        let propObject = {
                            name: name,
                            aadharNumber : aadharNumber,
                            propertyID : propertyID,
                            price : parseInt(property.price),
                            owner : buyerCompKey,
                            status : "registered"
                        };

                            
                        //Update Buyer info into network with updated upGradCoins
                        let buyerObject ={
                            name: name,
                            email: buyer.email,
                            phoneNumber : buyer.phoneNumber,
                            aadharNumber : buyer.aadharNumber,
                            createdAt: buyer.createdAt,
                            updatedAt: new Date(),
                            upgradCoins: parseInt(buyer.upgradCoins) - parseInt(property.price)
                        };


                        //Update seller info into network with updated upGradCoins
                        let sellerObject ={
                            name: property.name,
                            email: seller.email,
                            phoneNumber : seller.phoneNumber,
                            aadharNumber : seller.aadharNumber,
                            createdAt: seller.createdAt,
                            updatedAt: new Date(),
                            upgradCoins: parseInt(seller.upgradCoins) + parseInt(property.price)
                        };


                        // Convert the JSON object to a buffer and send it to blockchain for storage
                        let propObjectBuffer = Buffer.from(JSON.stringify(propObject));
                        await ctx.stub.putState(propertyRequestKey, propObjectBuffer); 


                        // Convert the JSON object of buyer to a buffer and send it to blockchain for storage
                        let buyerObjectBuffer = Buffer.from(JSON.stringify(buyerObject));
                        await ctx.stub.putState(buyerCompKey, buyerObjectBuffer); 


                        // Convert the JSON object of seller to a buffer and send it to blockchain for storage
                        let sellerObjectBuffer = Buffer.from(JSON.stringify(sellerObject));
                        await ctx.stub.putState(sellerCompKey, sellerObjectBuffer); 

                        return propertyRequestKey;

                    }  else {
                        throw new Error ("Buyer " + name + " doesn't have sufficient balance to buy this property");
                    }
                
                }else {
                    throw new Error ("Buyer " + name + " with aadhar : " + aadharNumber + " is not registered in network");
                }

            } else{
                    throw new Error ("Property " + propertyID + " is not for sale");
            }
 
        } else {
                 throw new Error ("Property "+ propertyID + " is not found for provided propertyID");   
        }   
    }
}   

module.exports = UserContract;