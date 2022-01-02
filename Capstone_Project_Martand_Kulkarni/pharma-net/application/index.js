const express = require('express');
const app = express();
const cors = require('cors');
const port = 3000;

// Import all function modules
const addToWallet = require('./1_addToWallet');
const consumer = require('./consumer');
const manufacturer = require('./manufacturer');
const distributor = require('./distributor');
const retailer = require('./retailer');
const transporter = require('./transporter');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('hello world'));

app.post('/addToWallet', (req, res) => {
	addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath, req.body.org)
			.then(() => {
				console.log('identity to wallet');
				const result = {
					status: 'success',
					message: 'Identity added to wallet'
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


//Consumer
app.get('/viewHistoryByConsumer', (req, res) => {
	consumer.viewHistory(req.body.drugName, req.body.serialNo)
			.then((result) => {
				console.log('History viewed');
				const result1 = {
					status: 'success',
					message: 'History viewed',
					result: result
				};
				res.json(result1);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewDrugCurrentStateByConsumer', (req, res) => {
	consumer.viewDrugCurrentState(req.body.drugName, req.body.serialNo)
			.then((drugObj) => {
				console.log('Drug current Object viewed');
				const result = {
					status: 'success',
					message: 'Drug current Object viewed',
					result: drugObj
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


//Manufacturer
app.post('/registerManufacturer', (req, res) => {
	manufacturer.registerCompany(req.body.companyCRN, req.body.companyName, req.body.location)
			.then((manufacturerDetails) => {
				console.log('Manufactuerer registered');
				const result = {
					status: 'success',
					message: 'manufacturer registered',
					result: manufacturerDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/createShipmentByManufacturer', (req, res) => {
	manufacturer.createShipment(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN)
			.then((shipmentDetails) => {
				console.log('Shipment created');
				const result = {
					status: 'success',
					message: 'shipment created',
					result: shipmentDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/addDrugByManufacturer', (req, res) => {
	manufacturer.addDrug(req.body.drugName, req.body.serialNo, req.body.mfgDate, req.body.expDate, req.body.companyCRN)
			.then((drugDetails) => {
				console.log('Drug created');
				const result = {
					status: 'success',
					message: 'drug created',
					result: drugDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.get('/viewHistoryByManufacturer', (req, res) => {
	manufacturer.viewHistory(req.body.drugName, req.body.serialNo)
			.then((result) => {
				console.log('History viewed');
				const result1 = {
					status: 'success',
					message: 'History viewed',
					result: result
				};
				res.json(result1);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewDrugCurrentStateByManufacturer', (req, res) => {
	manufacturer.viewDrugCurrentState(req.body.drugName, req.body.serialNo)
			.then((drugObj) => {
				console.log('Drug current Object viewed');
				const result = {
					status: 'success',
					message: 'Drug current Object viewed',
					result: drugObj
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


//Distributor
app.post('/registerDistributor', (req, res) => {
	distributor.registerCompany(req.body.companyCRN, req.body.companyName, req.body.location)
			.then((distributorDetails) => {
				console.log('Distributor registered');
				const result = {
					status: 'success',
					message: 'distributor registered',
					result: distributorDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.post('/createPOByDistributor', (req, res) => {
	distributor.createPO(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity)
			.then((poDetails) => {
				console.log('PO creared by Distributor');
				const result = {
					status: 'success',
					message: 'PO created by Distributor',
					result: poDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.post('/createShipmentByDistributor', (req, res) => {
	distributor.createShipment(req.body.buyerCRN, req.body.drugName, req.body.listOfAssets, req.body.transporterCRN)
			.then((shipmentDetails) => {
				console.log('Shipment created');
				const result = {
					status: 'success',
					message: 'shipment created',
					result: shipmentDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewHistoryByDistributor', (req, res) => {
	distributor.viewHistory(req.body.drugName, req.body.serialNo)
			.then((result) => {
				console.log('History viewed');
				const result1 = {
					status: 'success',
					message: 'History viewed',
					result: result
				};
				res.json(result1);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewDrugCurrentStateByDistributor', (req, res) => {
	distributor.viewDrugCurrentState(req.body.drugName, req.body.serialNo)
			.then((drugObj) => {
				console.log('Drug current Object viewed');
				const result = {
					status: 'success',
					message: 'Drug current Object viewed',
					result: drugObj
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


//Transporter
app.post('/registerTransporter', (req, res) => {
	transporter.registerCompany(req.body.companyCRN, req.body.companyName, req.body.location)
			.then((transporterDetails) => {
				console.log('Transporter registered');
				const result = {
					status: 'success',
					message: 'transporter registered',
					result: transporterDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.post('/updateShipmentByTransporter', (req, res) => {
	transporter.updateShipment(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN)
			.then((shipmentDetails) => {
				console.log('Shipment Details updated');
				const result = {
					status: 'success',
					message: 'Shipment details updated',
					result: shipmentDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});

app.get('/viewHistoryByTransporter', (req, res) => {
	transporter.viewHistory(req.body.drugName, req.body.serialNo)
			.then((result) => {
				console.log('History viewed');
				const result1 = {
					status: 'success',
					message: 'History viewed',
					result: result
				};
				res.json(result1);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewDrugCurrentStateByTransporter', (req, res) => {
	transporter.viewDrugCurrentState(req.body.drugName, req.body.serialNo)
			.then((drugObj) => {
				console.log('Drug current Object viewed');
				const result = {
					status: 'success',
					message: 'Drug current Object viewed',
					result: drugObj
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


//Retailer
app.post('/registerRetailer', (req, res) => {
	retailer.registerCompany(req.body.companyCRN, req.body.companyName, req.body.location)
			.then((retailerDetails) => {
				console.log('Retailer registered');
				const result = {
					status: 'success',
					message: 'Retailer registered',
					result: retailerDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.post('/createPOByRetailer', (req, res) => {
	retailer.createPO(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity)
			.then((poDetails) => {
				console.log('PO creared by Retailer');
				const result = {
					status: 'success',
					message: 'PO created by Retailer',
					result: poDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.post('/retailDrugByRetailer', (req, res) => {
	retailer.retailDrug(req.body.drugName, req.body.serialNo, req.body.retailerCRN, req.body.customerAadhar)
			.then((drugDetails) => {
				console.log('Selling drug by Retailer');
				const result = {
					status: 'success',
					message: 'Selling drug by Retailer',
					result: drugDetails
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewHistoryByRetailer', (req, res) => {
	retailer.viewHistory(req.body.drugName, req.body.serialNo)
			.then((result) => {
				console.log('History viewed');
				const result1 = {
					status: 'success',
					message: 'History viewed',
					result: result
				};
				res.json(result1);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});


app.get('/viewDrugCurrentStateByRetailer', (req, res) => {
	retailer.viewDrugCurrentState(req.body.drugName, req.body.serialNo)
			.then((drugObj) => {
				console.log('Drug current Object viewed');
				const result = {
					status: 'success',
					message: 'Drug current Object viewed',
					result: drugObj
				};
				res.json(result);
			})
			.catch((e) => {
				const result = {
					status: 'error',
					message: 'Failed',
					error: e
				};
				res.status(500).send(result);
			});
});



app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));