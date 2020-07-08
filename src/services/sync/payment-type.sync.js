import * as _ from 'lodash';
import PaymentTypeRealm from '../../database/payment_types/payment_types.operations';
import PaymentTypeApi from '../api/payment-types.api';
import SyncUtils from './syncUtils';

class PaymentTypeSync {
  synchronizePaymentTypes() {
    return new Promise((resolve) => {
      PaymentTypeApi.getPaymentTypes(PaymentTypeRealm.getLastPaymentTypeSync())
        .then(async (remotePaymentType) => {
          const initlocalPaymentTypes = PaymentTypeRealm.getPaymentTypesByDate(PaymentTypeRealm.getLastPaymentTypeSync());
          const localPaymentTypes = initlocalPaymentTypes.length > 0 ? [...initlocalPaymentTypes] : [];
          const remotePaymentTypes = remotePaymentType.length > 0 ? [...remotePaymentType] : [];

          const onlyInLocal = localPaymentTypes.filter(SyncUtils.compareRemoteAndLocal(remotePaymentTypes, 'id'));
          const onlyInRemote = remotePaymentTypes.filter(SyncUtils.compareRemoteAndLocal(localPaymentTypes, 'id'));

          const syncResponseArray = [];
          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {

            }
          }

          if (onlyInRemote.length > 0) {
            const localResponse = await PaymentTypeRealm.createManyPaymentTypes(onlyInRemote);
            syncResponseArray.push(...localResponse);
            PaymentTypeRealm.setLastPaymentTypeSync();
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            paymentTypes: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error,
            paymentTypes: 0,
          });
        });
    });
  }
}
export default new PaymentTypeSync();
