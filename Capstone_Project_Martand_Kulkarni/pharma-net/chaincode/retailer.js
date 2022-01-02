'use strict';

const {Contract} = require('fabric-contract-api');

class RetailerContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.retailer');
    }

    /* ****** All custom functions are defined below ***** */
    
    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Retailer Pharma Smart Contract Instantiated');
    }

    /**
     * To register new Retailer on the ledger based on the request received
     * @param ctx - The transaction context object
     * @param companyCRN - Company Registration Number of this new Retailer
     * @param companyName - Name of the Retailer
     * @param location - location of this new Retailer
     * @param organisationRole - Retailer as Role
     * @returns {newRetailerObject}  
     */
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
        // Create a composite key for given Retailer
        const companyCRNKey = ctx.stub.createCompositeKey('org.pharma-network.retailer', [companyCRN]);

        if(organisationRole != "retailer"){
            throw new Error("Only Retailer as Role is accepted");
        }

        // Fetch retailer with companyID composite key from blockchain
        let companyIDBuffer = await ctx.stub
            .getState(companyCRNKey)
            .catch(err => console.log(err));


        //Check if retailer is already registered in network
        if (!companyIDBuffer.toString().includes(companyCRN + '-' + companyName)) {

            // Create a retailer object to be stored in blockchain
            let newRetailerObject = {
                companyID: ctx.stub.createCompositeKey('org.pharma-network.retailer', [companyCRN + '-' + companyName]),
                name: companyName,
                location: location,
                organisationRole: organisationRole,
                hierarchyKey: 3
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newRetailerObject));
            await ctx.stub.putState(companyCRNKey, dataBuffer);

            // Return value of newly created retailer
            return JSON.stringify(newRetailerObject).replace(/\\/g, '');

        } else {
            throw new Error('Retailer is already  registered with name : ' + companyName + ' and CRN number : ' + companyCRN + ' in network');
        }

    }



    /**
     * To create purchase order to buy drugs by retailer from distributor
     * @param ctx - The transaction context object
     * @param buyerCRN - Retailer's Company Registration Number
     * @param sellerCRN - Distributor's  Company Registration Number
     * @param drugName - Name of the drug
     * @param quantity - Quantity of drug
     * @returns {newPOObject}  
     */
    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
        // Create a composite key for given Distributor's PO
        const poID = ctx.stub.createCompositeKey('org.pharma-network.retailer', [buyerCRN + '-' + drugName]);

        // Fetch buyer object 
        let buyerObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.retailer', [buyerCRN]))
            .catch(err => console.log(err));

        if(buyerObj.length == 0){
            throw new Error ("Buyer not found");
        }

        // Fetch seller object
        let sellerObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.distributor', [sellerCRN]))
            .catch(err => console.log(err));

        if(sellerObj.length == 0){
            throw new Error ("Seller not found");
        }

        //Check if hirarcy is valid 
        if (JSON.parse(buyerObj.toString()).hierarchyKey - JSON.parse(sellerObj.toString()).hierarchyKey == 1) {

            // Create a Purchase order object to be stored in blockchain
            let newPOObject = {
                poID: poID,
                drugName: drugName,
                quantity: quantity,
                buyer: ctx.stub.createCompositeKey('org.pharma-network.retailer', [buyerCRN]),
                seller: ctx.stub.createCompositeKey('org.pharma-network.distributor', [sellerCRN])
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newPOObject));
            await ctx.stub.putState(poID, dataBuffer);

            // Return value of newly created purchase order object
            return JSON.stringify(newPOObject).replace(/\\/g, '');

        } else {
            throw new Error('Hirarchical validation failed');
        }
    }




    /**
     * To sell drug to consumer
     * @param ctx - The transaction context object
     * @param drugName - Name of the drug to be sold to consumer
     * @param serialNo - Serial number of the drug
     * @param retailerCRN - Retailer Company Registration Number 
     * @param customerAadhar - Customer Aadhar number
     * @returns {newDrugObject}  
     */
    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {
        // Create a composite key for given Drug
        const productID = ctx.stub.createCompositeKey('org.pharma-network.drug', [drugName + '-' + serialNo]);

        // Fetch Drug with productID composite key from blockchain
        let drugObj = await ctx.stub
           .getState(productID)
           .catch(err => console.log(err));
        

        //Check if drug is already registered in network
        if(!drugObj.length == 0){
            let drugJsonObj = JSON.parse(drugObj.toString());
            //Check if owner of the drug is Retailer 
            if(drugJsonObj.owner == retailerCRN){

             // Update found drug object present in network
             let newDrugObject = {
                productID: drugJsonObj.productID,
                name: drugJsonObj.drugName,
                manufacturer : drugJsonObj.manufacturer ,
                manufacturingDate : drugJsonObj.manufacturingDate,
                expiryDate : drugJsonObj.expiryDate,
                owner: customerAadhar,
                shipment: drugJsonObj.shipment
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newDrugObject));
            await ctx.stub.putState(productID, dataBuffer);

            // Return value of updated drug
            return JSON.stringify(newDrugObject).replace(/\\/g, '');
         }else
             throw new Error('Provided Retailer is not the owner of the Drug ');

        } else
            throw new Error('Drug is not found in the network');

    }
    

    /**
     * To view Histroy of drug
     * @param ctx - The transaction context object
     * @param drugName - name of the Drug
     * @param serialNo -  Serial number of the drug
     * 
     */
    async viewHistory(ctx, drugName, serialNo) {

        // Create a composite key to fetch drug object
        const drugObjKey = ctx.stub.createCompositeKey('org.pharma-network.drug', [drugName + '-' + serialNo]);

        let iterator = await ctx.stub.getHistoryForKey(drugObjKey);
        let result = [];
        let res = await iterator.next();
        while (true) {
            if (res.value) 
                result.push(res.value.value.toString('utf8').replace(/\\/g, ''));
            else
                break;

            res = await iterator.next();
        }
        await iterator.close();
        return result;
    }

    
    /**
	 * To view drug current state 
	 * @param ctx - The transaction context object
	 * @param drugName - name of the Drug
     * @param serialNo -  Serial number of the drug
     * @returns {drugObj}
	 */
	async viewDrugCurrentState(ctx, drugName, serialNo) {

        // Create a composite key to fetch drug object
        const drugObjKey = ctx.stub.createCompositeKey('org.pharma-network.drug', [drugName + '-' + serialNo]);
        
        // Fetch drug details from network
		let drugObj = await ctx.stub
        .getState(drugObjKey)
        .catch(err => console.log(err));

        if(drugObj.toString().includes(drugName))
            return drugObj.toString().replace(/\\/g, '');
        else
            throw new Error ("Drug is not present in network");
    }

}

module.exports = RetailerContract;
