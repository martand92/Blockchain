'use strict';

const { Contract } = require('fabric-contract-api');

class DistributorContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        //super('org.property-registration-network.userregnet');
        super('org.pharma-network.distributor');
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Distributor Pharma Smart Contract Instantiated');
    }


    /**
     * To register new Distributor on the ledger based on the request received
     * @param ctx - The transaction context object
     * @param companyCRN - Company Registration Number of this new Distributor
     * @param companyName - Name of the Distributor
     * @param location - location of this new Distributor
     * @param organisationRole - Distributor as Role
     * @returns {newDistributorObject}  
     */
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
        // Create a composite key for given Distributor
        const companyCRNKey = ctx.stub.createCompositeKey('org.pharma-network.distributor', [companyCRN]);

        if (organisationRole != "distributor") {
            throw new Error("Only Distributor as Role is accepted");
        }

        // Fetch distributor with companyID composite key from blockchain
        let companyIDBuffer = await ctx.stub
            .getState(companyCRNKey)
            .catch(err => console.log(err));


        //Check if distributor is already registered in network
        if (!companyIDBuffer.toString().includes(companyCRN + '-' + companyName)) {

            // Create a Distributor object to be stored in blockchain
            let newDistributorObject = {
                companyID: ctx.stub.createCompositeKey('org.pharma-network.distributor', [companyCRN + '-' + companyName]),
                name: companyName,
                location: location,
                organisationRole: organisationRole,
                hierarchyKey: 2
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newDistributorObject));
            await ctx.stub.putState(companyCRNKey, dataBuffer);

            // Return value of newly created distributor
            return JSON.stringify(newDistributorObject).replace(/\\/g, '');

        } else {
            throw new Error('Distributor is already  registered with name : ' + companyName + ' and CRN number : ' + companyCRN + ' in network');
        }

    }


    /**
     * To create purchase order to buy drugs by distributor from Manufacturer
     * @param ctx - The transaction context object
     * @param buyerCRN - Distributor's Company Registration Number
     * @param sellerCRN - Manufacturer's  Company Registration Number
     * @param drugName - Name of the drug
     * @param quantity - Quantity of drug
     * @returns {newPOObject}  
     */
    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
        // Create a composite key for given Distributor's PO
        const poID = ctx.stub.createCompositeKey('org.pharma-network.distributor', [buyerCRN + '-' + drugName]);


        // Fetch buyer object 
        let buyerObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.distributor', [buyerCRN]))
            .catch(err => console.log(err));

        if (buyerObj.length == 0) {
            throw new Error("Buyer not found");
        }

        // Fetch seller object
        let sellerObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.manufacturer', [sellerCRN]))
            .catch(err => console.log(err));

        if (sellerObj.length == 0) {
            throw new Error("Seller not found");
        }

        //Check if hirarcy is valid 
        if (JSON.parse(buyerObj.toString()).hierarchyKey - JSON.parse(sellerObj.toString()).hierarchyKey == 1) {

            // Create a Purchase order object to be stored in blockchain
            let newPOObject = {
                poID: poID,
                drugName: drugName,
                quantity: quantity,
                buyer: ctx.stub.createCompositeKey('org.pharma-network.distributor', [buyerCRN]),
                seller: ctx.stub.createCompositeKey('org.pharma-network.manufacturer', [sellerCRN])
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
     * To create shipment order to ship drugs from distributor to retailer via transporter
     * @param ctx - The transaction context object
     * @param buyerCRN - Retailer's Company Registration Number
     * @param drugName - Name of the drug
     * @param listOfAssets - list of drugs to be transported from distributor to retailer
     * @param transporterCRN - Transporter Company Registration Number
     * @returns {newShipmentObject}  
     */
    async createShipment(ctx, buyerCRN, drugName, listOfAssets, transporterCRN) {
        // Create a composite key of Shipment object
        const shipmentID = ctx.stub.createCompositeKey('org.pharma-network.shipment', [buyerCRN + '-' + drugName]);
        let item;
        let updatedDrugObject;
        let itemJsonObj;
        let newShipmentObject;
        let arr = JSON.parse(listOfAssets);

        // buyer's PO Obj  
        let buyerPOObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.retailer', [buyerCRN + '-' + drugName]))
            .catch(err => console.log(err));

        if (buyerPOObj.length == 0)
            throw new Error("PO Object with buyerCRN = " + buyerCRN + " and drug name = " + drugName + " not found");

        // transporter's Obj 
        let transporterObj = await ctx.stub
            .getState(ctx.stub.createCompositeKey('org.pharma-network.transporter', [transporterCRN]))
            .catch(err => console.log(err));

        if (transporterObj.length == 0)
            throw new Error("Transporter not found for given CRN : " + transporterCRN);

        //Check if buyer's PO quantity = list of Assets size
        if (Number(JSON.parse(buyerPOObj.toString()).quantity) == arr.length) {
            // Create a Shipment object to be stored in blockchain
            newShipmentObject = {
                shipmentID: shipmentID,
                creator: JSON.parse(buyerPOObj.toString()).seller,
                assets: listOfAssets,
                transporter: ctx.stub.createCompositeKey('org.pharma-network.transporter', [JSON.parse(transporterObj.toString()).name + '-' + transporterCRN]),
                status: 'in-transit'
            };

            for (let i = 0; i < arr.length; i++) {
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
                        owner: 'transporter',
                        shipment: itemJsonObj.shipment
                    };

                    updatedDrugObject['shipment'].push(JSON.stringify(newShipmentObject));

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
            return JSON.stringify(newShipmentObject).replace(/\\/g, '');

        } else
            throw new Error("list of assets doesn't match with quantity specified in PO");
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

module.exports = DistributorContract;