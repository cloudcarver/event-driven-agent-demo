import { fetch as undiciFetch, ProxyAgent } from 'undici';

const dispatcher = new ProxyAgent(process.env.https_proxy)

async function customFetch(req, options) {
  return await undiciFetch(req, {
    ...options, dispatcher
  });
}

export default process.env.https_proxy ? customFetch : fetch
