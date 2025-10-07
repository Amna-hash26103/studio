// Used with `next-intl`'s `getRequestConfig`
// For details, see https://next-intl.dev/docs/getting-started/app-router#step-3-create-a-configuration-file
export default async function getRequestConfig() {
  const {getRequestConfig} = await import('./i18n');
  return getRequestConfig({locale: 'en'});
}
    