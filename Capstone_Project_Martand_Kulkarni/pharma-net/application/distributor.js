'use strict';

/**
 * This is a Node.JS application to work with distributor SC
 */

const helper = require('./contractHelper');

async function registerCompany(companyCRN, companyName, location) {

	try {
		const distributorContract = await helper.getContractInstance('distributor');

		// Register Distributor
		console.log('.....Registering Distributor');
		const companyBuffer = await distributorContract.submitTransaction('registerCompany', companyCRN, companyName, location, "distributor");

		// process response
		console.log('.....Processing Distributor registration Response\n\n');
		let distributorDetails = JSON.parse(companyBuffer.toString());
		console.log(distributorDetails);
		console.log('\n\n.....Registration of distributor Complete!');
		return distributorDetails;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

async function createPO(buyerCRN, sellerCRN, drugName, quantity) {

	try {
		const distributorContract = await helper.getContractInstance('distributor');

		// Create Purcahse order by Distributor
		console.log('.....Creating purchase order by Distributor');
		const poBuffer = await distributorContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing creating PO Distributor Response\n\n');
		let poDetails = JSON.parse(poBuffer.toString());
		console.log(poDetails);
		console.log('\n\n.....Creation of PO by distributor Complete!');
		return poDetails;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}


async function createShipment(buyerCRN, drugName, listOfAssets, transporterCRN) {

	try {
		const distributorContract = await helper.getContractInstance('distributor');

		// Creating shipment for Distributor
		console.log('.....Creating shipment for distributor');
		const shipmentBuffer = await distributorContract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets, transporterCRN);

		// // process response
		// console.log('.....Processing Distributor createShipment Response\n\n');
		// let distributorShipmentDetails = JSON.parse(shipmentBuffer.toString());
		// console.log(distributorShipmentDetails);
		// console.log('\n\n.....Creating shipment of Distributor Complete!');
		return shipmentBuffer.toString();

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}


async function viewHistory(drugName, serialNo) {

	try {
		const distributorContract = await helper.getContractInstance('distributor');

		// viewing history of Drug by Distributor
		console.log('.....Viewing drug history by Distributor');
		const historyBuffer = await distributorContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Viewing history of drug by Distributor Response\n\n');
		let drugHistoryDetails = JSON.parse(historyBuffer.toString());
		console.log(drugHistoryDetails);
		console.log('\n\n.....Viewing history of drug by Distributor Complete!');
		return drugHistoryDetails;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}


async function viewDrugCurrentState(drugName, serialNo) {

	try {
		const distributorContract = await helper.getContractInstance('distributor');

		// viewing Drug current status by Distributor
		console.log('.....Viewing drug current state by distributor');
		const drugCurrentStateBuffer = await distributorContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);
		return drugCurrentStateBuffer.toString();

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}




module.exports.registerCompany = registerCompany;
module.exports.viewHistory = viewHistory;
module.exports.viewDrugCurrentState = viewDrugCurrentState;
module.exports.createPO = createPO;
module.exports.createShipment = createShipment;