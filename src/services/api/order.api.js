import moment from 'moment-timezone';
class OrderApi {
    constructor() {
        this._url = 'http://142.93.115.206:3006/';
        this._site = '';
        this._user = '';
        this._password = '';
        this._token = '';
        this._siteId = '';
    }

    initialize(url, site, user, password, token, siteId) {
		if (!url.endsWith('/')) {
			url = url + '/';
		}
		this._url = url;
		this._site = site;
		this._user = user;
		this._password = password;
		this._token = token;
		this._siteId = siteId;
	}


    setToken(token) {
        this._token = token;
    }
    setSiteId(siteId) {
        this._siteId = siteId;
    }

    
    createReceipt(receipt) {
		console.log('==============================');
		console.log(JSON.stringify(receipt) + ' is being sent to the backend');
		console.log('==============================');
		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(this._remoteReceiptFromReceipt(receipt))
		};
		return new Promise((resolve, reject) => {
			fetch(this._url + 'sema/site/receipts', options)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createReceipt - Parse JSON: ' +
									error
								);
								reject();
							});
					} else if (response.status === 409) {
						// Indicates this receipt has already been added
						console.log('createReceipt - Receipt already exists');
						resolve({});
					} else {
						console.log(
							'createReceipt - Fetch status: ' + response.status
						);
						reject(response.status);
					}
				})
				.catch(error => {
					console.log('createReceipt - Fetch: ' + error);
					reject();
				});
		});
	}



	_remoteReceiptFromReceipt(receipt) {
		return receipt;
	}

	getReceipts(siteId) {
		let options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this._token
			}
		};

		let url = `sema/site/receipts/${siteId}?date=${moment
			.tz(new Date('2019-11-01'), moment.tz.guess())
			.format('YYYY-MM-DD')}`;
		console.log('Communications:getReceipts: ');
		console.log(
			moment.tz(new Date('2019-11-01'), moment.tz.guess()).format('YYYY-MM-DD')
		);
		return fetch(this._url + url, options)
			.then(async response => await response.json())
			.catch(error => {
				console.log('Communications:getReceipts: ' + error);
				throw error;
			});
	}

	getReceiptsBySiteIdAndDate(siteId, date) {
		date = date.toISOString();
		let options = {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				Authorization: 'Bearer ' + this._token
			}
		};

		let url = `sema/site/receipts/${siteId}?date=${date}`;
		console.log(url);

		return fetch(this._url + url, options)
			.then(async response => await response.json())
			.catch(error => {
				console.log('Communications:getReceipts: ' + error);
				throw error;
			});
	}

	// Sends the kiosk ID, the logged receipts and the list of IDs that the client already
	// has to the API
	sendLoggedReceipts(siteId, receipts, exceptionList) {
		let options = {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify({
				receipts,
				exceptionList
			})
		};

		let url = `sema/site/receipts/${siteId}?date=${moment
			.tz(new Date(Date.now()), moment.tz.guess())
			.format('YYYY-MM-DD')}`;
		console.log(this._url + url);
		return fetch(this._url + url, options)
			.then(response => response.json())
			.catch(error => {
				console.log('Communications:sendUpdatedReceipts: ' + error);
				throw error;
			});
	}




}

export default new OrderApi();