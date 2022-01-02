'use strict';

const manufacturercontract = require('./manufacturer.js');
const transportercontract = require('./transporter.js');
const distributorcontract = require('./distributor.js');
const consumercontract = require('./consumer.js');
const retailercontract = require('./retailer.js');
module.exports.contracts = [manufacturercontract, transportercontract, distributorcontract, consumercontract, retailercontract];
