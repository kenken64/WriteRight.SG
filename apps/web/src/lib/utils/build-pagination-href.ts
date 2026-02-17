export function createBuildHref(
  basePath: string,
  existingParams?: Record<string, string>,
) {
  return (page: number): string => {
    const params = new URLSearchParams(existingParams);
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };
}
