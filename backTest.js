const axios = require('axios');
const { createObjectCsvWriter } = require('csv-writer');
const fs = require('fs');

function getDateRangePairs(startDate) {
  const interval = 199; // Interval in days
  const datePairs = [];

  const currentDate = new Date(startDate);
  const today = new Date();

  while (currentDate <= today) {
    const endDate = new Date(currentDate);
    endDate.setDate(endDate.getDate() + interval);

    const datePair = [currentDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
    datePairs.push(datePair);

    currentDate.setDate(currentDate.getDate() + interval + 1);
  }

  return datePairs;
}
// Usage example
// const startDate = '2018-01-01';
// const dateRangePairs = getDateRangePairs(startDate);
const options = {
  method: 'GET',
  url: 'https://kite.zerodha.com/oms/instruments/historical/260105/day',
  params: {
    user_id: 'US9739',
    oi: '1',
    from: '2023-01-01',
    to: '2023-05-15',
  },
  headers: {
    accept: 'application/json, text/plain, */*',
    'accept-language': 'en-US,en;q=0.9',
    authorization:
      'enctoken o/J8yA+QyAU7uwrkpuGa5IxYgrhZrWNRwC/LNgl1mfNe3upbNv1ymbffXczmEIWEhROZ2xDhVbXbBa0obXGbR47JGxj4hTjHXh4kebhgMNgUQHOWjSvXLQ==',
    'if-none-match': 'W/"af80579ce111d4d861d1dcb1deaf4833"',
    'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"Windows"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'sec-gpc': '1',
    cookie:
      'kf_session=9Py64Bv5UEtY1hYOqXVvZQ8wgahwrkPb; _cfuvid=pnNEraDpWdlMoIRxaV8XwC7JgiSgZu9DvZdC1ZFcV6I-1685127604924-0-604800000; user_id=US9739; public_token=uF7XRY3zXlmtkY7quyNut90AiwBmr6G0; enctoken=o/J8yA+QyAU7uwrkpuGa5IxYgrhZrWNRwC/LNgl1mfNe3upbNv1ymbffXczmEIWEhROZ2xDhVbXbBa0obXGbR47JGxj4hTjHXh4kebhgMNgUQHOWjSvXLQ==',
    Referer: 'https://kite.zerodha.com/chart/web/tvc/NSE/SBIN/779521',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
};

let data;

// Function to convert candle data to CSV format
function candlesToCSV(candles) {
  console.log('candles == ', candles);

  let csv = 'Date,Open,High,Low,Close,Volume,Open Interest\n';
  for (const candle of candles) {
    csv += `${candle[0]},${candle[1]},${candle[2]},${candle[3]},${candle[4]},${candle[5]},${candle[6]}\n`;
  }
  return csv;
}
const callApi = async (from, to) => {
  // here we are setup start date and end date variable

  if (from && to) {
    options.params.from = from;
    options.params.to = to;
  }

  console.log(' === options ====', options);

  const result = await axios.request(options);
  // .then(function (response) {
  //   // Write the candle data to a CSV file
  //   // fs.writeFile('ril.csv', candlesToCSV(response.data.data.candles), (err) => {
  //   //   if (err) throw err;
  //   //   console.log('Candles saved to wipro.csv');
  //   // });
  //
  //   // console.log('response.data ===', response.data);
  //   // data = response.data;
  //   return response.data;
  // })
  // .catch(function (error) {
  //   console.error('error ===', error);
  // });

  // console.log(' === result ====', result.data.data.candles);
  return result.data.data.candles;
};

const generateCsvFile = async () => {
  const startDate = '2018-01-01';

  const dateRangePairs = getDateRangePairs(startDate);
  const candleDataPromises = dateRangePairs.map(async (item) => {
    const getData = await callApi(item[0], item[1]);
    return getData;
  });

  const candleData = await Promise.all(candleDataPromises);
  const columnNames = 'Date,Open,High,Low,Close,Volume,Open Interest\n';

  // Format the candle data into CSV rows
  const csvRows = candleData.flat().map((candle) => {
    const formattedRow = `${candle[0]},${candle[1]},${candle[2]},${candle[3]},${candle[4]},${candle[5]},${candle[6]}`;
    return formattedRow;
  });

  // Concatenate column names and CSV rows
  const csvContent = columnNames + csvRows.join('\n');

  // Write the candle data to a CSV file
  fs.writeFile('bankNifty.csv', csvContent, (err) => {
    if (err) throw err;
    console.log('Candles saved to bankNifty.csv');
  });

  // console.log('candleData ===', candleData);
};

generateCsvFile();

//
// //
// // fetch("https://kite.zerodha.com/oms/instruments/historical/256265/15minute?user_id=US9739&oi=1&from=2023-04-29&to=2023-05-15", {
// //   "headers": {
// //     "accept": "application/json, text/plain, */*",
// //     "accept-language": "en-US,en;q=0.9",
// //     "authorization": "enctoken qmvwPr1tbyJaVHl2o9xUYdXO3ArNRfQcOnjzsQvE4fNSO8DrDYWPJ26BsQEjgQ7w+hhQ18+Wgm8gn833Mk8KPC9m3xaGTUJrhSIQNu6WPmLPGirC3mCnIg==",
// //     "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
// //     "sec-ch-ua-mobile": "?0",
// //     "sec-ch-ua-platform": "\"Windows\"",
// //     "sec-fetch-dest": "empty",
// //     "sec-fetch-mode": "cors",
// //     "sec-fetch-site": "same-origin",
// //     "sec-gpc": "1",
// //     "cookie": "kf_session=JU3p295J0PY67CrAUilV5or8F8mmjQYp; _cfuvid=OAPw3j56ufxWhG.bGaiwTRWkwzd8zJ4nDXURAMkA0jI-1684173445627-0-604800000; user_id=US9739; public_token=KtKZLZdbvlSpppesfwyUloKrmJOeRaIl; enctoken=qmvwPr1tbyJaVHl2o9xUYdXO3ArNRfQcOnjzsQvE4fNSO8DrDYWPJ26BsQEjgQ7w+hhQ18+Wgm8gn833Mk8KPC9m3xaGTUJrhSIQNu6WPmLPGirC3mCnIg==",
// //     "Referer": "https://kite.zerodha.com/chart/web/tvc/INDICES/NIFTY%2050/256265",
// //     "Referrer-Policy": "strict-origin-when-cross-origin"
// //   },
// //   "body": null,
// //   "method": "GET"
// // });
//
//
// fetch("https://kite.zerodha.com/oms/instruments/historical/738561/30minute?user_id=US9739&oi=1&from=2023-03-15&to=2023-04-14", {
//     "headers": {
//         "accept": "application/json, text/plain, */*",
//         "accept-language": "en-US,en;q=0.9",
//         "authorization": "enctoken qmvwPr1tbyJaVHl2o9xUYdXO3ArNRfQcOnjzsQvE4fNSO8DrDYWPJ26BsQEjgQ7w+hhQ18+Wgm8gn833Mk8KPC9m3xaGTUJrhSIQNu6WPmLPGirC3mCnIg==",
//         "sec-ch-ua": "\"Google Chrome\";v=\"113\", \"Chromium\";v=\"113\", \"Not-A.Brand\";v=\"24\"",
//         "sec-ch-ua-mobile": "?0",
//         "sec-ch-ua-platform": "\"Windows\"",
//         "sec-fetch-dest": "empty",
//         "sec-fetch-mode": "cors",
//         "sec-fetch-site": "same-origin",
//         "sec-gpc": "1",
//         "cookie": "kf_session=JU3p295J0PY67CrAUilV5or8F8mmjQYp; _cfuvid=OAPw3j56ufxWhG.bGaiwTRWkwzd8zJ4nDXURAMkA0jI-1684173445627-0-604800000; user_id=US9739; public_token=KtKZLZdbvlSpppesfwyUloKrmJOeRaIl; enctoken=qmvwPr1tbyJaVHl2o9xUYdXO3ArNRfQcOnjzsQvE4fNSO8DrDYWPJ26BsQEjgQ7w+hhQ18+Wgm8gn833Mk8KPC9m3xaGTUJrhSIQNu6WPmLPGirC3mCnIg==",
//         "Referer": "https://kite.zerodha.com/chart/web/tvc/NSE/RELIANCE/738561",
//         "Referrer-Policy": "strict-origin-when-cross-origin"
//     },
//     "body": null,
//     "method": "GET"
// });

// fetch('https://kite.zerodha.com/oms/instruments/historical/779521/day?user_id=US9739&oi=1&from=2022-05-01&to=2022-05-31', {
//   headers: {
//     accept: 'application/json, text/plain, */*',
//     'accept-language': 'en-US,en;q=0.9',
//     authorization:
//       'enctoken o/J8yA+QyAU7uwrkpuGa5IxYgrhZrWNRwC/LNgl1mfNe3upbNv1ymbffXczmEIWEhROZ2xDhVbXbBa0obXGbR47JGxj4hTjHXh4kebhgMNgUQHOWjSvXLQ==',
//     'if-none-match': 'W/"af80579ce111d4d861d1dcb1deaf4833"',
//     'sec-ch-ua': '"Google Chrome";v="113", "Chromium";v="113", "Not-A.Brand";v="24"',
//     'sec-ch-ua-mobile': '?0',
//     'sec-ch-ua-platform': '"Windows"',
//     'sec-fetch-dest': 'empty',
//     'sec-fetch-mode': 'cors',
//     'sec-fetch-site': 'same-origin',
//     'sec-gpc': '1',
//     cookie:
//       'kf_session=9Py64Bv5UEtY1hYOqXVvZQ8wgahwrkPb; _cfuvid=pnNEraDpWdlMoIRxaV8XwC7JgiSgZu9DvZdC1ZFcV6I-1685127604924-0-604800000; user_id=US9739; public_token=uF7XRY3zXlmtkY7quyNut90AiwBmr6G0; enctoken=o/J8yA+QyAU7uwrkpuGa5IxYgrhZrWNRwC/LNgl1mfNe3upbNv1ymbffXczmEIWEhROZ2xDhVbXbBa0obXGbR47JGxj4hTjHXh4kebhgMNgUQHOWjSvXLQ==',
//     Referer: 'https://kite.zerodha.com/chart/web/tvc/NSE/SBIN/779521',
//     'Referrer-Policy': 'strict-origin-when-cross-origin',
//   },
//   body: null,
//   method: 'GET',
// });
