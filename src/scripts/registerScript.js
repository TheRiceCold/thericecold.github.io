import globalTranslations from '../i18n/translations/global.json?raw'
import langStore from '../stores/langStore.js?raw'
import themeStore from '../stores/themeStore.js?raw'
import init from './init.js?raw'

import {minify} from 'terser'

// Why? To inline every script in one page/html.
export default async (script='') => await minify(/*js*/`(() => {
// Registrations
const globalTranslations = ${globalTranslations}

${langStore}
${themeStore}
${script}

// Initialization / Setup content
${init}
})()`, { toplevel: true, compress: true, mangle: true })
