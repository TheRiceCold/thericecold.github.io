import {minify} from 'terser'
import {loadYaml} from './loadYaml'

import langStore from '../stores/langStore.js?raw'
import themeStore from '../stores/themeStore.js?raw'
import init from './init.js?raw'

// Why? To inline every script in one page/html.
let script = `
  const globalTranslations = ${loadYaml('./src/i18n/translations/global.yml')}

  ${langStore}
  ${themeStore}`

export const registerPageTranslations = page => script = `
  ${script}
  langStore.registerTranslations(${loadYaml(`./src/i18n/translations/${page}.yml`)})`

export const getFinalScript = async() => await minify(`(()=>{
${script}
// Initialization / Setup content
${init}
})()`, { toplevel: true, compress: true, mangle: true })
