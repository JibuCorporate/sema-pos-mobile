import * as _ from 'lodash';
import SalesChannelRealm from '../../database/sales-channels/sales-channels.operations';
import SalesChannelApi from '../api/sales-channel.api';
import SyncUtils from './syncUtils';

class SalesChannelSync {
  synchronizeSalesChannels() {
    return new Promise((resolve) => {
      SalesChannelApi.getSalesChannels(SalesChannelRealm.getLastSalesChannelSync())
        .then(async (remoteSalesChannel) => {
          const initlocalSalesChannels = SalesChannelRealm.getSalesChannelsByDate(SalesChannelRealm.getLastSalesChannelSync());

          const localSalesChannels = initlocalSalesChannels.length > 0 ? [...initlocalSalesChannels] : [];
          const remoteSalesChannels = remoteSalesChannel.salesChannels.length > 0 ? [...remoteSalesChannel.salesChannels] : [];

          const onlyInLocal = localSalesChannels.filter(SyncUtils.compareRemoteAndLocal(remoteSalesChannels, 'id'));
          const onlyInRemote = remoteSalesChannels.filter(SyncUtils.compareRemoteAndLocal(localSalesChannels, 'id'));

          const syncResponseArray = [];
          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {

            }
          }

          if (onlyInRemote.length > 0) {
            const localResponse = await SalesChannelRealm.createManySalesChannel(onlyInRemote);
            syncResponseArray.push(...localResponse);
            SalesChannelRealm.setLastSalesChannelSync();
          }

          for (const i in syncResponseArray) {
            if (syncResponseArray[i].status === 'fail' && syncResponseArray[i].message === 'Closing Stock has already been sent') {
              SalesChannelRealm.deleteByClosingStockId(syncResponseArray[i].data.closingStockId);
            }
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            salesChannels: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error,
            salesChannels: 0,
          });
        });
    });
  }
}
export default new SalesChannelSync();
