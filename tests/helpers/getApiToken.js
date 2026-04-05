import fs from 'fs'

const tokenFile = '.auth/api-token.json'

export function getApiToken() {
    if(!fs.existsSync(tokenFile))
        throw new Error ('File could not be found!')

    const file = fs.readFileSync(tokenFile, 'utf-8')
    const structure = JSON.parse(file)
    return structure.idToken
}
