import realm from '../init';
const uuidv1 = require('uuid/v1');
import SyncUtils from '../../services/sync/syncUtils';
import { parseISO, isSameDay, format, sub, set, add, getSeconds, getMinutes, getHours, compareAsc } from 'date-fns';

class PaymentTypeRealm {
    constructor() {
        this.paymentType = [];
        let firstSyncDate = format(sub(new Date(), { years: 3 }), 'yyyy-MM-dd');
        realm.write(() => {
            if (Object.values(JSON.parse(JSON.stringify(realm.objects('PaymentTypeSyncDate')))).length == 0) {
                realm.create('PaymentTypeSyncDate', { lastPaymentTypeSync: firstSyncDate });
            }
            // let syncDate = realm.objects('PaymentTypeSyncDate');
            // syncDate[0].lastPaymentTypeSync = firstSyncDate;
        });
    }

    truncate() {
        try {
            realm.write(() => {
                let paymentTypes = realm.objects('PaymentType');
                realm.delete(realm.objects('PaymentTypeSyncDate'));
                realm.delete(paymentTypes);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    getLastPaymentTypeSync() {
        return JSON.parse(JSON.stringify(realm.objects('PaymentTypeSyncDate')))['0'].lastPaymentTypeSync;
    }

    setLastPaymentTypeSync() {
        realm.write(() => {
            let syncDate = realm.objects('PaymentTypeSyncDate');
            syncDate[0].lastPaymentTypeSync = new Date();
        })
    }

    getPaymentTypes() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('PaymentType'))));
    }

    getPaymentTypesByDate(date) {
        let paymentTypes = Object.values(JSON.parse(JSON.stringify(realm.objects('PaymentType'))));
        return paymentTypes.filter(r => {
            return compareAsc(parseISO(r.created_at), parseISO(date)) === 1 || compareAsc(parseISO(r.updated_at), parseISO(date)) === 1 || r.active === false;
        })
    }

    initialise() {
        return this.getPaymentTypes();
    }

    formatDay(date) {
        date = new Date(date);
        var day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();
        if (month.toString().length == 1) {
            month = "0" + month;
        }
        if (day.toString().length == 1) {
            day = "0" + day;
        }

        return date = year + '-' + month + '-' + day;
    }


    createPaymentType(paymentType) {
        try {
            realm.write(() => {
                realm.create('PaymentType', paymentType);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    updatePaymentType(paymentType) {
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                paymentTypeObj[0].id = paymentType.id;
                paymentTypeObj[0].name = paymentType.name;
                paymentTypeObj[0].active = paymentType.active;
                paymentTypeObj[0].description = paymentType.description;
                paymentTypeObj[0].syncAction = paymentType.syncAction;
                paymentTypeObj[0].created_at = paymentType.created_at;
                paymentTypeObj[0].updated_at = paymentType.updated_at;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyPaymentTypes(paymentTypes) {

        return new Promise((resolve, reject) => {
            try {
                let result = [];
                realm.write(() => {
                    for (i = 0; i < paymentTypes.length; i++) {
                        let ischeckpaymentTypes = this.checkpaymentTypes(paymentTypes[i].created_at, paymentTypes[i].id).length;
                        if (ischeckpaymentTypes === 0) {
                            let value = realm.create('PaymentType', {
                                ...paymentTypes[i],
                                name: paymentTypes[i].name,
                                description: paymentTypes[i].description ===null ? '' : paymentTypes[i].description,
                                active: true
                            });
                            result.push({ status: 'success', data: value, message: 'Customer Type has been set' });
                        } else if (ischeckpaymentTypes > 0) {
                            result.push({ status: 'success', data: paymentTypes[i], message: 'Local Customer Type has been updated' });
                            let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentTypes[i].id}"`);
                            paymentTypeObj[0].description = paymentTypes[i].description === null ? '' : paymentTypes[i].description;
                            paymentTypeObj[0].name = paymentTypes[i].name;
                            paymentTypeObj[0].updated_at = new Date(paymentTypes[i].updated_at);
                        }
                    }

                });
                resolve(result);
            } catch (e) {
                console.log("Error on creation", e);
            }
        });
    }


    checkpaymentTypes(date, id) {
        return this.getPaymentTypes().filter(e => SyncUtils.isSimilarDay(e.created_at, date) && e.id === id)
    }

    resetSelected(){
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType');
                paymentTypeObj.forEach(element=>{
                   // console.log('element',element);
                    element.isSelected = false;
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    isSelected(paymentType,isSelected) {
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                paymentTypeObj[0].isSelected = isSelected;

            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(paymentType) {
        try {
            realm.write(() => {
                let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                paymentTypeObj[0].active = true;
                paymentTypeObj[0].syncAction = null;
            })

        } catch (e) {
            console.log("Error on creation", e);
        }

    }


    // Hard delete when active property is false or when active property and syncAction is delete

    hardDeletePaymentType(paymentType) {
        try {
            realm.write(() => {
                let paymentTypes = realm.objects('PaymentType');
                let deletePaymentType = paymentTypes.filtered(`id = "${paymentType.id}"`);
                realm.delete(deletePaymentType);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeletePaymentType(paymentType) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let paymentTypeObj = realm.objects('PaymentType').filtered(`id = "${paymentType.id}"`);
                    paymentTypeObj[0].syncAction = 'delete';
                })
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

  
}

export default new PaymentTypeRealm();
