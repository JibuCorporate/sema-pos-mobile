import CustomerTypeRealm from '../../database/customer-types/customer-types.operations';
import CustomerTypeApi from '../api/customer-types.api';
import SyncUtils from './syncUtils';

class CustomerTypeSync {
  static synchronizeCustomerTypes() {
    return new Promise((resolve) => {
      CustomerTypeApi.getCustomerTypes(CustomerTypeRealm.getLastCustomerTypesSync())
        .then(async (remoteCustomerType) => {
          const initlocalCustomerTypes = CustomerTypeRealm.getCustomerTypesByDate(CustomerTypeRealm.getLastCustomerTypesSync());
          const localCustomerTypes = initlocalCustomerTypes.length > 0 ? [...initlocalCustomerTypes] : [];
          const remoteCustomerTypes = remoteCustomerType.customerTypes.length > 0 ? [...remoteCustomerType.customerTypes] : [];

          const onlyInLocal = localCustomerTypes.filter(SyncUtils.compareRemoteAndLocal(remoteCustomerTypes, 'id'));
          const onlyInRemote = remoteCustomerTypes.filter(SyncUtils.compareRemoteAndLocal(localCustomerTypes, 'id'));

          const syncResponseArray = [];
          // if (onlyInLocal.length > 0) {
          //   for (const property in onlyInLocal) {

          //   }
          // }

          if (onlyInRemote.length > 0) {
            const localResponse = await CustomerTypeRealm.createManyCustomerTypes(onlyInRemote);
            syncResponseArray.push(...localResponse);
            CustomerTypeRealm.setLastCustomerTypesSync();
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            customerTypes: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error,
            customerTypes: 0,
          });
        });
    });
  }
}
export default new CustomerTypeSync();
