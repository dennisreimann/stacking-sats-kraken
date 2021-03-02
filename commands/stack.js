module.exports = async (kraken, validate, { getEnv, getEnvOpt }) => {
  const [fiat, amount] = getEnv('KRAKEN_API_FIAT', 'KRAKEN_BUY_AMOUNT')
  const ordertype = getEnvOpt('KRAKEN_ORDER_TYPE', 'limit', ['limit', 'market'])

  // https://www.kraken.com/features/api
  const crypto = 'XBT'
  const pair = `${crypto}${fiat}`

  // Fetch and display information
  const { result: balance } = await kraken.api('Balance')
  const { result: ticker } = await kraken.api('Ticker', { pair })

  const fiatBalance = balance[`Z${fiat}`] || balance[fiat] || 0.0
  const cryptoBalance = balance[`X${crypto}`] || balance[crypto] || 0.0
  const [{ a: [a], b: [b] }] = Object.values(ticker)
  const ask = parseFloat(a)
  const bid = parseFloat(b)
  const price = bid

  // Calculate volume and adjust precision
  const volume = (amount / price).toFixed(8)

  console.log('💰  Balance:', fiatBalance, fiat, '/', cryptoBalance, crypto, '\n')
  console.log('📈  Ask:', ask, fiat)
  console.log('📉  Bid:', bid, fiat, '\n')

  // Place order
  const details = { pair, type: 'buy', ordertype, price, volume }
  if (validate) details.validate = true

  const { result: { descr: { order }, txid } } = await kraken.api('AddOrder', details)

  console.log('💸  Order:', order)
  if (txid) console.log('📎  Transaction ID:', txid.join(', '))
}
