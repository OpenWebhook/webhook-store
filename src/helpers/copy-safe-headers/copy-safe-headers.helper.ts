export const copySafeHeaders = (
  headers: Readonly<Record<string, string>>,
): Record<string, string> => {
  const UNSAFE_HEADERS_REGEXP =
    /^(?:host|origin|cookie|user-agent|content-length|version|cdn-loop|cf-ray|x-scheme|x-real-ip|cf-ipcountry|x-request-id|x-forwarded-for|cf-connecting-ip|x-forwarded-host|x-forwarded-port|x-forwarded-proto|x-forwarded-scheme|x-original-forwarded-for)$/i;
  const safeHeaders = Object.entries(headers).reduce((acc, [key, value]) => {
    if (!key.match(UNSAFE_HEADERS_REGEXP)) {
      acc[key] = value;
    }

    return acc;
  }, {});
  return safeHeaders;
};
