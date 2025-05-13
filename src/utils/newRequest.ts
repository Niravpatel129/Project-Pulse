import axios from 'axios';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_MOBILE =
  typeof window !== 'undefined' &&
  typeof navigator !== 'undefined' &&
  /Mobi|Android/i.test(navigator.userAgent);

/**
 * Determine the base URL for API requests.
 */
function getApiBase() {
  if (typeof window === 'undefined') {
    return '/api'; // Default fallback for server-side
  }

  if (IS_PRODUCTION || IS_MOBILE) {
    return `${window.location.origin}/api`;
  }

  const hostname = window.location.hostname;
  if (hostname === 'localhost') {
    return 'http://localhost:3004/api';
  }

  const subdomain = hostname.split('.')[0];
  return `http://${subdomain}.hourblock.com:3004/api`;
}

export const connectionUrl = getApiBase();

export const newRequest = axios.create({
  baseURL: connectionUrl,
  withCredentials: true,
});

newRequest.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Fallback workspace header
      const hostname = window.location.hostname;
      if (hostname !== 'localhost') {
        config.headers.workspace = hostname.split('.')[0];
      } else {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1 && pathParts[1]) {
          config.headers.workspace = pathParts[1];
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

newRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // TODO: handle unauthorized (e.g. redirect to login)
    }
    return Promise.reject(error);
  },
);

/**
 * Creates a streaming connection using fetch for Server-Sent Events.
 */
export const streamRequest = ({
  endpoint,
  method = 'POST',
  data = {},
  onChunk,
  onStart,
  onEnd,
  onError,
}) => {
  let readerRef = null;

  try {
    const url = `${connectionUrl}${endpoint}`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    /** @type {Record<string, string>} */
    const headers = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Fallback workspace header
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost') {
        headers['workspace'] = hostname.split('.')[0];
      } else {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1 && pathParts[1]) {
          headers['workspace'] = pathParts[1];
        }
      }
    }

    fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`);
        }
        const reader = response.body.getReader();
        readerRef = reader;
        const decoder = new TextDecoder();
        let buffer = '';

        const processStream = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                onEnd?.();
                return;
              }
              buffer += decoder.decode(value, { stream: true });

              let boundary;
              while ((boundary = buffer.indexOf('\n\n')) !== -1) {
                const chunk = buffer.slice(0, boundary);
                buffer = buffer.slice(boundary + 2);

                if (chunk.startsWith('data: ')) {
                  try {
                    const parsed = JSON.parse(chunk.substring(6));
                    if (parsed.type === 'start') {
                      onStart?.(parsed);
                    } else if (parsed.type === 'chunk') {
                      onChunk?.(parsed);
                    } else if (parsed.type === 'error') {
                      onError?.(parsed);
                      reader.cancel();
                      return;
                    }
                  } catch (e) {
                    console.error('Error parsing SSE data:', e);
                  }
                }
              }
              processStream();
            })
            .catch((err) => {
              onError?.(err);
              reader.cancel();
            });
        };

        processStream();
      })
      .catch((err) => {
        onError?.(err);
      });

    return {
      cancel: () => {
        if (readerRef) readerRef.cancel();
      },
    };
  } catch (err) {
    onError?.(err);
    return { cancel: () => {} };
  }
};
