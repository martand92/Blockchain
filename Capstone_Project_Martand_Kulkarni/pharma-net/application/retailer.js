'use strict';

/**
 * This is a Node.JS application to work with retailer SC
 */

const helper = require('./contractHelper');

async function registerCompany(companyCRN, companyName, location) {
	try {
		const retailerContract = await helper.getContractInstance('retailer');

		// Register Retailer
		console.log('.....Registering Retailer');
		const companyBuffer = await retailerContract.submitTransaction('registerCompany', companyCRN, companyName, location, "retailer");

		// process response
		console.log('.....Processing Retailer registration Response\n\n');
		let retailerDetails = JSON.parse(companyBuffer.toString());
		console.log(retailerDetails);
		console.log('\n\n.....Registration of Retailer Complete!');
		return retailerDetails;

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
		const retailerContract = await helper.getContractInstance('retailer');

		// Create Purcahse order by Retailer
		console.log('.....Creating purchase order by Retailer');
		const poBuffer = await retailerContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		// process response
		console.log('.....Processing creating PO Retailer Response\n\n');
		let poDetails = JSON.parse(poBuffer.toString());
		console.log(poDetails);
		console.log('\n\n.....Creation of PO by Retailer Complete!');
		return poDetails;

	} catch (error) {
		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);
	} finally {
		// Disconnect from the fabric gateway
		helper.disconnect();
	}
}


async function retailDrug(drugName, serialNo, retailerCRN, customerAadhar) {

	try {
		const retailerContract = await helper.getContractInstance('retailer');

		// Sell drug to consumer
		console.log('.....Selling drug to Retailer');
		const drugBuffer = await retailerContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		// process response
		// console.log('.....Processing selling drug by Retailer Response\n\n');
		// let drugDetails = JSON.parse(drugBuffer.toString());
		// console.log(drugDetails);
		// console.log('\n\n.....Selling drug by Retailer Complete!');
		return drugBuffer.toString();

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
		const retailerContract = await helper.getContractInstance('retailer');

		// viewing history of Drug by Retailer
		console.log('.....Viewing drug history by Retailer');
		const historyBuffer = await retailerContract.submitTransaction('viewHistory', drugName, serialNo);

		// process response
		console.log('.....Viewing history of drug by Retailer Response\n\n');
		let drugHistoryDetails = JSON.parse(historyBuffer.toString());
		console.log(drugHistoryDetails);
		console.log('\n\n.....Viewing history of drug by Retailer Complete!');
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
		const retailerContract = await helper.getContractInstance('retailer');

		// viewing Drug current status by Retailer
		console.log('.....Viewing drug current state by Retailer');
		const drugCurrentStateBuffer = await retailerContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);
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
module.exports.createPO = createPO;
module.exports.retailDrug = retailDrug;
module.exports.viewHistory = viewHistory;
module.exports.viewDrugCurrentState = viewDrugCurrentState;
