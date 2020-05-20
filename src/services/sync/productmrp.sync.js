import ProductMRPRealm from '../../database/productmrp/productmrp.operations';
import ProductApi from '../api/product.api';
import SyncUtils from './syncUtils';
import * as _ from 'lodash';

class ProductMRPSync {

    synchronizeProductMrps(regionId) {
        return new Promise(resolve => {
            ProductApi.getProductMrps(regionId, ProductMRPRealm.getLastProductMRPSync())
                .then(async remoteProductMRP => {
                    let initlocalProductMRPs = ProductMRPRealm.getProductMRPSByDate(ProductMRPRealm.getLastProductMRPSync());
                    let localProductMRPs = initlocalProductMRPs.length > 0 ? [...initlocalProductMRPs] : [];
                    let remoteProductMRPs = remoteProductMRP.pricing.length > 0 ? [...remoteProductMRP.pricing] : [];


                    let onlyInLocal = localProductMRPs.filter(SyncUtils.compareRemoteAndLocal(remoteProductMRPs, 'id'));
                    let onlyInRemote = remoteProductMRPs.filter(SyncUtils.compareRemoteAndLocal(localProductMRPs, 'id'));



                    let syncResponseArray = [];
                    if (onlyInLocal.length > 0) {
                        for (const property in onlyInLocal) {

                        }
                    }

                    if (onlyInRemote.length > 0) {
                        let localResponse = await ProductMRPRealm.createManyProductMRP(onlyInRemote);
                        syncResponseArray.push(...localResponse);
                        ProductMRPRealm.setLastProductMRPSync();
                    }

                    resolve({
                        success: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        productMrps: onlyInLocal.concat(onlyInRemote).length,
                        successError: syncResponseArray.length > 0 ? syncResponseArray[0].status : 'success',
                        successMessage: syncResponseArray.length > 0 ? syncResponseArray[0] : 'success'
                    });

                })
                .catch(error => {
                    resolve({
                        error: true,
                        productMrps: 0
                    });
                });
        });
    }

    synchronizeProductMrpsBySiteid(siteId) {
        return new Promise(async resolve => {
            Communications.getProductMrpsBySiteId(siteId)
                .then(productMrps => {
                    if (productMrps.hasOwnProperty('productMRPs')) {

                        if (
                            !_.isEqual(
                                savedProductMrps,
                                productMrps.productMRPs
                            )
                        ) {
                            Events.trigger('ProductMrpsUpdated', {});
                        }
                        resolve({
                            error: null,
                            remoteProductMrps: productMrps.productMRPs.length
                        });
                    }
                })
                .catch(error => {
                    resolve({ error: error, remoteProducts: null });

                });
        });
    }

}
export default new ProductMRPSync();
