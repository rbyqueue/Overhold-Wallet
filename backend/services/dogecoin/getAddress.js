let bitcoin = require('bitcoinjs-lib');
let coininfo = require('coininfo');
let dataUtils = require('../../data/utils');
let templates = require('../../data/templates');
let errorMessages = require('../../data/messages').generalErrors;

function generateAddresses(num, seed, addressIndex, change) {
	if (!seed) {
		return new Error(errorMessages.invalidInput);
	}

	if (typeof (change) !== dataUtils.serviceStings.number) {
		return new Error(errorMessages.invalidInput);
	}

	if (!num || typeof (num) !== dataUtils.serviceStings.number) {
		return new Error(errorMessages.invalidNumberAddresses);
	}

	if (typeof (addressIndex) !== dataUtils.serviceStings.number) {
		return new Error(errorMessages.invalidAddressIndex);
	}
	
	let addresses = [];
	let pubAddresses = [];
  
	let addressObj = Object.assign({}, dataUtils.addressObj);
	addressObj.coinType = dataUtils.coinType.Dogecoin;
	addressObj.change = change;

	let dogecoin = coininfo.dogecoin.main.toBitcoinJS();
	dogecoin.messagePrefix = dataUtils.networkConfig.dogecoin.message;
	let root = bitcoin.HDNode.fromSeedHex(seed, dogecoin);
	let lastAddressIndex = addressIndex;
  
	let defaultPath = `m/${addressObj.purpose}'/${addressObj.coinType}'/${addressObj.account}'/${addressObj.change}/`;

	let path;
  
	for (let i = 0; i < num; i++) {
		path = defaultPath + (lastAddressIndex++);
		let node = root.derivePath(path);
  
		let address = node.getAddress();
		addresses.push({ 'address': address, 'WIF': node.keyPair.toWIF() });
      
		let addressBalance = Object.assign({}, templates.AddressBalance);
		addressBalance.address = address;
		pubAddresses.push(addressBalance);
	}
  
	return {
		addresses,
		pubAddresses,
		lastAddressIndex,
		derivationPath: path,
	};
}

module.exports = {
	generateAddresses
};