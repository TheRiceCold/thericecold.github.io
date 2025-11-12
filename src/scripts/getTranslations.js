import yaml from 'js-yaml'
import translations from '../i18n/translations/global.yml?raw'

export const getTranslations = lang => yaml.load(translations)[lang]
