module.exports = async (kraken, validate, getEnv) => {
  const [maxFee, key] = getEnv('KRAKEN_MAX_REL_FEE', 'KRAKEN_WITHDRAW_KEY')

  // https://api.kraken.com/0/private/WithdrawInfo
  const asset = 'XBT'
  const withdrawdetails = { asset, key, amount: 0 }

  // Get withdrawal information
  const { result: { limit, fee } } = await kraken.api('WithdrawInfo', withdrawdetails)
  const relFee = 1/parseFloat(limit)*parseFloat(fee)

  console.log(`💡  Relative fee of withdrawal amount: ${(relFee*100).toFixed(2)}%`)

  // Place withdrawal when fee is low enough (relatively)
  if (relFee < maxFee/100) {
    console.log(`💰  Withdraw ${limit} ${asset} now.`)
    const withdraw = { asset, key, amount: limit }
    if (!validate) {
      const { result: { refid } } = await kraken.api('Withdraw', withdraw)
      if (refid) console.log(`📎  Withdrawal reference ID: ${refid}`)
    }
  } else {
    console.log(`❌  Fee is too high - max rel. fee: ${parseFloat(maxFee).toFixed(2)}%`)
  }
}
