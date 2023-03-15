import { Mongoose } from 'mongoose';
import contentType from './content-type.json';
/* eslint-disable */
export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index += 1) {
    await callback(array[index], index, array);
  }
};

/* eslint-enable */
/**
 * Check Whether Object is Mongoose Model
 * @param object
 * @returns {boolean}
 */
export const isMongooseModel = (object = {}) => {
  return object instanceof Mongoose.prototype.Model;
};

/**
 * Check Whether Object is Mongoose Documents
 * @param object
 * @returns {boolean}
 */
export const isMongooseDocument = (object = {}) => {
  return object instanceof Mongoose.prototype.Document;
};

/**
 * Check Whether Object is Mongoose ObjectId
 * @param data
 * @returns {boolean}
 */
export const isObjectId = (data = {}) => {
  return Mongoose.prototype.isValidObjectId(data);
};

/**
 * @param {String} string
 * @returns {string}
 */
export const capitalizeFirstLetter = (string = '') => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 *
 * @returns {number}
 */
export const generateOtp = () => {
  return Math.floor(1000 + Math.random() * 9000);
};

export const transFormCardResponse = (paymentMethod) => {
  const {
    card: { exp_month: expMonth, exp_year: expYear, last4 },
    billing_details: {
      address: { city, country, line1, line2, postal_code: postalCode, state },
      name,
    },
    id,
  } = paymentMethod;
  return { expMonth, expYear, last4, id, city, country, line1, line2, postalCode, state, name };
};

export const transFormAccountResponse = (account) => {
  const { object } = account;
  if (object === 'bank_account') {
    const { bank_name: bankName, country, last4, routing_number: routingNumber } = account;
    return { type: 'payout', object, bankName, country, last4, routingNumber };
  }
  if (object === 'card') {
    const { brand, country, exp_month: expMonth, exp_year: expYear, funding, last4 } = account;
    return { type: 'payout', object, brand, country, expMonth, expYear, funding, last4 };
  }
  return {};
};

export const getUserField = (field = '') => {
  return `firstName lastName ${field}`;
};
/* eslint-disable */
export function sortObjectByKeys(o) {
  return Object.keys(o)
    .sort()
    .reduce((r, k) => ((r[k] = o[k]), r), {});
}

/* eslint-enable */
export const getBatchedIterable = async function* (cursor, batchSize) {
  let batch = [];
  let hasNext = false;
  do {
    /* eslint-disable no-await-in-loop */
    const item = await cursor.next();
    /* eslint-enable no-await-in-loop */
    hasNext = !!item;
    if (hasNext) batch.push(item);
    if (batch.length === batchSize) {
      yield batch;
      batch = [];
    }
  } while (hasNext);
  if (batch.length) yield batch;
};

export const getQueueUrlFromArn = (arn, sqs) => {
  const accountId = arn.split(':')[4];
  const queueName = arn.split(':')[5];
  return `${sqs.endpoint.href + accountId}/${queueName}`;
};

export const validUrl = (s) => {
  try {
    const url = new URL(s);
    return url;
  } catch (err) {
    return false;
  }
};

export const addDays = (theDate, days) => {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
};

export const getMimeType = (allowedExtension) => {
  return allowedExtension.map((ext) => {
    const obj = contentType.find((c) => c.key === ext);
    return obj ? obj.mimeType : '';
  });
};
