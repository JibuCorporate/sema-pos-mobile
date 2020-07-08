import * as _ from 'lodash';
import DiscountRealm from '../../database/discount/discount.operations';
import DiscountApi from '../api/discounts.api';
import SyncUtils from './syncUtils';

class DiscountSync {
  synchronizeDiscount(kiosk_id) {
    return new Promise((resolve) => {
      DiscountApi.getDiscounts(kiosk_id, DiscountRealm.getLastDiscountSync())
        .then(async (remoteDiscount) => {
          const initlocalDiscounts = DiscountRealm.geDiscountsByDate(DiscountRealm.getLastDiscountSync());

          const localDiscounts = initlocalDiscounts.length > 0 ? [...initlocalDiscounts] : [];
          const remoteDiscounts = remoteDiscount.promotion.length > 0 ? [...remoteDiscount.promotion] : [];

          const onlyInLocal = localDiscounts.filter(SyncUtils.compareRemoteAndLocal(remoteDiscounts, 'id'));
          const onlyInRemote = remoteDiscounts.filter(SyncUtils.compareRemoteAndLocal(localDiscounts, 'id'));

          const syncResponseArray = [];
          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {

            }
          }

          if (onlyInRemote.length > 0) {
            const localResponse = await DiscountRealm.createManyDiscount(onlyInRemote);
            syncResponseArray.push(...localResponse);
            DiscountRealm.setLastDiscountSync();
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            discounts: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error,
            discounts: 0,
          });
        });
    });
  }
}
export default new DiscountSync();
