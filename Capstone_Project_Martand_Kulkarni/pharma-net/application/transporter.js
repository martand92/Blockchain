'use strict';

/**
 * This is a Node.JS application to work with transporter SC
 */

const helper = require('./contractHelper');

async function registerCompany(companyCRN, companyName, location) {
	try {
		const transporterContract = await helper.getContractInstance('transporter');

		// Register transporter
		console.log('.....Registering Transporter');
		const companyBuffer = await transporterContract.submitTransaction('registerCompany', companyCRN, companyName, location, "transporter");

		// process response
		console.log('.....Processing Transporter registration Response\n\n');
		let transporterDetails = JSON.parse(companyBuffer.toString());
		console.log(transporterDetails);
		console.log('\n\n.....Registration of Transporter Complete!');
		return transporterDetails;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}


async function updateShipment(buyerCRN, drugName, transporterCRN) {

	try {
		const transporterContract = await helper.getContractInstance('transporter');

		// Updating shipment by transporter
		console.log('.....Updating shipment by transporter');
		const shipmentBuffer = await transporterContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

		// process response
		console.log('.....Processing updating shipment by transporter Response\n\n');
		let shipmentDetails = JSON.parse(shipmentBuffer.toString());
		console.log(shipmentDetails);
		console.log('\n\n.....Updating shipment by transporter Complete!');
		return shipmentDetails;

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
		const transporterContract = await helper.getContractInstance('transporter');

		// viewing history of Drug by transporter
		console.log('.....Viewing drug history by transporter');
		const historyBuffer = await transporterContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Viewing history of drug by transporter Response\n\n');
		let drugHistoryDetails = JSON.parse(historyBuffer.toString());
		console.log(drugHistoryDetails);
		console.log('\n\n.....Viewing history of drug by transporter Complete!');
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
		const transporterContract = await helper.getContractInstance('transporter');

		// viewing Drug current status by transporter
		console.log('.....Viewing drug current state by transporter');
		const drugCurrentStateBuffer = await transporterContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);
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
module.exports.updateShipment = updateShipment;
module.exports.viewHistory = viewHistory;
module.exports.viewDrugCurrentState = viewDrugCurrentState;
