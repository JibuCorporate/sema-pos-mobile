class InventoryService {
	constructor() {
		this._url = 'http://142.93.115.206:3006/';
		this._site = '';
		this._user = '';
		this._password = '';
		this._token = '';
		this._siteId = '';
	}

	initialize(url, site, user, password) {
		if (!url.endsWith('/')) {
			url = url + '/';
		}
		this._url = url;
		this._site = site;
		this._user = user;
		this._password = password;
		this._token = 'not set';
	}

	setToken(token) {
		this._token = token;
	}
	setSiteId(siteId) {
		this._siteId = siteId;
	}

	getInventories(updatedSince) {
		let options = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this._token
			}
		}; 
        let url = 'sema/kiosk_closing_stock?kiosk_id=' + this._siteId;

		if (updatedSince) {
			url = url + '&updated-date=' + updatedSince.toISOString();
		} 

		return fetch(this._url + url, options)
		.then(response => response.json())
			.then(responseJson => {
				return responseJson;
			})
			.catch(error => {
				console.log('Communications:getInventories: ' + error);
				throw error;
			});
	}

	createInventory(inventory) {
		// TODO - Resolve inventory.... Is it needed, currently hardcoded...

		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(inventory)
		};
		console.log('this._url', this._url);
		return new Promise((resolve, reject) => {
			fetch(this._url + 'sema/kiosk_closing_stock/', options)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								console.log(
									'responseJson - Parse JSON: ' +
									responseJson
								);
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createInventory - Parse JSON: ' +
									error
								);
								reject();
							});
					} else {
						console.log(
							'createInventory - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createInventory - Fetch: ' + error.message);
					reject();
				});
		});
	}
	// Note that deleting a inventory actually just deactivates the Inventory
	deleteInventory(inventory) {
		let options = {
			method: 'DELETE',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify({
				active: false
			})
		};
		return new Promise((resolve, reject) => {
			fetch(
				this._url + 'sema/kiosk_closing_stock/' + inventory.closingStockId,
				options
			)
				.then(response => {
					if (response.status === 200 || response.status === 404) {
						resolve();
					} else {
						console.log(
							'deleteInventory - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('deleteInventory - Fetch: ' + error.message);
					reject();
				});
		});
	}

	updateInventory(inventory) {
		let options = {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(inventory)
		};
		return new Promise((resolve, reject) => {
			fetch(
				this._url + 'sema/kiosk_closing_stock/' + inventory.closingStockId,
				options
			)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'updateInventory - Parse JSON: ' +
									error.message
								);
								reject();
							});
					} else {
						console.log(
							'updateInventory - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createInventory - Fetch: ' + error.message);
					reject();
				});
		});
	}




}

export default new InventoryService();