import { parseISO, isSameDay } from 'date-fns';
import CustomerDebtRealm from '../database/customer_debt/customer_debt.operations';
import OrderRealm from '../database/orders/orders.operations';
import ProductsRealm from '../database/products/product.operations';

import PaymentTypeRealm from '../database/payment_types/payment_types.operations';
import ReceiptPaymentTypeRealm from '../database/reciept_payment_types/reciept_payment_types.operations';

export const SALES_REPORT_FROM_ORDERS = 'SALES_REPORT_FROM_ORDERS';
export const INVENTORY_REPORT = 'INVENTORY_REPORT';
export const REPORT_FILTER = 'REPORT_FILTER';
export const REMINDER_REPORT = 'REMINDER_REPORT';
export const ADD_REMINDER = 'ADD_REMINDER';

export function GetSalesReportData(beginDate, previousDate) {
  return (dispatch) => {
    dispatch({
      type: SALES_REPORT_FROM_ORDERS,
      data: { salesData: { ...getSalesData(beginDate, previousDate), totalDebt: getTotalDebt(beginDate, previousDate) } },
    });
  };
}

function getTotalDebt(beginDate, previousDate) {
  const customerDebts = CustomerDebtRealm.getCustomerDebts();
  const filteredDebt = customerDebts.filter((debt) => isSameDay(parseISO(debt.created_at), beginDate));
  return filteredDebt.reduce((total, item) => (total + item.due_amount), 0);
}

export function setReportFilter(currentDate, previousDate) {
  return (dispatch) => {
    dispatch({
      type: REPORT_FILTER,
      data: { currentDate, previousDate },
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

function getTotalTypes(beginDate, filteredOrders) {
  const groupedTypes = { ...groupPaymentTypes(beginDate, filteredOrders) };
  const groupedTotals = [];
  const objKeys = [...Object.keys(groupedTypes)];
  let totalEarnings = 0;
  for (const key of objKeys) {
    const amount = groupedTypes[key].reduce((total, item) => total + item.amount, 0);
    groupedTotals.push({
      name: key,
      totalAmount: amount,
    });
    if (key !== 'credit' && key !== 'loan') {
      totalEarnings += amount;
    }
  }
  groupedTotals.push({
    name: 'TOTAL EARNINGS',
    totalAmount: totalEarnings,
  });

  return groupedTotals;
}

function groupPaymentTypes(beginDate, filteredOrders) {
  const types = [...comparePaymentTypeReceipts(beginDate, filteredOrders)];
  const result = types.reduce((r, a) => {
    r[a.name] = r[a.name] || [];
    r[a.name].push(a);
    return r;
  }, Object.create(null));
  return result;
}

function comparePaymentTypes(beginDate) {
  let filteredReceiptPaymentTypes = [];
  filteredReceiptPaymentTypes = ReceiptPaymentTypeRealm.getReceiptPaymentTypes().filter((receiptpayment) => isSameDay(parseISO(receiptpayment.created_at), beginDate));

  const paymentTypes = [...PaymentTypeRealm.getPaymentTypes()];
  const finalreceiptsPaymentTypes = [];
  for (const receiptsPaymentType of filteredReceiptPaymentTypes) {
    const rpIndex = paymentTypes.map((e) => e.id).indexOf(receiptsPaymentType.payment_type_id);
    if (rpIndex >= 0) {
      receiptsPaymentType.name = paymentTypes[rpIndex].name;
      finalreceiptsPaymentTypes.push(receiptsPaymentType);
    }
  }
  return finalreceiptsPaymentTypes;
}

function comparePaymentTypeReceipts(beginDate, receipts) {
  const receiptsPaymentTypes = comparePaymentTypes(beginDate);
  const customerReceipts = receipts;
  const paymentTypes = [];
  for (const receiptsPaymentType of receiptsPaymentTypes) {
    for (const customerReceipt of customerReceipts) {
      if (receiptsPaymentType.receipt_id === customerReceipt.id) {
        paymentTypes.push(receiptsPaymentType);
      }
    }
  }
  return paymentTypes;
}

const getSalesData = (beginDate) => {
  const orders = OrderRealm.getActiveOrders();
  const filteredOrders = orders.filter((receipt) => isSameDay(parseISO(receipt.created_at), beginDate) && receipt.is_delete !== 0);

  const totalTypes = getTotalTypes(beginDate, filteredOrders);
  const filteredOrderItems = filteredOrders.reduce((accumulator, currentValue) => [...accumulator, ...currentValue.receipt_line_items], []);

  const groupedOrderItems = groupBySku(filteredOrderItems, 'sku');

  const todaySales = [];
  for (const i of Object.getOwnPropertyNames(groupedOrderItems)) {
    const totalAmount = totalByProperty(groupedOrderItems[i], 'price_total');
    todaySales.push({
      sku: groupedOrderItems[i][0].product.sku,
      wastageName: groupedOrderItems[i][0].product.wastageName,
      description: groupedOrderItems[i][0].product.description,
      quantity: groupedOrderItems[i][0].product.description.includes('delivery') || groupedOrderItems[i][0].product.description.includes('discount') ? 1 : totalByProperty(groupedOrderItems[i], 'quantity'),
      category: groupedOrderItems[i][0].product.category_id ? Number(groupedOrderItems[i][0].product.category_id) : Number(groupedOrderItems[i][0].product.categoryId),
      pricePerSku: parseFloat(groupedOrderItems[i][0].price_total) / totalByProperty(groupedOrderItems[i], 'quantity'),
      totalSales: groupedOrderItems[i][0].product.description.includes('delivery') || groupedOrderItems[i][0].product.description.includes('discount')
        ? parseFloat(totalAmount)
        : parseFloat(totalAmount),
      // * totalByProperty(groupedOrderItems[i], "quantity"),
      litersPerSku: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) : Number(groupedOrderItems[i][0].product.unitPerProduct),
      totalLiters: groupedOrderItems[i][0].product.unit_per_product ? Number(groupedOrderItems[i][0].product.unit_per_product) * totalByProperty(groupedOrderItems[i], 'quantity') : Number(groupedOrderItems[i][0].product.unitPerProduct) * totalByProperty(groupedOrderItems[i], 'quantity'),
    });
  }

  const finalData = {
    totalLiters: totalByProperty(todaySales, 'totalLiters'),
    totalSales: totalByProperty(todaySales, 'totalSales'),
    salesItems: todaySales,
    totalTypes,
  };
  return { ...finalData };
};
