'use strict';

/**
 * This is a Node.JS application to view history and current status of drug in the network as consumer.
 */

const helper = require('./contractHelper');

async function viewHistory(drugName, serialNo) {

	try {

		//const consumerContract = await getContractInstance();
		const consumerContract = await helper.getContractInstance('consumer');

		// view history
		console.log('.....viewing history');
		const consumerViewHistoryBuffer = await consumerContract.submitTransaction('viewHistory', drugName, serialNo);
		
		// process response
		 console.log('.....Viewing History Transaction Response \n\n');
		let drugHistory = JSON.parse(consumerViewHistoryBuffer.toString());
		console.log(drugHistory);
		console.log('\n\n.....View History Transaction Complete!');
		return drugHistory;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		console.log('.....Disconnecting from Fabric Gateway1');
		//gateway.disconnect();
		helper.disconnect();
	}
}


async function viewDrugCurrentState(drugName, serialNo) {

	try {

		const consumerContract = await helper.getContractInstance('consumer');

		// view history
		console.log('.....viewing drug current state');
		const consumerViewDrugCurrentState = await consumerContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);
		return consumerViewDrugCurrentState.toString();

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		// Disconnect from the fabric gateway
		console.log('.....Disconnecting from Fabric Gateway');
		//gateway.disconnect();
		helper.disconnect();
	}
}


module.exports.viewHistory = viewHistory;
module.exports.viewDrugCurrentState = viewDrugCurrentState;
