// import moment from 'moment/moment';

const moment = require('moment/moment');



const fs = require('fs');
const csv = require('csv-parser');

const results = [];


function buyOnDip(candleData, options, symbol) {
    const { up, down, stopLoss } = options;

    console.log('up ---', up)
    console.log('down ---', down)
    console.log('stopLoss ---', stopLoss)
    if (!up || !down || !stopLoss) {
        throw new Error('please provide value of up, down and stopLoss');
    }
    let peakValue = 0;
    let floorValue = 0;
    let tradeGoingOn = false;
    let profitPercent = 0;

    let lossPercent = 0;
    const initialCapital = 100000;
    const capital = initialCapital;
    const trade = [];

    let entryPrice = 0;
    let entryTime = 0;
    let exitPrice = 0;
    let exitTime = 0;
    let reasonForExit;
    let totalProfit = 0;
    let totalLoss = 0;
    let totalProfitPercent = 0;
    let totalLossPercent = 0;
    let profitPerTrade = 0;
    let lossPerTrade = 0;
    let startTrade = 0;
    let candleLength = 0

    candleData.filter((data, index, candle) => {
        const currentValue = data.close;
        if (!tradeGoingOn) {
            if (peakValue < currentValue) {
                peakValue = currentValue;
            }
            // for enter position
            /**
             * check for enter position,
             * if price percent change from peakValue is more than down value then enter into position at next candle and entryPrice is open value of that candle.
             */
            if (currentValue <= peakValue) {
                const percentageReduceChange = ((peakValue - currentValue) / peakValue) * 100;
                if (percentageReduceChange >= down) {
                    /**
                     * if candleData length is equal to next candle than that is last candle, and we not trade into that.
                     * */
                    if (candle.length !== candle[index + 1]) {
                        entryPrice = candle[index + 1].open;
                        entryTime = candle[index + 1].openTime;
                        floorValue = candle[index + 1].open;
                        tradeGoingOn = true;
                        startTrade = index + 1
                    }
                }
            }
        }

        /**
         * check for exit position,
         * There is two reason for exit , first is profit-exit and second is stop-loss
         */
        if (tradeGoingOn) {
            /**
             * check for the profitable trade
             * if the price increase and price change percent from entryPrice is more than or equal to up value then exit, and exitPrice is candle's close value and exitTime is candle's time.
             * */
            if (currentValue > floorValue) {
                const percentageUpwardChange = ((currentValue - floorValue) / floorValue) * 100;
                if (percentageUpwardChange >= up) {
                    // here we exit on target value (up) basis.
                    exitPrice = entryPrice + (entryPrice / 100) * up;

                    exitPrice = data.close;
                    peakValue = currentValue;
                    exitTime = data.openTime;
                    reasonForExit = 'profit-exit';
                    profitPercent = ((exitPrice - floorValue) / floorValue) * 100;
                    totalProfitPercent += profitPercent;
                    profitPerTrade += exitPrice - entryPrice;
                    totalProfit += (capital * profitPercent) / 100;

                    // console.log('total profit ---', totalProfit)

                    // console.log('totalProfit=> ', totalProfit);
                    trade.push({
                        entryTime: entryTime.toLocaleString(),
                        entryPrice,
                        exitTime: exitTime.toLocaleString(),
                        exitPrice,
                        profit: exitPrice - entryPrice,
                        profitPct: profitPercent,
                        growth: capital / initialCapital,
                        holdingPeriod: moment(exitTime).diff(moment(entryTime), 'minutes') - 1,
                        reasonForExit,
                        candleLength: index - startTrade
                    });
                    /**
                     * after exit reset values for the next entry
                     * */
                    entryPrice = 0;
                    entryTime = 0;
                    exitPrice = 0;
                    startTrade = 0;
                    exitTime = 0;
                    reasonForExit = null;
                    tradeGoingOn = false;
                }
            }

            /**
             * check for the stopLoss
             * if the price drop and price change percent from entryPrice is reach to stopLoss value then exit, and exitPrice is price when stopLoss hit and exitTime is candle's time.
             * currently exit on stop loss basis,
             *  */
            if (currentValue < floorValue) {
                const stopLossPr = ((floorValue - currentValue) / floorValue) * 100;
                if (stopLossPr >= stopLoss) {
                    // here we exit on stop loss basis.
                    exitPrice = entryPrice - (entryPrice / 100) * stopLoss;
                    //   for close basis stop loss   ===> ( exitPrice = data.close)
                    exitTime = data.openTime;
                    peakValue = currentValue;
                    reasonForExit = 'stop-loss';
                    lossPercent = ((floorValue - exitPrice) / floorValue) * 100;


                    // console.log('---- loss ---', lossPercent)
                    lossPerTrade += exitPrice - entryPrice;
                    totalLossPercent += stopLoss;
                    // for close basis stop loss     ===>  (totalLossPercent += lossPercent)
                    totalLoss += (capital * stopLoss) / 100;

                    // console.log('total loss -- ', totalLoss)

                    //   for close basis stop loss     ===>  totalLoss += ((capital * lossPercent) /100)
                    trade.push({
                        entryTime: entryTime.toLocaleString(),
                        entryPrice,
                        exitTime: exitTime.toLocaleString(),
                        exitPrice,
                        profit: exitPrice - entryPrice,
                        profitPct: -lossPercent,
                        growth: capital / initialCapital,
                        holdingPeriod: moment(exitTime).diff(moment(entryTime), 'minutes'),
                        reasonForExit,
                        candleLength: index - startTrade

                    });
                    /**
                     * after exit reset values for the next entry
                     * */
                    entryPrice = 0;
                    entryTime = 0;
                    exitPrice = 0;
                    startTrade = 0;
                    exitTime = 0;
                    reasonForExit = null;
                    tradeGoingOn = false;
                }
            }
        }
        return trade;
    });

    const totalStopLoss = trade.filter((data) => data.reasonForExit === 'stop-loss');
    const numWinningTrades = trade.length - totalStopLoss.length;
    const numLosingTrades = totalStopLoss.length;
    const exchangeFees = 60 * trade.length
    // const exchangeFees = (trade.length * initialCapital * 2 * 0.4) / 100;
    const finalReturn = totalProfit - totalLoss;
    const finalCapital = capital + (capital * (totalProfitPercent - totalLossPercent)) / 100;

    const analysis = {
        tradeParameters: {
            up,
            down,
            stopLoss,
            symbol,
        },
        fixCapitalOnEveryTrade: initialCapital,
        overAllProfitPercent: totalProfitPercent - totalLossPercent,
        totalTrades: trade.length,
        numWinningTrades,
        numLosingTrades,
        ...(trade.length && {
            pctWinningTrade: (numWinningTrades / trade.length) * 100,
            pctLosingTrade: (numLosingTrades / trade.length) * 100,
        }),
        ...(numWinningTrades && {
            averageProfitPerWinningTrade: profitPerTrade / numWinningTrades,
            averageProfitPercentPerWinningTrade: totalProfitPercent / numWinningTrades,
        }),
        ...(numLosingTrades && {
            averageLossPerLosingTrade: lossPerTrade / numLosingTrades,
            averageLossPercentPerLosingTrade: totalLossPercent / numLosingTrades,
        }),
        totalProfitOnFixedCapital: totalProfit,
        totalLossOnFixedCapital: totalLoss,
        finalReturn,
        finalCapital,
        // exchangeFees =>(( total trade * initialCapital) * 2) * ( 0.4)  // 0.4 is fees of exchange
        exchangeFees,
        // final amount =? (final amount - fees ) - initialCapital
        finalAmount: finalCapital - exchangeFees - initialCapital,
    };


    // console.log('trade ===', trade)
    console.log('analysis ===', analysis)
    // return { trade, analysis };
}

// 1, 1.5 0.7 - n50  1, 1.6, 0.8   0.4, 0.6, 0.3,   0.6,0.8,0.5
// 0.7 1 0.3  - ril


const parameters = {
    up: 0.8,
    down: 1.2,
    stopLoss: 0.3,
};
fs.createReadStream('nifty50.csv')
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', () => {

        const candles = results.map((items) => {
            return {
                open: items.Open,
                close: items.Close,
                openTime: items.Date,
                ...items
            }
        })

        buyOnDip(candles,parameters, 'wipro' )
    });



