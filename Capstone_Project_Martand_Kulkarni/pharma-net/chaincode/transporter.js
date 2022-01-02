'use strict';

const { Contract } = require('fabric-contract-api');

class TransporterContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.transporter');
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Transporter Pharma Smart Contract Instantiated');
    }

    /**
     * To register new Transporter on the ledger based on the request received
     * @param ctx - The transaction context object
     * @param companyCRN - Company Registration Number of this new Transporter
     * @param companyName - Name of the Transporter
     * @param location - location of this new Transporter
     * @param organisationRole - Transporter as Role
     * @returns {newTransporterObject}  
     */
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
        // Create a composite key for given Transporter
        const companyCRNKey = ctx.stub.createCompositeKey('org.pharma-network.transporter', [companyCRN]);

        if (organisationRole != "transporter") {
            throw new Error("Only Transporter as Role is accepted");
        }


        // Fetch transporter with companyID composite key from blockchain
        let companyIDBuffer = await ctx.stub
            .getState(companyCRNKey)
            .catch(err => console.log(err));


        //Check if transporter is already registered in network
        if (!companyIDBuffer.toString().includes(companyCRN + '-' + companyName)) {

            // Create a transporter object to be stored in blockchain
            let newTransporterObject = {
                companyID: ctx.stub.createCompositeKey('org.pharma-network.transporter', [companyCRN + '-' + companyName]),
                name: companyName,
                location: location,
                organisationRole: organisationRole
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newTransporterObject));
            await ctx.stub.putState(companyCRNKey, dataBuffer);

            // Return value of newly created newTransporterObject
            return JSON.stringify(newTransporterObject).replace(/\\/g, '');

        } else {
            throw new Error('Transporter is already  registered with name : ' + companyName + ' and CRN number : ' + companyCRN + ' in network');
        }

    }


    /**
     * To update the status of the shipment to ‘Delivered’ when the consignment gets delivered to the destination
     * @param ctx - The transaction context object
     * @param buyerCRN - Buyer's Company Registration Number
     * @param drugName - Name of the drug
     * @param transporterCRN - Transporter's Company Registration Number
     * @returns {newShipmentObj}  
     */
    async updateShipment(ctx, buyerCRN, drugName, transporterCRN) {
        // Create a composite key of Shipment object to be updated
        const shipmentID = ctx.stub.createCompositeKey('org.pharma-network.shipment', [buyerCRN + '-' + drugName]);

        let item;
        let updatedDrugObject;
        let itemJsonObj;
        let newShipmentObject;
        let buyerObj;
        let asset = [];

        //Check if buyer is in network
        buyerObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.distributor', [buyerCRN]))
            .catch(err => console.log(err));
        if (buyerObj.length == 0) {
            buyerObj = await ctx.stub
                .getState(ctx.stub.createCompositeKey('org.pharma-network.retailer', [buyerCRN]))
                .catch(err => console.log(err));
        }

        if (buyerObj.length == 0)
            throw new Error("Buyer not found for given CRN : " + buyerCRN);


        //Check if transporter is in network
        let transporterObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.transporter', [transporterCRN]))
            .catch(err => console.log(err));

        if (transporterObj.length == 0)
            throw new Error("Transporter not found for given CRN : " + transporterCRN);

        // Fetch shipmentObject from network 
        let shipmentObj = await ctx.stub
            .getState(shipmentID)
            .catch(err => console.log(err));
        

        //Check if shipmentObject is in network 
        if (!shipmentObj.length == 0) {
            let shipmentJsonObj = JSON.parse(shipmentObj.toString());
            
            // update Shipment Obj
            newShipmentObject = {
                shipmentID: shipmentJsonObj.shipmentID,
                creator: shipmentJsonObj.creator,
                assets: shipmentJsonObj.assets,
                transporter: transporterCRN,
                status: 'delivered'
            };
            
            let arr = JSON.parse(shipmentJsonObj.assets);

            for (let i = 0; i < arr.length ; i++) {
                item = await ctx.stub
                    .getState(ctx.stub.createCompositeKey('org.pharma-network.drug', [arr[i]]))
                    .catch(err => console.log(err));

                if (item.length == 0)
                    throw new Error("Asset : " + arr[i] + " not found");
                else {
                    itemJsonObj = JSON.parse(item.toString());
                    updatedDrugObject = {
                        productID: itemJsonObj.productID,
                        name: itemJsonObj.name,
                        manufacturer: itemJsonObj.manufacturer,
                        manufacturingDate: itemJsonObj.manufacturingDate,
                        expiryDate: itemJsonObj.expiryDate,
                        owner: buyerCRN,
                        shipment: itemJsonObj.shipment
                    };

                    updatedDrugObject['shipment'].push(JSON.stringify(newShipmentObject));
                   asset.push(JSON.stringify(updatedDrugObject).replace(/\\/g, ''));
                    // Convert the JSON object to a buffer and send it to blockchain for storage
                    let dataBuffer = Buffer.from(JSON.stringify(updatedDrugObject));

                    //await ctx.stub.putState(asset, dataBuffer);
                    await ctx.stub.putState(ctx.stub.createCompositeKey('org.pharma-network.drug', [arr[i]]), dataBuffer);
                }
            }


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newShipmentObject));
            await ctx.stub.putState(shipmentID, dataBuffer);

            // Return value of newly created purchase order object
            return asset;

        } else
            throw new Error('Shipment details was not found for provided buyerCRN : ' + buyerCRN + ' and drugName : ' + drugName + ' in network');
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

        if (drugObj.toString().includes(drugName))
            return drugObj.toString().replace(/\\/g, '');
        else
            throw new Error("Drug is not present in network");
    }

}

module.exports = TransporterContract;
