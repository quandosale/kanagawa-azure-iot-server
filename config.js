module.exports = {
  IOT_CONNECTION_STRING: "HostName=Kanagawa-TEST.azure-devices.net;SharedAccessKeyName=iothubowner;SharedAccessKey=pqKwNAtl6K1kSCWE56YG8XifrziKKb1Ow4hFH6wBqz8=",
  IOT_CONSUMER_GROUP: "kanagawaconsumers",
  IOT_HOSTNAME: "Kanagawa-TEST.azure-devices.net",
  LICENCE_KEY: "123456",
  DB: {
    URI: "mongodb://23.99.112.51:27017/kanagawa-iot-db",
  },
  STORAGE_PATH: './storage',
  STORAGE_TMP_PATH: './storage_tmp',
  AZURE_STORAGE: {
    accountName: 'kanagawawfdb',
    accountConnectStr: 'DefaultEndpointsProtocol=https;AccountName=kanagawawfdb;AccountKey=bGnQQDlYX7vVx+u69sEzwRLN5TKdLeqFMu5pr8wSDi+jYkyxYO5haFBz5x47XMqWeUfQ4FC8dSvQfrTGesc+Sg==;EndpointSuffix=core.windows.net',
    SHARE_NAME: 'calm-share',
    DIRECTORY: 'wfdb',
  },
  FILE_TYPE: {
    ECG: '_ecg.hex',
    HEART_RATE: '_hr.hex',
    AF: '_af.hex',

    POSTURE: '_pos.hex'
  },
  RECORD_MAX_DURATION: 8 * 3600 * 1000 // 8 hours
};