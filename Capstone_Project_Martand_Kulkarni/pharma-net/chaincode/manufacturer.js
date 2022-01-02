'use strict';

const { Contract } = require('fabric-contract-api');

class ManufacturerContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.manufacturer');
    }

    /* ****** All custom functions are defined below ***** */

    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Manufacturer Smart Contract Instantiated');
    }


    /**
     * To register new Manufacturer on the ledger based on the request received
     * @param ctx - The transaction context object
     * @param companyCRN - Company Registration Number of this new Manufacturer
     * @param companyName - Name of the Manufacturer
     * @param location - location of this new Manufacturer
     * @param organisationRole - Manufacturer as Role
     * @returns {newManufacturerObject}  
     */
    async registerCompany(ctx, companyCRN, companyName, location, organisationRole) {
        // Create a composite key for given Manufacturer
        const companyCRNKey = ctx.stub.createCompositeKey('org.pharma-network.manufacturer', [companyCRN]);

        if (organisationRole != "manufacturer") {
            throw new Error("Only Manufacturer as Role is accepted");
        }

        // Fetch manufacturer with companyID composite key from blockchain
        let companyIDBuffer = await ctx.stub
            .getState(companyCRNKey)
            .catch(err => console.log(err));


        //Check if manufacturer is already registered in network
        if (!companyIDBuffer.toString().includes(companyCRN + '-' + companyName)) {

            // Create a Manufacturer object to be stored in blockchain
            let newManufacturerObject = {
                companyID: ctx.stub.createCompositeKey('org.pharma-network.manufacturer', [companyCRN + '-' + companyName]),
                name: companyName,
                location: location,
                organisationRole: organisationRole,
                hierarchyKey: 1
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newManufacturerObject));
            await ctx.stub.putState(companyCRNKey, dataBuffer);

            // Return value of newly created manufacturer
            return JSON.stringify(newManufacturerObject).replace(/\\/g, '');

        } else {
            throw new Error("Manufacturer is already  registered with name : " + companyName + " and CRN number : " + companyCRN + " in network ");
        }

    }


    /**
     * To create shipment order to ship drugs from manufacturer to distributor via transporter
     * @param ctx - The transaction context object
     * @param buyerCRN - Distributor's Company Registration Number
     * @param drugName - Name of the drug
     * @param listOfAssets - list of composite keys of all the drugs to be transported from manufacturer to distributor
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
            .getState(ctx.stub.createCompositeKey('org.pharma-network.distributor', [buyerCRN + '-' + drugName]))
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
     * To register new Drug on the ledger based on the request received
     * @param ctx - The transaction context object
     * @param drugName - Name of the drug
     * @param serialNo - Serial Number of the drug
     * @param mfgDate - Manufacture date of drug
     * @param expDate - Expiration date of drug
     * @param companyCRN - Company CRN number that is registering this drug
     * @returns {newDrugObject}  
     */
    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {
        // Create a composite key for given drug
        const productID = ctx.stub.createCompositeKey('org.pharma-network.drug', [drugName + '-' + serialNo]); // Could be made more unique
        const companyID = ctx.stub.createCompositeKey('org.pharma-network.manufacturer', [companyCRN]);

        //Check if company is already registered
        let companyIDBuffer = await ctx.stub
            .getState(companyID)
            .catch(err => console.log(err));
        if (companyIDBuffer.length == 0)
            throw new Error("Company is not registered");


        // Fetch Drug with productID composite key from blockchain
        let productIDBuffer = await ctx.stub
            .getState(productID)
            .catch(err => console.log(err));


        //Check if drug is already registered in network
        if (!productIDBuffer.toString().includes(drugName + '-' + serialNo)) {

            // Create a drug object to be stored in blockchain
            let newDrugObject = {
                productID: productID,
                name: drugName,
                manufacturer: companyID,
                manufacturingDate: mfgDate,
                expiryDate: expDate,
                owner: "manufacturer",
                shipment: []
            };


            // Convert the JSON object to a buffer and send it to blockchain for storage
            let dataBuffer = Buffer.from(JSON.stringify(newDrugObject));
            await ctx.stub.putState(productID, dataBuffer);

            // Return value of newly created drug
            return JSON.stringify(newDrugObject).replace(/\\/g, '');

        } else
            throw new Error("Drug is already  registered with name : " + drugName + " and Serial number : " + serialNo + "in network ");

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

module.exports = ManufacturerContract;