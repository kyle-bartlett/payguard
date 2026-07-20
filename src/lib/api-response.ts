interface ErrorPayload {
  error?: string;
}

function hasError(value: unknown): value is ErrorPayload {
  return typeof value === 'object' && value !== null && 'error' in value;
}

export async function readApiResponse<T>(response: Response): Promise<T> {
  const body = await response.text();
  let payload: unknown = null;

  if (body) {
    try {
      payload = JSON.parse(body);
    } catch {
      if (response.status === 413) {
        throw new Error('That file is too large for the server. Try a PDF or image under 10 MB.');
      }
      if ([502, 503, 504].includes(response.status)) {
        throw new Error('The analyzer is temporarily unavailable. Please try again in a moment.');
      }
      throw new Error(`The analyzer returned an unexpected response (HTTP ${response.status}). Please try again.`);
    }
  }

  if (!response.ok) {
    const message = hasError(payload) && typeof payload.error === 'string'
      ? payload.error
      : `Analysis failed (HTTP ${response.status}).`;
    throw new Error(message);
  }
  if (payload === null) throw new Error('The analyzer returned an empty response. Please try again.');
  return payload as T;
}
