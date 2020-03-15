import InventroyRealm from '../../database/inventory/inventory.operations';
import MeterReadingApi from '../api/meter-reading.api';
import * as _ from 'lodash';

class MeterReadingSync {

    synchronizeMeterReading(kiosk_id) {
        return new Promise(resolve => {
            MeterReadingApi.getMeterReading(kiosk_id, InventroyRealm.getLastMeterReadingSync())
                .then(remoteMeterReading => {
                    let initlocalMeterReadings = InventroyRealm.getAllMeterReadingByDate(InventroyRealm.getLastMeterReadingSync());
                   let localMeterReadings = [...initlocalMeterReadings];
                    let remoteMeterReadings = [...remoteMeterReading];
                    // console.log('remoteMeterReading', remoteMeterReading);
                    // console.log('initlocalMeterReadings', initlocalMeterReadings);

                    if (localMeterReadings.length === 0) {
                        InventroyRealm.createManyMeterReading(remoteMeterReading);
                        InventroyRealm.setLastMeterReadingSync();
                    }


                    let onlyLocally = [];
                    let onlyRemote = [];
                    let inLocal = [];
                    let inRemote = [];
                    let bothLocalRemote = {};

                    if (initlocalMeterReadings.length > 0) {

                        initlocalMeterReadings.forEach(localMeterReading => {
                            let filteredObj = remoteMeterReadings.filter(obj => obj.meter_reading_id === localMeterReading.meter_reading_id)

                            if (filteredObj.length > 0) {
                                const remoteIndex = remoteMeterReadings.map(function (e) { return e.meter_reading_id }).indexOf(filteredObj[0].meter_reading_id);
                                const localIndex = localMeterReadings.map(function (e) { return e.meter_reading_id }).indexOf(filteredObj[0].meter_reading_id);

                                remoteMeterReadings.splice(remoteIndex, 1);
                                localMeterReadings.splice(localIndex, 1);

                                inLocal.push(localMeterReading);
                                inRemote.push(filteredObj[0]);
                            }

                            if (filteredObj.length === 0) {
                                onlyLocally.push(localMeterReading);
                                const localIndex = localMeterReadings.map(function (e) { return e.meter_reading_id }).indexOf(localMeterReading.meter_reading_id);

                                localMeterReadings.splice(localIndex, 1);
                            }
                        });

                        onlyRemote.push(...remoteMeterReadings);
                        bothLocalRemote.inLocal = inLocal;
                        bothLocalRemote.inRemote = inRemote;


                        if (onlyRemote.length > 0) {
                            InventroyRealm.createManyMeterReading(onlyRemote)
                        }

                        if (onlyLocally.length > 0) {
                            onlyLocally.forEach(localMeterReading => {
                                this.apiSyncOperations({
                                    ...localMeterReading,
                                    kiosk_id
                                });

                            })
                        }

                        if (inLocal.length > 0 && inRemote.length > 0) {
                            inLocal.forEach(localMeterReading => {
                                this.apiSyncOperations(localMeterReading);

                            })
                        }

                    }
                    resolve({
                        error: null,
                        localMeterReading: onlyLocally.length,
                        remoteMeterReading: onlyRemote.length
                    });

                })
                .catch(error => {
                    console.log(
                        'Synchronization.getMeterReading - error ' + error
                    );
                    resolve({
                        error: error,
                        localMeterReading: 0,
                        remoteMeterReading: 0
                    });
                });
        });
    }

    apiSyncOperations(localMeterReading) {
        if (localMeterReading.active === true && localMeterReading.syncAction === 'delete') {
            MeterReadingApi.deleteMeterReading(
                localMeterReading
            )
                .then((response) => {
                    console.log(
                        'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                        response
                    );
                    InventroyRealm.setLastMeterReadingSync();
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Delete Inventory failed ' +
                        error
                    );
                });
        }

        if (localMeterReading.active === true && localMeterReading.syncAction === 'update') {

            MeterReadingApi.updateMeterReading(
                localMeterReading
            )
                .then((response) => {
                    InventroyRealm.setLastMeterReadingSync();
                    console.log(
                        'Synchronization:synchronizeInventory - Removing Inventory from pending list - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Update Inventory failed ' +
                        error
                    );
                });

        }

        if (localMeterReading.active === false && localMeterReading.syncAction === 'update') {

            MeterReadingApi.createMeterReading(
                localMeterReading
            )
                .then((response) => {
                    InventroyRealm.synchedMeterReading(localMeterReading);
                    InventroyRealm.setLastMeterReadingSync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Create Inventory failed'
                    );
                });

        }

        if (localMeterReading.active === false && localMeterReading.syncAction === 'delete') {
            MeterReadingApi.createMeterReading(
                localMeterReading
            )
                .then((response) => {
                    InventroyRealm.synchedMeterReading(localMeterReading);
                    InventroyRealm.setLastMeterReadingSync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Create Inventory failed'
                    );
                });

        }
        console.log('here1');
        if (localMeterReading.active === false && localMeterReading.syncAction === 'create') {
            console.log('here31');
            MeterReadingApi.createMeterReading(
                localMeterReading
            )
                .then((response) => {
                    InventroyRealm.synchedMeterReading(localMeterReading);
                    InventroyRealm.setLastMeterReadingSync();
                    console.log(
                        'Synchronization:synced to remote - ' +
                        response
                    );
                })
                .catch(error => {
                    console.log(
                        'Synchronization:synchronizeInventory Create Inventory failed'
                    );
                });

        }
    }


}
export default new MeterReadingSync();
