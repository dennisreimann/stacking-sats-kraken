const assert = require('assert')
const Kraken = require('kraken-api')

const {
  KRAKEN_API_KEY: key,
  KRAKEN_API_SECRET: secret,
  KRAKEN_API_FIAT: fiat,
  KRAKEN_BUY_AMOUNT: amount
} = process.env

assert(key && secret, 'Provide the KRAKEN_API_KEY and KRAKEN_API_SECRET environment variables.')
assert(fiat && amount, 'Provide the KRAKEN_API_FIAT and KRAKEN_BUY_AMOUNT environment variables.')

// https://www.kraken.com/features/api
const kraken = new Kraken(key, secret)
const crypto = 'XBT'
const pair = `X${crypto}Z${fiat}`
const validate = process.argv[2] === '--validate'

;(async () => {
  // Fetch and display information
  const { result: { [`Z${fiat}`]: fiatBalance, [`X${crypto}`]: cryptoBalance } } = await kraken.api('Balance')
  const { result: { [pair]: { a: [a], b: [b] } } } = await kraken.api('Ticker', { pair })

  const ask = parseFloat(a)
  const bid = parseFloat(b)
  const price = bid

  // Calculate volume and adjust precision
  const volume = (amount / price).toFixed(8)

  console.log('\n')
  console.log('💰  Balance:', fiatBalance, fiat, '/', cryptoBalance, crypto, '\n')
  console.log('📈  Ask:', ask, fiat)
  console.log('📉  Bid:', bid, fiat, '\n')
  console.log('🧾  Order:', volume, crypto, 'at', price, fiat, '\n')

  // Place order
  try {
    const details = { pair, type: 'buy', ordertype: 'limit', price, volume }
    if (validate) details.validate = true

    const { result: { descr: { order }, txid } } = await kraken.api('AddOrder', details)

    console.log('💸  Placed order:', order, '/ TXID:', txid, '\n')
  } catch (err) {
    console.log(`🚨  Failure:`, err.message, '\n')
  } finally {
    if (validate) console.warn('🚨  THIS WAS JUST A VALIDATION RUN, NO ORDER HAS BEEN PLACED!', '\n')
  }
})()
