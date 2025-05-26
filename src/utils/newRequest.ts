import axios from 'axios';

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

const getLocalUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3004';

  const hostname = window.location.hostname;
  if (hostname === 'localhost') return 'http://localhost:3004';

  const subdomain = hostname.split('.')[0];
  return `http://${subdomain}.hourblock.com:3004`;
};

export const connectionUrl =
  IS_PRODUCTION || IS_MOBILE ? 'https://api.hourblock.com' : getLocalUrl();

export const newRequest = axios.create({
  baseURL: `${connectionUrl}/api`,
  withCredentials: true,
});

newRequest.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add workspace (subdomain) to every request
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname !== 'localhost') {
      const subdomain = hostname.split('.')[0];
      config.headers.workspace = subdomain;
    } else {
      // For localhost development, you might want to set a default workspace
      // or extract it from the URL path if available
      const pathParts = window.location.pathname.split('/');
      if (pathParts.length > 1 && pathParts[1]) {
        config.headers.workspace = pathParts[1];
      }
    }
  }

  return config;
});

newRequest.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
    }
    return Promise.reject(error);
  },
);

/**
 * Creates a streaming connection using axios for Server-Sent Events
 * @param url The endpoint URL to stream from
 * @param method The HTTP method to use
 * @param data Request payload
 * @param onChunk Callback for processing each data chunk
 * @param onStart Callback for stream start event
 * @param onEnd Callback for stream end event
 * @param onError Callback for stream errors
 */
export const streamRequest = ({
  endpoint,
  method = 'POST',
  data = {},
  onChunk,
  onStart,
  onEnd,
  onError,
}: {
  endpoint: string;
  method?: 'POST' | 'GET';
  data?: any;
  onChunk?: (chunk: any) => void;
  onStart?: (data: any) => void;
  onEnd?: (data: any) => void;
  onError?: (error: any) => void;
}) => {
  // Create a reference to store the reader outside the promise chain
  let readerRef: ReadableStreamDefaultReader<Uint8Array> | null = null;

  try {
    const url = `${connectionUrl}/api${endpoint}`;
    const token = localStorage.getItem('authToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    // Add workspace header
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost') {
        const subdomain = hostname.split('.')[0];
        headers.workspace = subdomain;
      } else {
        const pathParts = window.location.pathname.split('/');
        if (pathParts.length > 1 && pathParts[1]) {
          headers.workspace = pathParts[1];
        }
      }
    }

    // Use then/catch for Promise handling instead of await
    fetch(url, {
      method,
      headers,
      body: method === 'POST' ? JSON.stringify(data) : undefined,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Stream request failed with status ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Cannot read response body');
        }

        // Store reader in our reference
        readerRef = reader;

        const decoder = new TextDecoder();
        let buffer = '';

        const processChunks = () => {
          reader
            .read()
            .then(({ done, value }) => {
              if (done) {
                onEnd?.({ type: 'end_of_stream' });
                return;
              }

              // Decode this chunk and add it to our buffer
              const chunk = decoder.decode(value, { stream: true });
              buffer += chunk;

              // Process complete SSE messages from the buffer
              let boundaryIndex;
              while ((boundaryIndex = buffer.indexOf('\n\n')) !== -1) {
                const eventData = buffer.slice(0, boundaryIndex);
                buffer = buffer.slice(boundaryIndex + 2);

                // Process each SSE data line
                if (eventData.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(eventData.substring(6));

                    // Handle OpenAI streaming format
                    if (data.choices && data.choices[0]) {
                      const choice = data.choices[0];

                      // Handle start of stream and chunk updates
                      if (choice.delta) {
                        onChunk?.({
                          content: choice.delta.content || '',
                          type: 'chunk',
                          agent: data.agent,
                          turn: data.turn,
                          object: data.object,
                          id: data.id,
                          created: data.created,
                          model: data.model,
                          finish_reason: choice.finish_reason,
                          ...data,
                        });
                      }

                      // Handle end of agent's completion (but do not close the stream)
                      if (choice.finish_reason) {
                        onChunk?.({
                          content: choice.message?.content || '',
                          type: 'agent_end',
                          agent: data.agent,
                          turn: data.turn,
                          object: data.object,
                          id: data.id,
                          created: data.created,
                          model: data.model,
                          finish_reason: choice.finish_reason,
                          ...data,
                        });
                        // Do not return here; keep reading for more agents
                      }
                    }
                  } catch (e) {
                    console.error('Error parsing SSE data:', e);
                  }
                }
              }

              // Continue reading
              processChunks();
            })
            .catch((error) => {
              onError?.(error);
              reader.cancel();
            });
        };

        // Start processing
        processChunks();
      })
      .catch((error) => {
        onError?.(error);
      });

    // Return the cancel function that uses our reader reference
    return {
      cancel: () => {
        if (readerRef) {
          readerRef.cancel();
        }
      },
    };
  } catch (error) {
    onError?.(error);
    return { cancel: () => {} };
  }
};
