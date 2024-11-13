import { fetch as undiciFetch, ProxyAgent } from 'undici';

let dispatcher;

if (process.env.https_proxy) {
  dispatcher = new ProxyAgent(process.env.https_proxy)
}

const customFetch = async (req, options) => {
  return await undiciFetch(req, {
    ...options, dispatcher
  });
}

export default process.env.https_proxy ? customFetch : fetch
