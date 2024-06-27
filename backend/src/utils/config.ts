import dotenv from 'dotenv';
import { bool, cleanEnv, host, num, port, str, testOnly } from 'envalid';

dotenv.config();

const config = cleanEnv(process.env, {
  NODE_ENV: str({ devDefault: testOnly('test'), choices: ['development', 'production', 'test'] }),
  LOG_LEVEL: str({ devDefault: testOnly('info'), choices: ['fatal', 'error', 'warn', 'info', 'debug', 'trace'] }),
  SERVER_NAME: str({ devDefault: testOnly('BetcoinBackend') }),
  HOST: host({ devDefault: testOnly('localhost') }),
  PORT: port({ devDefault: testOnly(3000) }),
  DYNAMODB_AWS_REGION: str({ devDefault: testOnly('localhost') }),
  DYNAMODB_ENDPOINT: str({ devDefault: testOnly('http://localhost:8000'), default: undefined }),
  DYNAMODB_TABLE_NAME: str({ devDefault: testOnly('BETCOIN_TABLE') }),
  DYNAMODB_ACCESS_KEY_ID: str({ devDefault: testOnly('ACCESS_KEY_ID') }),
  DYNAMODB_SECRET_ACCESS_KEY: str({ devDefault: testOnly('SECRET_ACCESS_KEY') }),
  TRUST_REVERSE_PROXY: bool({ devDefault: testOnly(false) }),
  CORS_ORIGIN: str({ devDefault: testOnly('http://localhost:5173') }),
  RATE_LIMITING_COMMON_MAX_REQUESTS: num({ devDefault: testOnly(250) }),
  RATE_LIMITING_COMMON_WINDOW_MIN: num({ devDefault: testOnly(15) }),
  RATE_LIMITING_USER_MAX_FAILED_REQUESTS: num({ devDefault: testOnly(25) }),
  RATE_LIMITING_USER_WINDOW_MIN: num({ devDefault: testOnly(60) }),
  COINDESK_API_URL: str({ devDefault: testOnly('https://api.coindesk.com/v1/bpi/currentprice.json') }),
  COINDESK_API_POLLING_RATE: num({ devDefault: testOnly(30000) }),
  COINDESK_API_TIMEOUT: num({ devDefault: testOnly(1500) }),
  JWT_ACCESS_TOKEN_SECRET: str({ devDefault: testOnly('JWT_ACCESS_SECRET') }),
  JWT_REFRESH_TOKEN_SECRET: str({ devDefault: testOnly('JWT_REFRESH_SECRET') }),
  JWT_ACCESS_TOKEN_EXPIRATION: str({ devDefault: testOnly('5m') }),
  JWT_REFRESH_TOKEN_EXPIRATION: str({ devDefault: testOnly('12h') }),
});

export default config;
