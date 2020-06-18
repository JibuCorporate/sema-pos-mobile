import CreditRealm from '../database/credit/credit.operations';
import InventroyRealm from '../database/inventory/inventory.operations';
import SettingRealm from '../database/settings/settings.operations';
import Communications from '../services/Communications';

import * as _ from 'lodash';
import InventorySync from './sync/inventory.sync';
import CreditSync from './sync/credit.sync';
import MeterReadingSync from './sync/meter-reading.sync'
import ReminderSync from './sync/reminders.sync'
import CustomerSync from './sync/customer.sync';
import ProductSync from './sync/product.sync';
import ProductMRPSync from './sync/productmrp.sync';
import SalesChannelSync from './sync/sales-channel.sync';
import CustomerTypeSync from './sync/customer-types.sync';
import OrderSync from './sync/orders.sync';
import DiscountSync from './sync/discounts.sync';
import PaymentTypeSync from './sync/payment-type.sync';

import RecieptPaymentTypesSync from './sync/reciept-payment-types.sync';
import CustomerDebtsSync from './sync/customer-debt.sync';

class Synchronization {

	constructor() {
	}

	initialize(lastCustomerSync, lastProductSync, lastSalesSync, lastCreditSync, lastInventorySync) {
		this.lastCustomerSync = lastCustomerSync;
		this.lastProductSync = lastProductSync;
		this.lastSalesSync = lastSalesSync;
		this.intervalId = null;
		this.firstSyncId = null;
		this.isConnected = false;
		this.lastCreditSync = lastCreditSync;
		this.lastInventorySync = lastInventorySync;
	}

	setConnected(isConnected) {
		this.isConnected = isConnected;
	}

	scheduleSync() {
		let timeoutX = 10000; // Sync after 10 seconds
		if (this.firstSyncId != null) {
			clearTimeout(this.firstSyncId);
		}

		if (this.intervalId != null) {
			clearInterval(this.intervalId);
		}

		if (
			CreditRealm.getAllCredit().length == 0 ||
			InventroyRealm.getAllInventory().length == 0
		) {
			// No local customers or products, sync now
			timeoutX = 1000;
		}

		let that = this;
		this.firstSyncId = setTimeout(() => {
			//that.doSynchronize();
			that.synchronize();
		}, timeoutX);

		//Sync sales separately every two minutes
		setInterval(() => {
			//this.synchronizeSales();
		}, 120000);

		this.intervalId = setInterval(() => {
			that.doSynchronize();
		}, syncInterval);
	}

	updateLastCustomerSync() {
		this.lastCustomerSync = new Date();
	}
	updateLastProductSync() {
		this.lastProductSync = new Date();
	}
	updateLastSalesSync() {
		this.lastSalesSync = new Date();
	}

	updateLastTopUpSync() {
		this.lastCreditSync = new Date();
		CreditRealm.setLastCreditSync(this.lastCreditSync);
	}


	updateInventorySync() {
		this.lastInventorySync = new Date();
		InventroyRealm.setLastInventorySync(this.lastInventorySync);
	}

	doSynchronize() {
		if (this.isConnected) {
			//this.synchronize();
			//Sync customers
			CustomerSync.synchronizeCustomers();

			//Synchronize receipts
			//this.synchReceipts();
		} else {

		}
	}

	synchronize() {
		console.log("Start synching ...");
		let syncResult = { status: 'success', error: '' };
		return new Promise(resolve => {
			try {
				console.log("Start synching for real ...");
				this._refreshToken()
					.then(() => {
						console.log("Start synching for real now ...");
						let settings = SettingRealm.getAllSetting();
						const promiseSalesChannels = SalesChannelSync.synchronizeSalesChannels();
						const promiseCustomerTypes = CustomerTypeSync.synchronizeCustomerTypes();
						const promisePaymentTypes = PaymentTypeSync.synchronizePaymentTypes();
						const promiseDiscounts = DiscountSync.synchronizeDiscount(settings.siteId);
						const promiseProductMrps = ProductMRPSync.synchronizeProductMrps(settings.regionId);
						const promiseProducts = ProductSync.synchronizeProducts();
						const promiseMeterReading = MeterReadingSync.synchronizeMeterReading(settings.siteId);

						const promiseReminder = ReminderSync.synchronizeCustomerReminders(settings.siteId);

						const promiseInventory = InventorySync.synchronizeInventory(settings.siteId);


						const promiseCustomers = CustomerSync.synchronizeCustomers(settings.siteId);
						const promiseTopUps = CreditSync.synchronizeCredits(settings.siteId);

						const promiseCustomerDebts = CustomerDebtsSync.synchronizeCustomerDebts(settings.siteId);
						const promiseRecieptPaymentTypes = RecieptPaymentTypesSync.synchronizeRecieptPaymentTypes(settings.siteId);
						const promiseOrders = OrderSync.synchronizeSales(settings.siteId);

						console.log("Start synching end 1 ...");

						Promise.all([
							promiseSalesChannels,
							promiseCustomerTypes,
							promisePaymentTypes,
							promiseDiscounts,
							promiseProductMrps,
							promiseProducts,
							promiseMeterReading,
							promiseInventory,
							promiseCustomerDebts,
							promiseRecieptPaymentTypes,
							promiseTopUps,
							promiseCustomers,
							promiseOrders,
							promiseReminder

						])
							.then(values => {
								console.log("Mayday values " + JSON.stringify(values));
								syncResult.salesChannels = values[0];
								syncResult.customerTypes = values[1];
								syncResult.paymentTypes = values[2];
								syncResult.discounts = values[3];
								syncResult.productMrps = values[3];
								syncResult.products = values[4];
								syncResult.meterReading = values[4];
								syncResult.wastageReport = values[0];
								syncResult.debt = values[1];
								syncResult.recieptPayments = values[2];
								syncResult.topups = values[3];
								syncResult.customers = values[4];
								syncResult.orders = values[5];
								syncResult.customerReminder = values[6];

								resolve(syncResult);
							}).
							catch(error => {
								console.log("Mayday end final error " + JSON.stringify(error));
							});
					})
					.catch(error => {
						syncResult.error = error;
						syncResult.status = 'failure';
						console.log("Mayday error " + JSON.stringify(syncResult));
						resolve(syncResult);
					});
			} catch (error) {
				syncResult.error = error;
				syncResult.status = 'failure';
				resolve(syncResult);
				console.log("Mayday error2 " + JSON.stringify(syncResult));
			}
		});
	}

	_refreshToken() {
		// Check if token exists or has expired
		return new Promise((resolve, reject) => {
			let settings = SettingRealm.getAllSetting();
			let tokenExpirationDate = SettingRealm.getTokenExpiration();
			let currentDateTime = new Date();

			if (
				settings.token.length === 0 ||
				currentDateTime > tokenExpirationDate
			) {
				Communications.login(settings.user, settings.password)
					.then(result => {
						if (result.status === 200) {
							SettingRealm.saveSettings(
								settings.semaUrl,
								settings.site,
								settings.user,
								settings.password,
								settings.uiLanguage,
								result.response.token,
								settings.siteId,
								false,
								settings.currency
							);
							Communications.setToken(result.response.token);
							SettingRealm.setTokenExpiration();
						}
						resolve();
					})
					.catch(result => {
						reject(result.response);
					});
			} else {
				resolve();
			}
		});
	}


}
export default new Synchronization();
