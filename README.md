# Stacking Sats on Kraken

First off: Here's to you, [Bittr](https://getbittr.com/) – you will be missed! 😢

This script is not a full replacement for the incredible service Bittr offered, but it's a start:
Automate your Stacking Sats process by regularly placing buy orders using the [Kraken API](https://www.kraken.com/features/api).

## ✋ Caveat

You need to install the dependency [kraken-api](https://github.com/nothingisdead/npm-kraken-api), which is a third-party package.
It has a minimal set of dependencies and I've done my best to audit its code.
Also the version is fixed, so that unwanted changes do not slip in.

However: Use this at your own risk and decide for yourself whether or not you want to run this script and its dependencies!

## 📦 Setup

Prerequisite: At least the current LTS version of [Node.js](https://nodejs.org/).

Install the dependencies:

```sh
npm install
```

Setup the environment variables for the script:

```sh
export KRAKEN_API_KEY="apiKeyFromTheKrakenSettings"
export KRAKEN_API_SECRET="privateKeyFromTheKrakenSettings"
export KRAKEN_API_FIAT="USD" # the governmental shitcoin you are selling
export KRAKEN_BUY_AMOUNT=21 # fiat amount you trade for the future of money
```

Use a dry run to test the script and see the output without placing an order:

```sh
npm test
```

You should see something like this sample output:

```text
💰 Balance: 210000.00 USD / 21.0 XBT

📈 Ask: 21000.2 USD
📉 Bid: 21000.1 USD

🧾 Order: 0.21212121 XBT at 21000.1 USD

💸 Placed order: buy 0.21212121 XBTUSD @ limit 21000.1 / TXID: 2121212121
```

## 🤑 Stack sats

When you are good to go, execute this command in a regular interval:

```sh
npm run stack-sats
```

The best and easiest way is to wrap it all up in a shell script.
This script can be triggered via cron job, e.g. weekly, daily or hourly.

Here's a sample `stack-sats.sh` script:

```sh
#!/bin/bash
set -e

# hide deprecation warning
export NODE_OPTIONS="--no-deprecation"

export KRAKEN_API_KEY="apiKeyFromTheKrakenSettings"
export KRAKEN_API_SECRET="privateKeyFromTheKrakenSettings"
export KRAKEN_API_FIAT="USD"
export KRAKEN_BUY_AMOUNT=21

BASE_DIR=$(cd `dirname $0` && pwd)
cd $BASE_DIR/stacking-sats-kraken
result=$(npm run stack-sats 2>&1)
echo $result

# Optional: Send yourself an email
recipient="satstacker@example.org"
echo "Subject: Sats got stacked
From: satstacker@example.org
To: $recipient $result" | /usr/sbin/sendmail $recipient
```

Make it executable with `chmod +x stack-sats.sh` and go wild.

[Stay humble!](https://twitter.com/matt_odell/status/1117222441867194374) 🙏
