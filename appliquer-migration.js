/**
 * Script Node.js pour appliquer la migration visite virtuelle
 * Usage: node appliquer-migration.js
 */

const fs = require('fs');
const { execSync } = require('child_process');

console.log('🔍 Application de la migration visite virtuelle...\n');

// Configuration
const config = {
    host: 'localhost',
    port: 5432,
    database: 'planb',
    user: 'postgres',
    password: 'root'
};

// SQL de migration
const migrationSQL = `
ALTER TABLE listings 
ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL;

CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) 
WHERE virtual_tour_type IS NOT NULL;
`;

// Vérifier si pg est installé
let pg;
try {
    pg = require('pg');
} catch (e) {
    console.log('❌ Module "pg" non installé\n');
    console.log('💡 Installation du module pg...\n');
    try {
        execSync('npm install pg --no-save', { stdio: 'inherit' });
        pg = require('pg');
        console.log('✅ Module pg installé\n');
    } catch (err) {
        console.log('❌ Impossible d\'installer le module pg\n');
        console.log('💡 Solutions alternatives:\n');
        console.log('   1. Utiliser pgAdmin:');
        console.log('      - Ouvrir pgAdmin');
        console.log('      - Se connecter à la base "planb"');
        console.log('      - Query Tool → Ouvrir: MIGRATION_SIMPLE.sql');
        console.log('      - Exécuter (F5)\n');
        console.log('   2. Installer manuellement: npm install pg\n');
        process.exit(1);
    }
}

const { Client } = pg;

async function applyMigration() {
    const client = new Client({
        host: config.host,
        port: config.port,
        database: config.database,
        user: config.user,
        password: config.password
    });

    try {
        console.log('1. Connexion à PostgreSQL...');
        await client.connect();
        console.log('   ✅ Connexion réussie\n');

        // Vérifier si les colonnes existent déjà
        console.log('2. Vérification des colonnes existantes...');
        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'listings' 
            AND column_name LIKE 'virtual_tour%';
        `;
        const checkResult = await client.query(checkQuery);
        
        if (checkResult.rows.length >= 4) {
            console.log('   ⚠️  Les colonnes virtual_tour existent déjà:');
            checkResult.rows.forEach(row => {
                console.log(`      - ${row.column_name}`);
            });
            console.log('\n✅ Migration déjà appliquée !\n');
            await client.end();
            return;
        }
        console.log('   Aucune colonne virtual_tour trouvée\n');

        // Appliquer la migration
        console.log('3. Application de la migration...');
        await client.query('BEGIN');
        
        await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_type VARCHAR(20) DEFAULT NULL');
        console.log('   ✅ Colonne virtual_tour_type ajoutée');
        
        await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT DEFAULT NULL');
        console.log('   ✅ Colonne virtual_tour_url ajoutée');
        
        await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_thumbnail TEXT DEFAULT NULL');
        console.log('   ✅ Colonne virtual_tour_thumbnail ajoutée');
        
        await client.query('ALTER TABLE listings ADD COLUMN IF NOT EXISTS virtual_tour_data JSONB DEFAULT NULL');
        console.log('   ✅ Colonne virtual_tour_data ajoutée');
        
        await client.query('CREATE INDEX IF NOT EXISTS idx_listing_virtual_tour ON listings(virtual_tour_type) WHERE virtual_tour_type IS NOT NULL');
        console.log('   ✅ Index créé');
        
        await client.query('COMMIT');
        console.log('\n✅ Migration appliquée avec succès !\n');

        // Vérification finale
        console.log('4. Vérification finale...');
        const verifyResult = await client.query(checkQuery);
        
        if (verifyResult.rows.length === 4) {
            console.log('   ✅ Toutes les colonnes sont présentes:');
            verifyResult.rows.forEach(row => {
                console.log(`      - ${row.column_name}`);
            });
        } else {
            console.log(`   ⚠️  Attention: ${verifyResult.rows.length} colonnes trouvées (attendu: 4)`);
        }

        console.log('\n🎉 Migration terminée avec succès !\n');
        console.log('📝 Prochaines étapes:');
        console.log('   1. Redémarrer le backend (si en cours d\'exécution)');
        console.log('   2. Redémarrer le frontend (si en cours d\'exécution)');
        console.log('   3. Tester avec un compte PRO\n');

        await client.end();

    } catch (error) {
        console.log('\n❌ Erreur:', error.message);
        
        if (error.code === 'ECONNREFUSED') {
            console.log('\n💡 Vérifiez que PostgreSQL est démarré');
        } else if (error.code === '28P01') {
            console.log('\n💡 Vérifiez les identifiants dans le script');
        } else if (error.code === '3D000') {
            console.log('\n💡 Vérifiez que la base de données "planb" existe');
        }
        
        process.exit(1);
    }
}

applyMigration();
