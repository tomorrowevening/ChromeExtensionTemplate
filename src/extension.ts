import * as manifest from '../manifest.json'

export default {
  name: manifest.name,
  files: manifest.web_accessible_resources[0].resources
}
