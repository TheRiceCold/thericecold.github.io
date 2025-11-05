import fs from 'fs'
import yaml from 'js-yaml'

export const loadYaml = (path, options = { isFile: true }) => {
  try {
    const content = options.isFile
      ? fs.readFileSync(path, 'utf8')
      : path

    const data = yaml.load(content)
    return JSON.stringify(data, null, 2)
  } catch (err) {
    console.error('Failed to load YAML:', err.message)
    return null
  }
}

