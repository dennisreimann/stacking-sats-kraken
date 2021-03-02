const assert = require('assert')
const Kraken = require('kraken-api')

const getEnv = (...vars) => vars.map(name => {
  const value = process.env[name]
  assert(value, `Provide the ${name} environment variable.`)
  return value
})
const getEnvOpt = (varname, defaultValue, allowedValues) => {
  const value = process.env[varname] || defaultValue
  if (allowedValues) assert(allowedValues.includes(value), `The ${varname} environment variable must be one of ${allowedValues.map(v => `"${v}"`).join(", ")}.`)
  return value
}
const command = process.argv[2].replace('--cmd=', '')
const validate = process.argv.includes('--validate') || process.env['KRAKEN_DRY_RUN_PLACE_NO_ORDER']

;(async () => {
  try {
    const [apiKey, secret] = getEnv('KRAKEN_API_KEY', 'KRAKEN_API_SECRET')
    const kraken = new Kraken(apiKey, secret)

    const cmd = require(`./commands/${command}`)
    await cmd(kraken, validate, { getEnv, getEnvOpt })

    if (validate) console.log('\n🚨  THIS WAS JUST A VALIDATION RUN!')
  } catch (err) {
    console.log(`\n🚨  Failure:`, err.message)
  }
})()
