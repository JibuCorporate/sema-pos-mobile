import realm from '../init';
const uuidv1 = require('uuid/v1');

class CustomerDebtRealm {
    constructor() {
        this.customerDebt = [];
    }

    truncate() {
        try {
            realm.write(() => {
                let customerDebts = realm.objects('CustomerDebt');
                realm.delete(customerDebts);
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    getCustomerDebts() {
        return Object.values(JSON.parse(JSON.stringify(realm.objects('CustomerDebt'))));
    }

    initialise() {
        return this.getCustomerDebts();
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


    createCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                realm.create('CustomerDebt', customerDebt);
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    updateCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customerDebtId}"`);
                customerDebtObj[0].customerDebtId = customerDebt.customerDebtId;
                customerDebtObj[0].name = customerDebt.name;
                customerDebtObj[0].active = customerDebt.active;
                customerDebtObj[0].description = customerDebt.description;
                customerDebtObj[0].syncAction = customerDebt.syncAction;
                customerDebtObj[0].created_at = customerDebt.created_at;
                customerDebtObj[0].updated_at = customerDebt.updated_at;

            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    resetSelected() {
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt');
                customerDebtObj.forEach(element => {
                    element.isSelected = false;
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    isSelected(customerDebt, isSelected) {
        console.log(isSelected);
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customerDebtId}"`);
                customerDebtObj[0].isSelected = isSelected;

            })
        } catch (e) {
            console.log("Error on creation", e);
        }

    }

    synched(customerDebt) {
        try {
            realm.write(() => {
                let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customerDebtId}"`);
                customerDebtObj[0].active = true;
                customerDebtObj[0].syncAction = null;
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }


    // Hard delete when active property is false or when active property and syncAction is delete
    hardDeleteCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                let customerDebts = realm.objects('CustomerDebt');
                let deleteCustomerDebt = customerDebts.filtered(`id = "${customerDebt.customerDebtId}"`);
                realm.delete(deleteCustomerDebt);
            })

        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    softDeleteCustomerDebt(customerDebt) {
        try {
            realm.write(() => {
                realm.write(() => {
                    let customerDebtObj = realm.objects('CustomerDebt').filtered(`id = "${customerDebt.customerDebtId}"`);
                    customerDebtObj[0].syncAction = 'delete';
                })
            })
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

    createManyCustomerDebt(customerDebts, customer_account_id) {
        console.log('customerDebts', customerDebts);
        console.log('customer_account_id', customer_account_id);
        try {
            realm.write(() => {
                if (customer_account_id) {
                    customerDebts.forEach(obj => {
                        realm.create('CustomerDebt', {
                            customer_account_id: customer_account_id ? customer_account_id : null,
                            customerDebtId: obj.customerDebtId,
                            due_amount: obj.due_amount,
                            syncAction: obj.syncAction ? obj.syncAction : 'CREATE',
                            created_at: obj.created_at ? obj.created_at : null,
                            updated_at: obj.updated_at ? obj.updated_at : null,
                        });
                    });
                }
                if (!customer_account_id) {
                    customerDebts.forEach(obj => {
                        realm.create('CustomerDebt', obj);
                    });
                }
            });
        } catch (e) {
            console.log("Error on creation", e);
        }
    }

}

export default new CustomerDebtRealm();