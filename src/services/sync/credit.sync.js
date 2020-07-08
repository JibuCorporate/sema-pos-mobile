import CreditRealm from '../../database/credit/credit.operations';
import CreditApi from '../api/credit.api';
import SyncUtils from './syncUtils';

class CreditSync {
  synchronizeCredits(kiosk_id) {
    return new Promise((resolve) => {
      CreditApi.getTopUps(kiosk_id, CreditRealm.getLastCreditSync())
        .then(async (remoteCredit) => {
          const initlocalCredits = CreditRealm.getAllCreditByDate(CreditRealm.getLastCreditSync());
          const localCredits = initlocalCredits.length > 0 ? [...initlocalCredits] : [];
          const remoteTopUps = remoteCredit.topup.length > 0 ? [...remoteCredit.topup] : [];

          const onlyInLocal = localCredits.filter(SyncUtils.compareRemoteAndLocal(remoteTopUps, 'top_up_id'));
          const onlyInRemote = remoteTopUps.filter(SyncUtils.compareRemoteAndLocal(localCredits, 'top_up_id'));

          const syncResponseArray = [];
          if (onlyInRemote.length > 0) {
            const localResponse = await CreditRealm.createManycredits(onlyInRemote);
            syncResponseArray.push(...localResponse);
            CreditRealm.setLastCreditSync();
          }

          if (onlyInLocal.length > 0) {
            for (const property of onlyInLocal) {
              const syncResponse = await this.apiSyncOperations({ ...property, kiosk_id });
              syncResponseArray.push(syncResponse);
            }
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            topups: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch(() => {
          resolve({
            error: false,
            topups: 0,
          });
        });
    });
  }

  static apiSyncOperations(localCredit) {
    return new Promise((resolve) => {
      if (localCredit.synched === true && localCredit.syncAction === 'delete') {
        CreditApi.deleteTopUp(
          localCredit,
        )
          .then((response) => {
            CreditRealm.setLastCreditSync();
            resolve({ status: 'success', message: response, data: localCredit });
          })
          .catch((error) => ({ status: 'fail', message: error, data: localCredit }));
      }

      if (localCredit.synched === true && localCredit.syncAction === 'update') {
        CreditApi.updateCustomerCredit(
          localCredit,
        )
          .then(() => {
            // updateCount = updateCount + 1;
            CreditRealm.setLastCreditSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCredit });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localCredit });
          });
      }

      if (localCredit.synched === false && localCredit.syncAction === 'update') {
        CreditApi.createTopUp(
          localCredit,
        )
          .then(() => {
            // updateCount = updateCount + 1;
            CreditRealm.synched(localCredit);
            CreditRealm.setLastCreditSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCredit });
          })
          .catch(() => {
            resolve({ status: 'fail', message: 'error', data: localCredit });
          });
      }

      if (localCredit.synched === false && localCredit.syncAction === 'delete') {
        CreditApi.createTopUp(
          localCredit,
        )
          .then(() => {
            //  updateCount = updateCount + 1;
            CreditRealm.synched(localCredit);
            CreditRealm.setLastCreditSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCredit });
          })
          .catch(() => {
            resolve({ status: 'fail', message: 'error', data: localCredit });
          });
      }

      if (localCredit.synched === false && localCredit.syncAction === 'create') {
        CreditApi.createTopUp(
          localCredit,
        )
          .then(() => {
            //  updateCount = updateCount + 1;
            CreditRealm.synched(localCredit);
            CreditRealm.setLastCreditSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCredit });
          })
          .catch(() => {
            resolve({ status: 'fail', message: 'error', data: localCredit });
          });
      }
    });
  }
}
export default new CreditSync();
