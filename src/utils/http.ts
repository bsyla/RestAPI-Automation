export const buildUrl = (
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | boolean | undefined>
) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
  const url = new URL(normalizedPath, normalizedBase);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

export const toHeadersRecord = (headers: Headers) => {
  const record: Record<string, string> = {};
  headers.forEach((value, key) => {
    record[key] = value;
  });
  return record;
};

export const sanitizeHeaders = (headers: Record<string, string>) => {
  const sanitized = { ...headers };
  if (sanitized.Authorization) {
    sanitized.Authorization = "Bearer [REDACTED]";
  }
  if (sanitized.authorization) {
    sanitized.authorization = "Bearer [REDACTED]";
  }
  return sanitized;
};
