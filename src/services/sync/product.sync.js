import * as _ from 'lodash';
import ProductRealm from '../../database/products/product.operations';
import ProductApi from '../api/product.api';
import SyncUtils from './syncUtils';

class ProductSync {
  synchronizeProducts() {
    return new Promise((resolve) => {
      ProductApi.getProducts(ProductRealm.getLastProductsync())
        .then(async (remoteProduct) => {
          const initlocalProducts = ProductRealm.getProductsByDate(ProductRealm.getLastProductsync());
          const localProducts = initlocalProducts.length > 0 ? [...initlocalProducts] : [];
          const remoteProducts = remoteProduct.products.length > 0 ? [...remoteProduct.products] : [];

          const remoteProducts2 = remoteProduct.products.length > 0 ? [...remoteProduct.products] : [];

          remoteProducts3 = remoteProducts2.map((e) => {
            delete e.base64encodedImage;
            return { ...e };
          });

          const onlyInLocal = localProducts.filter(SyncUtils.compareRemoteAndLocal(remoteProducts, 'productId'));
          const onlyInRemote = remoteProducts.filter(SyncUtils.compareRemoteAndLocal(localProducts, 'productId'));

          const syncResponseArray = [];
          if (onlyInLocal.length > 0) {
            for (const property in onlyInLocal) {

            }
          }

          if (onlyInRemote.length > 0) {
            const localResponse = await ProductRealm.createManyProducts(onlyInRemote);
            syncResponseArray.push(...localResponse);
            ProductRealm.setLastProductsync();
          }

          resolve({
            success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            products: onlyInLocal.concat(onlyInRemote).length,
            successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
            successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success',
          });
        })
        .catch((error) => {
          resolve({
            error: true,
            products: 0,
          });
        });
    });
  }
}
export default new ProductSync();
