import * as _ from 'lodash';
import OrderRealm from '../../database/orders/orders.operations';
import OrderApi from '../api/order.api';
import SyncUtils from './syncUtils';

class OrderSync {
  synchronizeSales(kiosk_id) {
    return new Promise((resolve) => {
      OrderApi.getReceipts(kiosk_id, OrderRealm.getLastOrderSync())
        .then(async (remoteOrder) => {
          const initlocalOrders = OrderRealm.getOrdersByDate2(OrderRealm.getLastOrderSync());
          const localOrders = initlocalOrders.length > 0 ? [...initlocalOrders] : [];
          const remoteOrders = remoteOrder.length > 0 ? [...remoteOrder] : [];

          const onlyInLocal = localOrders.filter(SyncUtils.compareRemoteAndLocal(remoteOrders, 'uuid'));
          const onlyInRemote = remoteOrders.filter(SyncUtils.compareRemoteAndLocal(localOrders, 'uuid'));

          const syncResponseArray = [];

          if (onlyInRemote.length > 0) {
            const localResponse = await OrderRealm.createManyOrders(onlyInRemote);
            syncResponseArray.push(...localResponse);
            OrderRealm.setLastOrderSync();
          }

          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {
              const products = [];
              for (const i in onlyInLocal[property].receipt_line_items) {
                products.push({
                  active: 1,
                  cogsTotal: onlyInLocal[property].receipt_line_items[i].cogs_total,
                  description: onlyInLocal[property].receipt_line_items[i].description,
                  litersPerSku: onlyInLocal[property].receipt_line_items[i].litersPerSku,
                  priceTotal: onlyInLocal[property].receipt_line_items[i].totalAmount,
                  totalAmount: onlyInLocal[property].receipt_line_items[i].totalAmount,
                  productId: onlyInLocal[property].receipt_line_items[i].product_id,
                  quantity: onlyInLocal[property].receipt_line_items[i].quantity,
                  sku: onlyInLocal[property].receipt_line_items[i].sku,
                  notes: onlyInLocal[property].receipt_line_items[i].notes,
                  emptiesReturned: onlyInLocal[property].receipt_line_items[i].emptiesReturned,
                  damagedBottles: onlyInLocal[property].receipt_line_items[i].emptiesDamaged,
                  pendingBottles: onlyInLocal[property].receipt_line_items[i].refillPending,
                });
              }

              onlyInLocal[property].products = products;
              delete onlyInLocal[property].receipt_line_items;
              delete onlyInLocal[property].customer_account;
              delete onlyInLocal[property].customerAccountId;
              const syncResponse = await this.apiSyncOperations({ ...onlyInLocal[property], kiosk_id });
              syncResponseArray.push(syncResponse);
            }
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            orders: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error: true,
            orders: 0,
          });
        });
    });
  }

  apiSyncOperations(localOrder, kiosk_id) {
    return new Promise((resolve) => {
      if (localOrder.active === true && localOrder.syncAction === 'delete') {
        OrderApi.deleteOrder(
          localOrder, kiosk_id,
        )
          .then((response) => {
            OrderRealm.setLastOrderSync();
            resolve({ status: 'success', message: 'synched', data: localOrder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localOrder });
          });
      }

      if (localOrder.active === true && localOrder.syncAction === 'update') {
        OrderApi.updateOrder(
          localOrder,
        )
          .then((response) => {
            OrderRealm.setLastOrderSync();

            resolve({ status: 'success', message: 'synched', data: localOrder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localOrder });
          });
      }

      if (localOrder.active === false && localOrder.syncAction === 'update') {
        OrderApi.createOrder(
          localOrder,
        )
          .then((response) => {
            // updateCount = updateCount + 1;
            OrderRealm.synched(localOrder);
            OrderRealm.setLastOrderSync();

            resolve({ status: 'success', message: 'synched', data: localOrder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localOrder });
          });
      }

      if (localOrder.active === false && localOrder.syncAction === 'delete') {
        OrderApi.createOrder(
          localOrder,
        )
          .then((response) => {
            OrderRealm.synched(localOrder);
            OrderRealm.setLastOrderSync();

            resolve({ status: 'success', message: 'synched', data: localOrder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localOrder });
          });
      }

      if (localOrder.active === false && localOrder.syncAction === 'create') {
        OrderApi.createOrder(
          localOrder,
        )
          .then((response) => {
            //  updateCount = updateCount + 1;
            OrderRealm.synched(localOrder);
            OrderRealm.setLastOrderSync();

            resolve({ status: 'success', message: 'synched', data: localOrder });
          })
          .catch((error) => {
            resolve({ status: 'fail', message: 'error', data: localOrder });
          });
      }
    });
  }
}
export default new OrderSync();
