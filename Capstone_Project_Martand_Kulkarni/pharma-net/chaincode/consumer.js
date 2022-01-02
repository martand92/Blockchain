'use strict';

const {Contract} = require('fabric-contract-api');

class ConsumerContract extends Contract {

    constructor() {
        // Provide a custom name to refer to this smart contract
        super('org.pharma-network.consumer');
    }

    /* ****** All custom functions are defined below ***** */
    
    // This is a basic user defined function used at the time of instantiating the smart contract
    // to print the success message on console
    async instantiate(ctx) {
        console.log('Consumer Pharma Smart Contract Instantiated');
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

module.exports = ConsumerContract;
