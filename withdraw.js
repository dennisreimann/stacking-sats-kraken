const assert = require('assert')
const Kraken = require('kraken-api')

const {
  KRAKEN_API_KEY: key,
  KRAKEN_API_SECRET: secret,
  KRAKEN_API_FIAT: fiat,
  KRAKEN_MAX_REL_FEE: max_fee,
  KRAKEN_WITHDRAW_KEY: wdr_key
} = process.env

assert(key && secret, 'Provide the KRAKEN_API_KEY and KRAKEN_API_SECRET environment variables.')
assert(fiat && max_fee && wdr_key, 'Provide the KRAKEN_API_FIAT and KRAKEN_MAX_REL_FEE and KRAKEN_WITHDRAW_KEY environment variables.')

// https://www.kraken.com/features/api
const kraken = new Kraken(key, secret)
const crypto = 'XBT'

;(async () => {
    // Get withdrawal information
    // URL: https://api.kraken.com/0/private/WithdrawInfo
    const { result: { [`Z${fiat}`]: fiatBalance, [`X${crypto}`]: cryptoBalance } } = await kraken.api('Balance')
    const withdrawdetails = { asset: crypto, key: wdr_key, amount: cryptoBalance } 
    try {
        const { result: { method, limit, fee } } = await kraken.api('WithdrawInfo', withdrawdetails);
        const rel_fee = 1/parseFloat(limit)*parseFloat(fee)
        console.log(`Withdrawing the max amount of ${limit} ${method} would cost a fee of ${fee}`)
        console.log(`This is equivalent to a relative fee of ${(rel_fee*100).toFixed(2)}%`)

        // Place withdrawal when fee is low enough (relatively)
        const withdraw = { asset: crypto, key: wdr_key, amount: cryptoBalance } 
        if (rel_fee < max_fee/100) {
            try {
                const { result: { refid } } = await kraken.api('Withdraw', withdraw)
                if (refid) console.log(`📎  Withdrawal reference ID: ${refid}`)
            } catch (err) {
                //   Failure: Funding:Address verification needed
                //   Failure: Funding:Invalid amount
                //   Failure: Funding:Unknown withdraw key
                console.log(`\n🚨  Failure:`, err.message)
            }
        }else{
            console.log(`\nDon\'t withdraw now. Fee (${(rel_fee*100).toFixed(2)}%) too high. Max fee: ${parseFloat(max_fee).toFixed(2)}%`);
        }
    } catch (err) {
    //   Failure: Funding:Address verification needed
    //   Failure: Funding:Invalid amount
    //   Failure: Funding:Unknown withdraw key
    console.log(`\n🚨  Failure:`, err.message)
    return
    }
})()
