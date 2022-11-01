module.exports = async (kraken, validate, { getEnv, getEnvOpt }) => {
  const [fiat, amount, feeCurrency] = getEnv('KRAKEN_API_FIAT', 'KRAKEN_BUY_AMOUNT', 'KRAKEN_FEE_CURRENCY')
  const ratio = getEnvOpt('KRAKEN_BUY_RATIO', '1.0')
  const ordertype = getEnvOpt('KRAKEN_ORDER_TYPE', 'limit', ['limit', 'market'])
  // if living in Germany, one needs to add an additional parameter to explicitly agree to the trade
  // if the parameter is not set one will get the following error: EOrder:Trading agreement required
  // see https://support.kraken.com/hc/en-us/articles/360000920026--Trading-agreement-required-error-for-German-residents
  const trading_agreement = getEnvOpt('KRAKEN_GERMANY_TRADING_AGREEMENT', '', ['agree', ''])

  // https://www.kraken.com/features/api
  const crypto = 'XBT'
  const pair = `${crypto}${fiat}`

  // for explanation of oflags see https://www.kraken.com/features/api#add-standard-order
  var fee = ""
  if (feeCurrency == crypto) {
    fee = "fcib"
  } else if (feeCurrency == fiat) {
    fee = "fciq"
  } else {
    fee = ""
  }

  // Fetch and display information
  const { result: balance } = await kraken.api('Balance')
  const { result: ticker } = await kraken.api('Ticker', { pair })

  const fiatBalance = balance[`Z${fiat}`] || balance[fiat] || 0.0
  const cryptoBalance = balance[`X${crypto}`] || balance[crypto] || 0.0
  const [{ a: [a], b: [b] }] = Object.values(ticker)
  const ask = parseFloat(a)
  const bid = parseFloat(b)
  const price = Math.round( bid * ratio * 10 ) / 10

  // Calculate volume and adjust precision
  const volume = (amount / price).toFixed(8)

  console.log('💰  Balance:', fiatBalance, fiat, '/', cryptoBalance, crypto, '\n')
  console.log('📈  Ask:', ask, fiat)
  console.log('📉  Bid:', bid, fiat, '(', ( ratio * 100 ), '%', ')')
  console.log('🏷️  Price:', price, fiat, "/", "XBT")
  console.log('\n')

  if (parseFloat(fiatBalance) < parseFloat(amount)) {
    console.log('❌  Insufficient funds')
    return
  }

  // Place order
  const details = { pair, type: 'buy', ordertype, price, volume }
  if (validate) details.validate = true
  if (trading_agreement) details.trading_agreement = trading_agreement
  if (fee) details.oflags = fee

  const { result: { descr: { order }, txid } } = await kraken.api('AddOrder', details)

  console.log('💸  Order:', order)
  if (txid) console.log('📎  Transaction ID:', txid.join(', '))
}
