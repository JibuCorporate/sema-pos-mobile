import * as _ from 'lodash';
import ReceiptPaymentTypeRealm from '../../database/reciept_payment_types/reciept_payment_types.operations';
import RecieptPaymentTypesApi from '../api/reciept-payment-types.api';
import SyncUtils from './syncUtils';

class RecieptPaymentTypesSync {
  synchronizeRecieptPaymentTypes(kiosk_id) {
    return new Promise((resolve) => {
      RecieptPaymentTypesApi.getReceiptPaymentTypes(kiosk_id, ReceiptPaymentTypeRealm.getLastReceiptPaymentTypeSync())
        .then(async (result) => {
          const initlocalRecieptPaymentTypes = ReceiptPaymentTypeRealm.getReceiptPaymentTypesByDate(ReceiptPaymentTypeRealm.getLastReceiptPaymentTypeSync());
          const localRecieptPaymentTypes = initlocalRecieptPaymentTypes.length > 0 ? [...initlocalRecieptPaymentTypes] : [];
          const remoteRecieptPaymentTypes = result.length > 0 ? [...result] : [];

          const onlyInLocal = localRecieptPaymentTypes.filter(SyncUtils.compareRemoteAndLocal(remoteRecieptPaymentTypes, 'receipt_payment_type_id'));
          const onlyInRemote = remoteRecieptPaymentTypes.filter(SyncUtils.compareRemoteAndLocal(localRecieptPaymentTypes, 'receipt_payment_type_id'));

          const syncResponseArray = [];

          if (onlyInRemote.length > 0) {
            const localResponse = await ReceiptPaymentTypeRealm.syncManyReceiptPaymentType(onlyInRemote);
            syncResponseArray.push(...localResponse);
            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
          }

          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {
              const syncResponse = await this.apiSyncOperations({ ...onlyInLocal[property], kiosk_id });
              syncResponseArray.push(syncResponse);
            }
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            recieptPayments: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error: false,
            recieptPayments: 0,
          });
        });
    });
  }

  apiSyncOperations(localRecieptPaymentType) {
    return new Promise((resolve) => {
      if (localRecieptPaymentType.active === true && localRecieptPaymentType.syncAction === 'delete') {
        RecieptPaymentTypesApi.deleteReceiptPaymentType(
          localRecieptPaymentType,
        )
          .then((response) => {
            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();
            resolve({ status: 'success', message: 'synched', data: localRecieptPaymentType });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localRecieptPaymentType });
          });
      }

      if (localRecieptPaymentType.active === true && localRecieptPaymentType.syncAction === 'update') {
        RecieptPaymentTypesApi.updateReceiptPaymentType(
          localRecieptPaymentType,
        )
          .then((response) => {
            // updateCount = updateCount + 1;
            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();

            resolve({ status: 'success', message: 'synched', data: localRecieptPaymentType });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localRecieptPaymentType });
          });
      }

      if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'update') {
        RecieptPaymentTypesApi.createReceiptPaymentType(
          localRecieptPaymentType,
        )
          .then((response) => {
            // updateCount = updateCount + 1;
            ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();

            resolve({ status: 'success', message: 'synched', data: localRecieptPaymentType });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localRecieptPaymentType });
          });
      }

      if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'delete') {
        RecieptPaymentTypesApi.createReceiptPaymentType(
          localRecieptPaymentType,
        )
          .then((response) => {
            //  updateCount = updateCount + 1;
            ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();

            resolve({ status: 'success', message: 'synched', data: localRecieptPaymentType });
          })
          .catch((error) => {
            resolve({ status: 'error', message: 'error', data: localRecieptPaymentType });
          });
      }

      if (localRecieptPaymentType.active === false && localRecieptPaymentType.syncAction === 'create') {
        RecieptPaymentTypesApi.createReceiptPaymentType(
          localRecieptPaymentType,
        )
          .then((response) => {
            //  updateCount = updateCount + 1;
            ReceiptPaymentTypeRealm.synched(localRecieptPaymentType);
            ReceiptPaymentTypeRealm.setLastReceiptPaymentTypeSync();

            resolve({ status: 'success', message: 'synched', data: localRecieptPaymentType });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localRecieptPaymentType });
          });
      }
    });
  }
}
export default new RecieptPaymentTypesSync();
