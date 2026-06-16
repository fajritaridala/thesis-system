type QueryValue = string | number | boolean | null | undefined;

type QueryRecord = Record<string, QueryValue>;

const buildQueryString = (query?: string | QueryRecord) => {
  if (!query) return '';
  if (typeof query === 'string') return query;

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    params.append(key, String(value));
  });

  return params.toString();
};

export default buildQueryString;
