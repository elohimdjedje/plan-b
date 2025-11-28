# ⚡ Démarrage rapide - Paiements Wave & Orange Money

## 🎯 En 5 minutes

### 1️⃣ Exécuter la migration (30 secondes)

```bash
cd planb-backend
php bin/console doctrine:migrations:migrate
```

### 2️⃣ Vérifier l'installation (30 secondes)

```bash
# Vérifier les services
php bin/console debug:container WaveService
php bin/console debug:container OrangeMoneyService

# Vérifier les routes
php bin/console debug:router | grep order
```

### 3️⃣ Configurer .env (2 minutes)

**Maintenant** (sans clés API - pour préparation) :
```bash
# Dans .env - Laisser les valeurs par défaut
WAVE_API_KEY=wave_ci_prod_votre_cle_api
OM_CLIENT_ID=votre_client_id_orange
```

**Plus tard** (quand vous aurez vos clés) :
```bash
# Remplacer par vos vraies clés
WAVE_API_KEY=wave_ci_prod_ABC123XYZ789
WAVE_AGGREGATED_MERCHANT_ID=merchant_123
OM_CLIENT_ID=abc123
OM_CLIENT_SECRET=xyz789
```

### 4️⃣ Tester avec Postman (2 minutes)

1. Importer `planb-backend/POSTMAN_WAVE_ORANGE.json`
2. Configurer les variables :
   - `base_url` = `http://localhost:8000`
   - `jwt_token` = (votre token après login)
3. Exécuter "Login" → "Créer commande Wave"

---

## 📝 Routes disponibles immédiatement

| Route | Méthode | Ce qu'elle fait |
|-------|---------|-----------------|
| `/api/v1/orders/create` | POST | Créer une commande |
| `/api/v1/orders/{id}/status` | GET | Voir le statut |
| `/api/v1/orders/history` | GET | Historique |

---

## 🧪 Test rapide (sans clés API)

```bash
# Démarrer le serveur
symfony server:start

# Dans un autre terminal, tester
curl -X POST http://localhost:8000/api/v1/orders/create \
  -H "Authorization: Bearer VOTRE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "provider_id": 2,
    "amount": 10000,
    "payment_method": "wave",
    "description": "Test"
  }'
```

**Résultat attendu :** Erreur "Impossible de générer le lien" (normal sans clés API)
**Mais** : La commande est créée en BDD ! ✅

---

## 📚 Pour aller plus loin

| Fichier | Quand le lire |
|---------|---------------|
| `README_PAIEMENTS_WAVE_ORANGE.md` | 👈 **Lire maintenant** - Vue complète |
| `GUIDE_INTEGRATION_PAIEMENTS.md` | Après avoir testé |
| `COMMANDES_MIGRATION.md` | Si problème technique |
| `INTEGRATION_PAIEMENTS_WAVE_ORANGE.md` | Pour détails API |

---

## ✅ Checklist minimale

- [ ] Migration exécutée
- [ ] Services vérifiés
- [ ] Postman importé
- [ ] Test de création de commande effectué
- [ ] **Prêt** pour l'intégration ! 🚀

---

## 🆘 Problème ?

**Erreur "Table not found"** → `php bin/console doctrine:migrations:migrate`

**Erreur "Service not found"** → `php bin/console cache:clear`

**Autre erreur** → Consulter `COMMANDES_MIGRATION.md` section Dépannage

---

## 🎯 Prochaine étape

👉 **Obtenir vos clés API** :
- Wave : [developer.wave.com](https://developer.wave.com)
- Orange Money : [developer.orange.com](https://developer.orange.com)

Puis :
1. Copier les clés dans `.env`
2. Tester avec Postman
3. **Ça marche !** 🎉

---

**Temps total : 5 minutes ⏱️**
**Prêt pour la production : Dès que vous avez les clés API ! 🚀**
