interface ApmOptions {
  serviceName: string;
}

export function startElasticApm({ serviceName }: ApmOptions): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const apm = require('elastic-apm-node');
    if (process.env.ELASTIC_APM_SERVER_URL) {
      apm.start({
        serviceName,
        serverUrl: process.env.ELASTIC_APM_SERVER_URL,
        secretToken: process.env.ELASTIC_APM_SECRET_TOKEN || '',
        environment: process.env.NODE_ENV || 'development',
        active: process.env.NODE_ENV === 'production'
      });
    }
  } catch (_e) {
    // elastic-apm-node not installed, skip
  }
}
