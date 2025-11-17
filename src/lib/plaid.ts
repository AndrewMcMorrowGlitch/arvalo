import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

function getPlaidEnv() {
  const env = process.env.PLAID_ENV || 'sandbox'
  if (env === 'sandbox' || env === 'development' || env === 'production') {
    return env
  }
  return 'sandbox'
}

if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
  console.warn(
    'PLAID_CLIENT_ID or PLAID_SECRET is not set. Plaid integration will not work until these are configured.',
  )
}

const configuration = new Configuration({
  basePath: PlaidEnvironments[getPlaidEnv()],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID || '',
      'PLAID-SECRET': process.env.PLAID_SECRET || '',
      'Plaid-Version': '2020-09-14',
    },
  },
})

export const plaidClient = new PlaidApi(configuration)

