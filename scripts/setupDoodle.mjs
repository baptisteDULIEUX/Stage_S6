import fs from 'fs/promises';
import path from 'path';

const MODEL_DIR = 'public/models/doodle';

// Les liens vers le modèle "100 classes" de Zaid Alyafeai
const FILES = [
    { url: 'https://raw.githubusercontent.com/zaidalyafeai/zaidalyafeai.github.io/master/sketcher/models/model.json', name: 'model.json' },
    { url: 'https://raw.githubusercontent.com/zaidalyafeai/zaidalyafeai.github.io/master/sketcher/models/group1-shard1of1.bin', name: 'group1-shard1of1.bin' },
    { url: 'https://raw.githubusercontent.com/zaidalyafeai/zaidalyafeai.github.io/master/sketcher/class_names.txt', name: 'classes.txt' }
];

async function download() {
    await fs.mkdir(MODEL_DIR, { recursive: true });

    console.log('⏳ Début du téléchargement du modèle à 100 classes...');
    for (const file of FILES) {
        try {
            const res = await fetch(file.url);
            if (!res.ok) throw new Error(`Erreur ${res.status}`);
            const data = await res.arrayBuffer();
            await fs.writeFile(path.join(MODEL_DIR, file.name), Buffer.from(data));
            console.log(`✅ ${file.name} sauvegardé avec succès !`);
        } catch (err) {
            console.error(`❌ Échec pour ${file.name}:`, err.message);
        }
    }
    console.log('🎉 Terminé ! Les fichiers sont prêts dans public/models/doodle/');
}

download();