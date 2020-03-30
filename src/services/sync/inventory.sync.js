import InventroyRealm from '../../database/inventory/inventory.operations';
import InventoryApi from '../api/inventory.api';
import SyncUtils from './syncUtils';
import * as _ from 'lodash';

class InventorySync {

    synchronizeInventory(kiosk_id) {
        return new Promise(resolve => {
            InventoryApi.getInventories(kiosk_id, InventroyRealm.getLastInventorySync())
                .then(async remoteInventory => {
                    let initlocalInventories = InventroyRealm.getAllInventoryByDate(InventroyRealm.getLastInventorySync());
                    console.log('initlocalInventories', initlocalInventories);
                    console.log('remoteInventory', remoteInventory);
                    let onlyInLocal = initlocalInventories.filter(SyncUtils.compareRemoteAndLocal(remoteInventory.closingStock));
                    let onlyInRemote = remoteInventory.closingStock.filter(SyncUtils.compareRemoteAndLocal(initlocalInventories));

                    let syncResponseArray = [];
                    console.log('onlyInLocal', onlyInLocal);
                    console.log('onlyInRemote', onlyInRemote);
                    if (onlyInLocal.length > 0) {
                        for (const property in onlyInLocal) {
                            let syncResponse = await this.apiSyncOperations(onlyInLocal[property]);
                            syncResponseArray.push(syncResponse);
                        }
                    }

                    if (onlyInRemote.length > 0) {
                        let localResponse = await InventroyRealm.createManyInventories(onlyInRemote);
                        
                        //syncResponseArray.concat(localResponse)
                        syncResponseArray.push(...localResponse);
                        InventroyRealm.setLastInventorySync();
                    }

                    console.log('syncResponseArray', syncResponseArray);

                    for (const i in syncResponseArray) {
                        if (syncResponseArray[i].status === "fail" && syncResponseArray[i].message === "Closing Stock has already been sent") {
                            InventroyRealm.deleteByClosingStockId(syncResponseArray[i].data.closingStockId);
                        }
                    }

                    resolve({
                        success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        wastageReport: onlyInLocal.concat(onlyInRemote).length,
                        successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getInventory - error ' + error
                    );
                    resolve({
						error: false,
                        wastageReport: 0,
					});
                });
        });
    }

    apiSyncOperations(localInventory) {

        return new Promise(resolve => {
        if (localInventory.active === true && localInventory.syncAction === 'delete') {
            InventoryApi.deleteInventory(
                localInventory
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                        response
                    );
                    InventroyRealm.setLastInventorySync();
                    resolve({ status: 'success', message: response, data: localInventory });
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Delete Inventory failed ' +
                        error
                    );
                    return { status: 'fail', message: error, data: localInventory }
                });
        }

        if (localInventory.active === true && localInventory.syncAction === 'update') {

            InventoryApi.updateInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.setLastInventorySync();
                    console.log(
                        'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                        response
                    );
                    resolve({ status: 'success', message: 'synched to remote', data: localInventory });
                  
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Update Inventory failed ' +
                        error
                    );
                    resolve({ status: 'fail', message: error, data: localInventory });
                });

        }

        if (localInventory.active === false && localInventory.syncAction === 'update') {

            InventoryApi.createInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.synched(localInventory);
                    InventroyRealm.setLastInventorySync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                    resolve({ status: 'success', message: 'synched to remote', data: localInventory });
                    
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Create Inventory failed'
                    );
                    resolve({ status: 'fail', message: error, data: localInventory });
                });

        }

        if (localInventory.active === false && localInventory.syncAction === 'delete') {
            InventoryApi.createInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.synched(localInventory);
                    InventroyRealm.setLastInventorySync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                    resolve({ status: 'success', message: 'synched to remote', data: localInventory });
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Create Inventory failed'
                    );
                    resolve({ status: 'fail', message: error, data: localInventory });
                });

        }

        if (localInventory.active === false && localInventory.syncAction === 'create') {
            InventoryApi.createInventory(
                localInventory
            )
                .then((response) => {
                    InventroyRealm.synched(localInventory);
                    InventroyRealm.setLastInventorySync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                    resolve({ status: 'success', message: 'synched to remote', data: localInventory });
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Create Inventory failed'
                    );
                    resolve({ status: 'fail', message: error, data: localInventory });
                });

        }


    })
    }

}
export default new InventorySync();
