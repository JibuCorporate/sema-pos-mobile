import moment from 'moment-timezone';
import PosStorage from '../database/PosStorage';
class TopUpService {
	constructor() {
		this._url = 'h';
		this._site = '';
		this._user = '';
		this._password = '';
		this._token = '';
		this._siteId = '';
		this.customer_account_id = '';
	}

	getTopUps(updatedSince) {
		let options = {
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + this._token
			}
		};
		let url = 'sema/site/customer_credit?customer_account_id=' + this.customer_account_id;

		if (updatedSince) {
			url = url + '&updated-date=' + updatedSince.toISOString();
		}
		return fetch(this._url + url, options)
			.then(response => response.json())
			.then(responseJson => {
				return responseJson;
			})
			.catch(error => {
				console.log('Communications:getTopUps: ' + error);
				throw error;
			});
	}

	createTopUp(topup) {
		// TODO - Resolve topup.... Is it needed, currently hardcoded...

		let options = {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(topup)
		};
		return new Promise((resolve, reject) => {
			fetch(this._url + 'sema/site/customer_credit', options)
				.then(response => {
					if (response.status === 200) {
						response
							.json()
							.then(responseJson => {
								resolve(responseJson);
							})
							.catch(error => {
								console.log(
									'createTopUp - Parse JSON: ' +
									error.message
								);
								reject();
							});
					} else {
						console.log(
							'createTopUp - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createTopUp - Fetch: ' + error.message);
					reject();
				});
		});
	}
	// Note that deleting a topup actually just deactivates the TopUp
	deleteTopUp(topup) {
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
				this._url + 'sema/site/customer_credit/' + topup.topUpId,
				options
			)
				.then(response => {
					if (response.status === 200 || response.status === 404) {
						resolve();
					} else {
						console.log(
							'deleteTopUp - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('deleteTopUp - Fetch: ' + error.message);
					reject();
				});
		});
	}

	updateCustomerCredit(topup) {
		let options = {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: 'Bearer ' + this._token
			},
			body: JSON.stringify(topup)
		};
		return new Promise((resolve, reject) => {
			fetch(
				this._url + 'sema/site/customer_credit/' + topup.topUpId,
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
									'updateTopUp - Parse JSON: ' +
									error.message
								);
								reject();
							});
					} else {
						console.log(
							'updateTopUp - Fetch status: ' + response.status
						);
						reject();
					}
				})
				.catch(error => {
					console.log('createTopUp - Fetch: ' + error.message);
					reject();
				});
		});
	}




}

export default new TopUpService();