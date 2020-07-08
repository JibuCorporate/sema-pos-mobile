import { parseISO, isSameDay } from 'date-fns';
import ProductMRPRealm from '../database/productmrp/productmrp.operations';
import OrderRealm from '../database/orders/orders.operations';
import InventroyRealm from '../database/inventory/inventory.operations';

export const SALES_REPORT_FROM_ORDERS = 'SALES_REPORT_FROM_ORDERS';
export const INVENTORY_REPORT = 'INVENTORY_REPORT';
export const REPORT_TYPE = 'REPORT_TYPE';
export const REPORT_FILTER = 'REPORT_FILTER';

export function GetInventoryReportData(beginDate, previousDate, products) {
  return (dispatch) => {
    getWastageData(beginDate, previousDate, getMrps(products))
      .then((inventoryData) => {
        dispatch({
          type: INVENTORY_REPORT,
          data: { inventoryData },
        });
      })
      .catch((error) => {
        dispatch({
          type: INVENTORY_REPORT,
          data: { inventoryData: [] },
        });
      });
  };
}

function groupBySku(objectArray, property) {
  return objectArray.reduce((acc, obj) => {
    const key = obj.product[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
}

function totalByProperty(objectArray, property) {
  return objectArray.reduce((accumulator, currentValue) => accumulator + (!isNaN(Number(currentValue[property])) ? Number(currentValue[property]) : 0), 0);
}

const getSalesData = (beginDate) => {
  const orders = OrderRealm.getActiveOrders();
  const filteredOrders = orders.filter((receipt) => isSameDay(parseISO(receipt.created_at), beginDate));

  const filteredOrderItems = filteredOrders.reduce((accumulator, currentValue) => [...accumulator, ...currentValue.receipt_line_items], []);

  const groupedOrderItems = groupBySku(filteredOrderItems, 'sku');

  const todaySales = [];
  for (const i of Object.getOwnPropertyNames(groupedOrderItems)) {
    todaySales.push({
      sku: groupedOrderItems[i][0].product.sku,
      wastageName: groupedOrderItems[i][0].product.wastage_name ? groupedOrderItems[i][0].product.wastage_name : groupedOrderItems[i][0].product.wastageName,
      description: groupedOrderItems[i][0].product.description,
      quantity: totalByProperty(groupedOrderItems[i], 'quantity'),
      category: groupedOrderItems[i][0].product.category_id ? Number(groupedOrderItems[i][0].product.category_id) : Number(groupedOrderItems[i][0].product.categoryId),
      litersPerSku: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) : Number(groupedOrderItems[i][0].product.unitPerProduct),
      totalLiters: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) * totalByProperty(groupedOrderItems[i], 'quantity') : Number(groupedOrderItems[i][0].product.unitPerProduct) * totalByProperty(groupedOrderItems[i], 'quantity'),
    });
  }

  const finalData = {
    totalLiters: totalByProperty(todaySales, 'totalLiters'),
    salesItems: todaySales,
  };

  return { ...finalData };
};

export const getMrps = (products) => {
  const productMrp = ProductMRPRealm.getFilteredProductMRP();
  const ids = Object.keys(productMrp).map((key) => productMrp[key].productId);
  const filProduct = products.map((e) => {
    delete e.base64encodedImage;
    return { ...e };
  });
  const matchProducts = filProduct.filter((prod) => ids.includes(prod.productId));
  const waterProducts = matchProducts.filter((prod) => prod.categoryId === 3);
  return waterProducts;
};

export const getWastageData = (beginDate, previousDate, products) => new Promise((resolve, reject) => {
  getInventoryItem(beginDate, previousDate)
    .then((inventorySettings) => {
      const inventoryData = createInventory(
        getSalesData(beginDate),
        inventorySettings,
        products,
      );

      resolve(inventoryData);
    })
    .catch((error) => {
      reject(error);
    });
});

const createInventory = (salesData, inventorySettings, products) => {
  const salesAndProducts = { ...salesData };
  salesAndProducts.salesItems = salesData.salesItems.slice();
  const emptyProducts = [];

  for (const prod of products) {
    if (isNotIncluded(prod, salesAndProducts.salesItems)) {
      emptyProducts.push({
        sku: prod.sku,
        description: prod.description,
        quantity: 0,
        totalLiters: 0,
        litersPerSku: prod.unitPerProduct,
        wastageName: prod.wastageName,
      });
    }
  }

  salesAndProducts.salesItems = salesAndProducts.salesItems.concat(
    emptyProducts,
  );

  const groupWastageName = groupBy('wastageName');
  const salesArray = Object.values(groupWastageName(salesAndProducts.salesItems));

  const newSalesArray = [];
  for (const i in salesArray) {
    litersTotal = 0;
    litersPerSkuTotal = 0;
    quantityTotal = 0;
    for (const a in salesArray[i]) {
      if (salesArray[i][a].wastageName != null) {
        litersTotal += salesArray[i][a].totalLiters;
        litersPerSkuTotal += salesArray[i][a].litersPerSku;
        quantityTotal += salesArray[i][a].quantity;
      }
    }
    if (salesArray[i][0].wastageName != null) {
      newSalesArray.push({
        wastageName: salesArray[i][0].wastageName,
        // totalSales: salesTotal,
        totalLiters: litersTotal,
        litersPerSku: litersPerSkuTotal,
        quantity: quantityTotal,
      });
    }
  }

  salesAndProducts.salesItems = newSalesArray;
  const inventoryData = {
    salesAndProducts,
    inventory: inventorySettings,
  };

  return inventoryData;
};

const isNotIncluded = (product, salesAndProducts) => {
  for (let index = 0; index < salesAndProducts.length; index++) {
    if (salesAndProducts[index].wastageName == product.wastageName) {
      return false;
    }
  }
  return true;
};

const groupBy = (key) => (array) => array.reduce((objectsByKeyValue, obj) => {
  const value = obj[key];
  objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
  return objectsByKeyValue;
}, {});

addDays = (theDate, days) => new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);

const getInventoryItem = (beginDate, yesterday) => new Promise((resolve) => {
  const promiseToday = InventroyRealm.getWastageReportByDate(beginDate);

  const promiseYesterday = InventroyRealm.getWastageReportByDate(yesterday);
  Promise.all([promiseToday, promiseYesterday]).then((inventoryResults) => {
    resolve({
      date: beginDate,
      currentMeter: inventoryResults[0].currentMeter,
      currentProductSkus: inventoryResults[0].currentProductSkus,
      previousMeter: inventoryResults[1].currentMeter,
      previousProductSkus: inventoryResults[1].currentProductSkus,
    });
  });
});
