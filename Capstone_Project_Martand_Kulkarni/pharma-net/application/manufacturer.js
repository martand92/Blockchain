'use strict';

/**
 * This is a Node.JS application to work with manufacturer SC
 */

const helper = require('./contractHelper');

async function registerCompany(companyCRN, companyName, location) {

	try {
		const manufacturerContract = await helper.getContractInstance('manufacturer');

		// Register Manufacturer
		console.log('.....Registering manufacturer');
		const companyBuffer = await manufacturerContract.submitTransaction('registerCompany', companyCRN, companyName, location, "manufacturer");

		// process response
		console.log('.....Processing Manufacturer registration Response\n\n');
		let manufacturerDetails = JSON.parse(companyBuffer.toString());
		console.log(manufacturerDetails);
		console.log('\n\n.....Registration of manufacturer Complete!');
		return manufacturerDetails;

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
		const manufacturerContract = await helper.getContractInstance('manufacturer');

		// Creating shipment for Manufacturer
		console.log('.....Creating shipment for manufacturer');
		const shipmentBuffer = await manufacturerContract.submitTransaction('createShipment', buyerCRN, drugName, listOfAssets, transporterCRN);

		// // process response
		// console.log('.....Processing Manufacturer createShipment Response\n\n');
		// let manufacturerShipmentDetails = JSON.parse(shipmentBuffer.toString());
		// console.log(manufacturerShipmentDetails);
		// console.log('\n\n.....Creating shipment of manufacturer Complete!');
		return shipmentBuffer.toString();

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}

async function addDrug(drugName, serialNo, mfgDate, expDate, companyCRN) {

	try {
		const manufacturerContract = await helper.getContractInstance('manufacturer');

		// Adding drug to network by Manufacturer
		console.log('.....Adding drug to network by manufacturer');
		const drugBuffer = await manufacturerContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

		// process response
		console.log('.....Processing Manufacturer\'s add drug Response\n\n');
		let manufacturerDrugDetails = JSON.parse(drugBuffer.toString());
		console.log(manufacturerDrugDetails);
		console.log('\n\n.....Processing Add Drug by manufacturer Complete!');
		return manufacturerDrugDetails;

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
		const manufacturerContract = await helper.getContractInstance('manufacturer');

		// viewing history of Drug by Manufacturer
		console.log('.....Viewing drug history by manufacturer');
		const historyBuffer = await manufacturerContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Viewing history of drug by Manufacturer Response\n\n');
		let drugHistoryDetails = JSON.parse(historyBuffer.toString());
		console.log(drugHistoryDetails);
		console.log('\n\n.....Viewing history of drug by manufacturer Complete!');
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
		const manufacturerContract = await helper.getContractInstance('manufacturer');

		// viewing Drug current status by Manufacturer
		console.log('.....Viewing drug current state by manufacturer');
		const drugCurrentStateBuffer = await manufacturerContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);
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
module.exports.createShipment = createShipment;
module.exports.addDrug = addDrug;
module.exports.viewHistory = viewHistory;
module.exports.viewDrugCurrentState = viewDrugCurrentState;
