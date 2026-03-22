import { ui, defaultLang, showDefaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    // If the path already has a locale prefix, remove it to normalize
    const cleanPath = path.replace(/^\/(fr)\//, '/').replace(/^\/(fr)$/, '/');
    
    // Default language doesn't use a prefix (prefixDefaultLocale: false in our config)
    if (l === defaultLang) {
      return cleanPath;
    }
    
    // Ensure the path starts with a slash before combining
    const normalizedPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    // Avoid double slashes if path is exactly '/'
    if (normalizedPath === '/') {
       return `/${l}`;
    }
    
    return `/${l}${normalizedPath}`;
  }
}
