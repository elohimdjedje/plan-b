<?php

/**
 * Script de génération des clés JWT pour Windows
 * Alternative à la commande lexik:jwt:generate-keypair
 */

$keyPath = __DIR__ . '/config/jwt';
$privateKeyPath = $keyPath . '/private.pem';
$publicKeyPath = $keyPath . '/public.pem';
$passphrase = 'd10a1a15fbf63d86d9628bcf5792e5f7fb5e3d65974225bb5b518a8e6f2a3a2f';

// Créer le dossier si nécessaire
if (!is_dir($keyPath)) {
    mkdir($keyPath, 0755, true);
}

echo "🔐 Génération des clés JWT...\n\n";

// Configuration pour la génération de clé
$config = [
    "digest_alg" => "sha256",
    "private_key_bits" => 4096,
    "private_key_type" => OPENSSL_KEYTYPE_RSA,
];

// Générer la paire de clés
$res = openssl_pkey_new($config);

if ($res === false) {
    die("❌ Erreur lors de la génération de la clé privée : " . openssl_error_string() . "\n");
}

// Exporter la clé privée avec passphrase
openssl_pkey_export($res, $privateKey, $passphrase);
file_put_contents($privateKeyPath, $privateKey);
chmod($privateKeyPath, 0600);
echo "✅ Clé privée générée : config/jwt/private.pem\n";

// Exporter la clé publique
$publicKeyDetails = openssl_pkey_get_details($res);
$publicKey = $publicKeyDetails["key"];
file_put_contents($publicKeyPath, $publicKey);
chmod($publicKeyPath, 0644);
echo "✅ Clé publique générée : config/jwt/public.pem\n";

echo "\n🎉 Clés JWT générées avec succès !\n";
echo "📝 Passphrase utilisée (déjà dans .env) : $passphrase\n";
