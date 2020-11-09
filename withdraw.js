const assert = require('assert')
const Kraken = require('kraken-api')

const {
  KRAKEN_API_KEY: key,
  KRAKEN_API_SECRET: secret,
  KRAKEN_MAX_REL_FEE: max_fee,
  KRAKEN_WITHDRAW_KEY: wdr_key
} = process.env

assert(key && secret, 'Provide the KRAKEN_API_KEY and KRAKEN_API_SECRET environment variables.')
assert(max_fee && wdr_key, 'Provide the KRAKEN_MAX_REL_FEE and KRAKEN_WITHDRAW_KEY environment variables.')

// https://www.kraken.com/features/api
const kraken = new Kraken(key, secret)
const asset = 'XBT'
const validate = process.argv[2] === '--validate'

;(async () => {
  // Get withdrawal information
  // URL: https://api.kraken.com/0/private/WithdrawInfo
  const withdrawdetails = { asset, key: wdr_key, amount: 0 }
  try {
    const { result: { limit, fee } } = await kraken.api('WithdrawInfo', withdrawdetails);
    const rel_fee = 1/parseFloat(limit)*parseFloat(fee)
    console.log(`💡  Relative fee of withdrawal amount: ${(rel_fee*100).toFixed(2)}%`)

    // Place withdrawal when fee is low enough (relatively)
    if (rel_fee < max_fee/100) {
      console.log(`💰  Withdraw ${limit} ${asset} now.`)
      const withdraw = { asset, key: wdr_key, amount: limit }
      if (!validate) {
        try {
          const { result: { refid } } = await kraken.api('Withdraw', withdraw)
          if (refid) console.log(`📎  Withdrawal reference ID: ${refid}`)
        } catch (err) {
          console.log(`\n🚨  Failure:`, err.message)
        }
      }
    } else {
      console.log(`❌  Don't withdraw now. Fee is too high - max rel. fee: ${parseFloat(max_fee).toFixed(2)}%`);
    }
  } catch (err) {
    console.log(`\n🚨  Failure:`, err.message)
  }
  if (validate) console.log('\n🚨  THIS WAS JUST A VALIDATION RUN, NO WITHDRAWAL HAS BEEN PLACED!')
})()
