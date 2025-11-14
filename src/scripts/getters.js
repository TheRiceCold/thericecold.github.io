import yaml from 'js-yaml'
import languages from '../i18n/languages.yml?raw'
import translations from '../i18n/translations/global.yml?raw'
import sidebarTranslations from '../i18n/translations/sidebar-blog.yml?raw'

export const getLanguages = () => yaml.load(languages)
export const getTranslations = lang => yaml.load(translations)[lang]
export const getSidebarTranslations = lang => yaml.load(sidebarTranslations)[lang]
