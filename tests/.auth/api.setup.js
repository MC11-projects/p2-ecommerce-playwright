import { test as setup } from '@playwright/test'
import fs from 'fs'
import path from 'path'

const authFile = '.auth/user.json'
const tokenFile = '.auth/api-token.json'

setup('Extract API token', async () => {
    const authDir = path.dirname(tokenFile)
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true })
    }

    if (!fs.existsSync(authFile)) {
        throw new Error(
            `Auth file not found at ${authFile}. ` +
            'Please run the authentication setup first.'
        )
    }

    const file = fs.readFileSync(authFile, 'utf-8')
    const structure = JSON.parse(file)
    
    const localStorage = structure.origins[0].localStorage
    
    const item = localStorage.find(item => item.name === 'idToken')
    
    if (!item) {
        throw new Error('ID token not found in auth state')
    }
    
    const apiToken = {idToken: item.value}
    const jsonString = JSON.stringify(apiToken)
    fs.writeFileSync(tokenFile, jsonString)

    console.log('API token extracted successfully')
})
