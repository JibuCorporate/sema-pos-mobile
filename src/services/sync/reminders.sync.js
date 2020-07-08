import * as _ from 'lodash';
import CustomerReminderRealm from '../../database/customer-reminder/customer-reminder.operations';
import ReminderApi from '../api/reminder.api';
import SyncUtils from './syncUtils';

class ReminderSync {
  synchronizeCustomerReminders(kiosk_id) {
    return new Promise((resolve) => {
      ReminderApi.getCustomerReminder(kiosk_id, CustomerReminderRealm.getLastCustomerReminderSync())
        .then(async (remoteResult) => {
          const initlocalCustomerReminders = CustomerReminderRealm.getAllCustomerReminderByDate(CustomerReminderRealm.getLastCustomerReminderSync());
          const localCustomerReminders = initlocalCustomerReminders.length > 0 ? [...initlocalCustomerReminders] : [];
          const remoteCustomerReminder = remoteResult.length > 0 ? [...remoteResult] : [];

          const onlyInLocal = localCustomerReminders.filter(SyncUtils.compareRemoteAndLocal(remoteCustomerReminder, 'reminder_id'));
          const onlyInRemote = remoteCustomerReminder.filter(SyncUtils.compareRemoteAndLocal(localCustomerReminders, 'reminder_id'));

          const syncResponseArray = [];

          if (onlyInRemote.length > 0) {
            const localResponse = await CustomerReminderRealm.createManyCustomerReminder(onlyInRemote);
            syncResponseArray.push(...localResponse);
            CustomerReminderRealm.setLastCustomerReminderSync();
          }

          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {
              const syncResponse = await this.apiSyncOperations({
                ...onlyInLocal[property],
                kiosk_id,
              });
              syncResponseArray.push(syncResponse);
            }
          }

          for (const i in syncResponseArray) {
            if (syncResponseArray[i].status === 'fail' && syncResponseArray[i].message === 'Customer Reminder has already been sent') {
              CustomerReminderRealm.deleteCustomerReminder(syncResponseArray[i].data.reminder_id);
            }
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            customerReminder: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error: true,
            message: error,
            customerReminder: 0,
          });
        });
    });
  }

  apiSyncOperations(localCustomerReminder) {
    return new Promise((resolve) => {
      if (localCustomerReminder.active === true && localCustomerReminder.syncAction === 'delete') {
        return ReminderApi.deleteCustomerReminder(
          localCustomerReminder,
        )
          .then((response) => {
            CustomerReminderRealm.setLastCustomerReminderSync();
            resolve({ status: 'success', message: response, data: localCustomerReminder });
          })
          .catch((error) => ({ status: 'fail', message: error, data: localCustomerReminder }));
      }

      if (localCustomerReminder.active === true && localCustomerReminder.syncAction === 'update') {
        return ReminderApi.updateCustomerReminder(
          localCustomerReminder,
        )
          .then((response) => {
            CustomerReminderRealm.setLastCustomerReminderSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCustomerReminder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localCustomerReminder });
          });
      }

      if (localCustomerReminder.active === false && localCustomerReminder.syncAction === 'update') {
        return ReminderApi.createCustomerReminder(
          localCustomerReminder,
        )
          .then((response) => {
            CustomerReminderRealm.synchedCustomerReminder(localCustomerReminder);
            CustomerReminderRealm.setLastCustomerReminderSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCustomerReminder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localCustomerReminder });
          });
      }

      if (localCustomerReminder.active === false && localCustomerReminder.syncAction === 'delete') {
        return ReminderApi.createCustomerReminder(
          localCustomerReminder,
        )
          .then((response) => {
            CustomerReminderRealm.synchedCustomerReminder(localCustomerReminder);
            CustomerReminderRealm.setLastCustomerReminderSync();

            resolve({ status: 'success', message: response, data: localCustomerReminder });
          })
          .catch((error) => ({ status: 'fail', message: error, data: localCustomerReminder }));
      }

      if (localCustomerReminder.active === false && localCustomerReminder.syncAction === 'create') {
        return ReminderApi.createCustomerReminder(
          localCustomerReminder,
        )
          .then((response) => {
            CustomerReminderRealm.synchedCustomerReminder(localCustomerReminder);
            CustomerReminderRealm.setLastCustomerReminderSync();

            resolve({ status: 'success', message: 'synched to remote', data: localCustomerReminder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: error, data: localCustomerReminder });
          });
      }
    });
  }
}
export default new ReminderSync();
