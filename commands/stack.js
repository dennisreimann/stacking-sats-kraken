module.exports = async (kraken, validate, getEnv) => {
  const [fiat, amount] = getEnv('KRAKEN_API_FIAT', 'KRAKEN_BUY_AMOUNT')

  // https://www.kraken.com/features/api
  const crypto = 'XBT'
  const pair = `X${crypto}Z${fiat}`

  // Fetch and display information
  const { result: { [`Z${fiat}`]: fiatBalance, [`X${crypto}`]: cryptoBalance } } = await kraken.api('Balance')
  const { result: { [pair]: { a: [a], b: [b] } } } = await kraken.api('Ticker', { pair })

  const ask = parseFloat(a)
  const bid = parseFloat(b)
  const price = bid

  // Calculate volume and adjust precision
  const volume = (amount / price).toFixed(8)

  console.log('💰  Balance:', fiatBalance, fiat, '/', cryptoBalance, crypto, '\n')
  console.log('📈  Ask:', ask, fiat)
  console.log('📉  Bid:', bid, fiat, '\n')

  // Place order
  const details = { pair, type: 'buy', ordertype: 'limit', price, volume }
  if (validate) details.validate = true

  const { result: { descr: { order }, txid } } = await kraken.api('AddOrder', details)

  console.log('💸  Order:', order)
  if (txid) console.log('📎  Transaction ID:', txid.join(', '))
}
