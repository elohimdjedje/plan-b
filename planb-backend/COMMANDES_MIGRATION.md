# 🔧 Commandes pour activer l'intégration des paiements

## 1️⃣ Exécuter la migration

```bash
cd planb-backend

# Vérifier les migrations en attente
php bin/console doctrine:migrations:status

# Exécuter la migration pour créer les tables orders et operations
php bin/console doctrine:migrations:migrate --no-interaction

# Vérifier que tout est ok
php bin/console doctrine:schema:validate
```

**Sortie attendue :**
```
[OK] The database schema is in sync with the mapping files.
```

---

## 2️⃣ Vérifier les services

```bash
# Vérifier que WaveService est bien enregistré
php bin/console debug:container WaveService

# Vérifier que OrangeMoneyService est bien enregistré
php bin/console debug:container OrangeMoneyService

# Vérifier tous les services de l'app
php bin/console debug:autowiring
```

---

## 3️⃣ Vérifier les routes

```bash
# Lister toutes les routes de l'API orders
php bin/console debug:router | grep order

# Devrait afficher :
# app_order_create         POST     /api/v1/orders/create
# app_order_wave_callback  GET|POST /api/v1/orders/wave/callback/{orderId}
# app_order_om_callback    GET|POST /api/v1/orders/orange-money/callback/{orderId}
# app_order_status         GET      /api/v1/orders/{orderId}/status
# app_order_history        GET      /api/v1/orders/history
```

---

## 4️⃣ Clear le cache

```bash
# Clear le cache Symfony
php bin/console cache:clear

# En mode dev, aussi :
php bin/console cache:clear --env=dev
```

---

## 5️⃣ Créer des données de test (optionnel)

```bash
# Si vous voulez créer des utilisateurs de test
php bin/console doctrine:fixtures:load --append
```

Ou créez manuellement :
- Un utilisateur "client" (ID: 1)
- Un utilisateur "prestataire" (ID: 2)

---

## 6️⃣ Tester manuellement (sans clés API)

```bash
# Démarrer le serveur Symfony
symfony server:start
# ou
php -S localhost:8000 -t public/
```

Puis testez avec curl :

```bash
# 1. Se connecter et récupérer le token JWT
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"client@test.com","password":"password123"}'

# Copier le token JWT de la réponse

# 2. Créer une commande (va échouer car pas de clés API, mais teste la route)
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "amount": 10000,
    "payment_method": "wave",
    "description": "Test"
  }'

# Sortie attendue : Erreur "Impossible de générer le lien" (normal sans clés API)
# Mais la commande est créée en BDD !

# 3. Vérifier l'historique
curl -X GET http://localhost:8000/api/v1/orders/history \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI"
```

---

## 7️⃣ Vérifier les logs

```bash
# Voir les logs en temps réel
tail -f var/log/dev.log

# Chercher les logs spécifiques aux paiements
grep -i "wave\|orange" var/log/dev.log
```

---

## 8️⃣ Inspecter la base de données

```bash
# Se connecter à PostgreSQL
psql -U postgres -d planb

# Vérifier que les tables existent
\dt

# Devrait afficher :
# orders
# operations

# Voir la structure de la table orders
\d orders

# Voir la structure de la table operations
\d operations

# Quitter PostgreSQL
\q
```

---

## 9️⃣ Une fois les clés API obtenues

### Configuration Wave

```bash
# Éditer le .env
nano .env

# Remplacer :
WAVE_API_KEY=votre_vraie_cle_api_wave
WAVE_AGGREGATED_MERCHANT_ID=votre_merchant_id
WAVE_ENVIRONMENT=sandbox
```

### Configuration Orange Money

```bash
# Dans le même fichier .env, remplacer :
OM_CLIENT_ID=votre_client_id_orange
OM_CLIENT_SECRET=votre_client_secret_orange
OM_MERCHANT_CODE=votre_code_marchand
```

Puis :
```bash
# Clear le cache pour prendre en compte les nouvelles variables
php bin/console cache:clear
```

---

## 🔟 Test complet avec vraies clés API

```bash
# 1. Créer une commande Wave
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "amount": 1000,
    "payment_method": "wave",
    "description": "Test réel Wave"
  }'

# Vous devriez recevoir un vrai lien wave_launch_url !

# 2. Créer une commande Orange Money
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "amount": 1000,
    "payment_method": "orange_money",
    "description": "Test réel Orange Money"
  }'

# Vous devriez recevoir un QR code et un payment_url !
```

---

## ✅ Checklist finale

- [ ] Migration exécutée sans erreur
- [ ] Tables `orders` et `operations` créées
- [ ] Services `WaveService` et `OrangeMoneyService` injectables
- [ ] Routes `/api/v1/orders/*` accessibles
- [ ] Cache Symfony cleared
- [ ] Variables `.env` configurées (quand vous aurez les clés)
- [ ] Test de création de commande réussi
- [ ] Logs consultables dans `var/log/dev.log`

---

## 🆘 En cas d'erreur

### Erreur : "Table orders not found"
```bash
php bin/console doctrine:migrations:migrate --no-interaction
```

### Erreur : "Service not found"
```bash
php bin/console cache:clear
composer dump-autoload
```

### Erreur : "Access denied for user"
```bash
# Vérifier la connexion PostgreSQL dans .env
DATABASE_URL="postgresql://postgres:root@127.0.0.1:5432/planb?serverVersion=15&charset=utf8"
```

### Erreur : "Variable d'environnement non trouvée"
```bash
# S'assurer que .env contient bien toutes les variables
# Sinon, copier depuis .env.example
cp .env.example .env
nano .env  # Éditer les valeurs
```

---

**Tout est prêt ! 🎉**

Vous pouvez maintenant tester l'intégration dès que vous aurez vos clés API Wave et Orange Money.
