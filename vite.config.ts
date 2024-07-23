import {defineConfig, loadEnv, UserConfig} from 'vite'
import {dirname, resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {readFileSync} from "node:fs";
// @ts-ignore
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isDev = env.NODE_ENV === 'development';
  const isDocker = parseBoolean(env.ID_DOCKER);
  let isHTTPS = parseBoolean(env.HTTPS)
  let hostname = isDocker ? '0.0.0.0' : env.HOST
  let port = parseInt(env.PORT)

  if(isDocker){
    port = 3000
    hostname = '0.0.0.0'
    isHTTPS = false
  }

  const certDir = resolve(dirname(fileURLToPath(import.meta.url)), '.certs');

  const config: UserConfig = {
    base: '/',
    plugins: [
      // {
      //   // plugin for ignore-i18n-download
      //   name: 'ignore-i18n-download',
      //   resolveId(source) {
      //     if (source.includes('src/i18n/download')) {
      //       return source;
      //     }
      //     return null;
      //   },
      //   load(id) {
      //     if (id.includes('src/i18n/download')) {
      //       return 'export default {}';
      //     }
      //     return null;
      //   },
      // }
    ],
    server: {
      host: hostname,
    },
    css: {
      modules: {
        generateScopedName: isDev ? '[path]__[local]' : '[hash:base64:5]',
      },
    },
    build: {
			sourcemap: isDev,
      rollupOptions: {
        external: ['src/i18n/download'],
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@common': path.resolve(__dirname, './src/assets/scss/common.scss'),
      },
    },
    publicDir: './public',
  }
  if(isHTTPS){
    config.server = {
      ...config.server,
      port: 443,
      https: {
        cert: readFileSync(resolve(certDir, './cert.crt')),
        key: readFileSync(resolve(certDir, './cert.key')),
      },
    }
  }
  if(port && !isNaN(port)){
    config.server = {
      ...config.server,
      port,
    }
    config.preview = {
      port,
    }
  }

  return config
});


function parseBoolean(str?: string):boolean {
  return (str || '').trim().toLowerCase() === 'true';
}

