import * as _ from 'lodash';
import InventroyRealm from '../../database/inventory/inventory.operations';
import InventoryApi from '../api/inventory.api';
import SyncUtils from './syncUtils';

class InventorySync {
  synchronizeInventory(kiosk_id) {
    return new Promise((resolve) => {
      InventoryApi.getInventories(kiosk_id, InventroyRealm.getLastInventorySync())
        .then(async (remoteInventory) => {
          const initlocalInventories = InventroyRealm.getAllInventoryByDate(InventroyRealm.getLastInventorySync());

          const onlyInLocal = initlocalInventories.filter(SyncUtils.compareRemoteAndLocal(remoteInventory.closingStock, 'closingStockId'));
          const onlyInRemote = remoteInventory.closingStock.filter(SyncUtils.compareRemoteAndLocal(initlocalInventories, 'closingStockId'));

          const syncResponseArray = [];
          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {
              const syncResponse = await this.apiSyncOperations(onlyInLocal[property]);
              syncResponseArray.push(syncResponse);
            }
          }

          if (onlyInRemote.length > 0) {
            const localResponse = await InventroyRealm.createManyInventories(onlyInRemote);

            // syncResponseArray.concat(localResponse)
            syncResponseArray.push(...localResponse);
            InventroyRealm.setLastInventorySync();
          }

          for (const i in syncResponseArray) {
            if (syncResponseArray[i].status === 'fail' && syncResponseArray[i].message === 'Closing Stock has already been sent') {
              InventroyRealm.deleteByClosingStockId(syncResponseArray[i].data.closingStockId);
            }
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            wastageReport: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error: false,
            wastageReport: 0,
          });
        });
    });
  }

  apiSyncOperations(localInventory) {
    return new Promise((resolve) => {
      if (localInventory.active === true && localInventory.syncAction === 'delete') {
        InventoryApi.deleteInventory(
          localInventory,
        )
          .then((response) => {
            InventroyRealm.setLastInventorySync();
            resolve({ status: 'success', message: response, data: localInventory });
          })
          .catch((error) => ({ status: 'fail', message: error, data: localInventory }));
      }

      if (localInventory.active === true && localInventory.syncAction === 'update') {
        InventoryApi.updateInventory(
          localInventory,
        )
          .then((response) => {
            InventroyRealm.setLastInventorySync();

            resolve({ status: 'success', message: 'synched to remote', data: localInventory });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localInventory });
          });
      }

      if (localInventory.active === false && localInventory.syncAction === 'update') {
        InventoryApi.createInventory(
          localInventory,
        )
          .then((response) => {
            InventroyRealm.synched(localInventory);
            InventroyRealm.setLastInventorySync();

            resolve({ status: 'success', message: 'synched to remote', data: localInventory });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localInventory });
          });
      }

      if (localInventory.active === false && localInventory.syncAction === 'delete') {
        InventoryApi.createInventory(
          localInventory,
        )
          .then((response) => {
            InventroyRealm.synched(localInventory);
            InventroyRealm.setLastInventorySync();

            resolve({ status: 'success', message: 'synched to remote', data: localInventory });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localInventory });
          });
      }

      if (localInventory.active === false && localInventory.syncAction === 'create') {
        InventoryApi.createInventory(
          localInventory,
        )
          .then((response) => {
            InventroyRealm.synched(localInventory);
            InventroyRealm.setLastInventorySync();

            resolve({ status: 'success', message: 'synched to remote', data: localInventory });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localInventory });
          });
      }
    });
  }
}
export default new InventorySync();
