// scripts/downloadModel.mjs
// Lance avec : node scripts/downloadModel.mjs
//
// Télécharge le modèle MNIST pré-entraîné depuis le CDN officiel TensorFlow.js
// et le place dans public/models/mnist/ prêt à être servi par Vite.

import https from 'https'
import fs    from 'fs'
import path  from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'models', 'mnist')

// ─── Modèle MNIST officiel tfjs-examples ─────────────────────────────────────
// Source : https://github.com/tensorflow/tfjs-examples/tree/master/mnist
const BASE_URL = 'https://storage.googleapis.com/tfjs-models/tfjs/mnist_transfer_cnn_v1'
const FILES = [
  'model.json',
  'group1-shard1of1',   // fichier de poids binaire
]

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function download(url, dest) {
  return new Promise((resolve, reject) => {
    // Créer le dossier si besoin
    fs.mkdirSync(path.dirname(dest), { recursive: true })

    const file   = fs.createWriteStream(dest)
    const req    = https.get(url, res => {
      // Suivre les redirections
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        return reject(new Error(`HTTP ${res.statusCode} pour ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    })
    req.on('error', err => { fs.unlinkSync(dest); reject(err) })
  })
}

// ─── Main ─────────────────────────────────────────────────────────────────────
console.log(`📦 Téléchargement du modèle MNIST dans :\n   ${OUTPUT_DIR}\n`)

for (const filename of FILES) {
  const url  = `${BASE_URL}/${filename}`
  const dest = path.join(OUTPUT_DIR, filename)
  process.stdout.write(`  ⬇️  ${filename} ... `)
  try {
    await download(url, dest)
    console.log('✅')
  } catch (err) {
    console.log(`❌ Erreur : ${err.message}`)
    process.exit(1)
  }
}

// Vérifier que model.json contient bien du JSON valide
const modelJsonPath = path.join(OUTPUT_DIR, 'model.json')
const raw = fs.readFileSync(modelJsonPath, 'utf-8')
try {
  const json = JSON.parse(raw)
  // Le modèle tfjs contient une clé "modelTopology" ou "format"
  if (!json.modelTopology && !json.format) {
    throw new Error('model.json ne semble pas être un modèle TensorFlow.js valide')
  }
  console.log(`\n✅ model.json valide (format: ${json.format ?? 'layers'})`)
} catch (err) {
  console.error(`\n❌ model.json invalide : ${err.message}`)
  console.error('Contenu reçu :', raw.slice(0, 200))
  process.exit(1)
}

console.log('\n🎉 Modèle prêt ! Lance "npm run dev" et essaie le module MNIST.')
console.log(`\n   Si le modèle ne charge toujours pas, ouvre useMnistModel.js`)
console.log(`   et passe MODEL_URL en mode CDN (voir commentaire dans le fichier).`)
