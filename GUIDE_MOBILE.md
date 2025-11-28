# 📱 Guide Complet - Plan B Mobile avec Expo Go

Guide détaillé pour tester l'application Plan B sur votre téléphone.

---

## 🎯 Ce que vous allez faire

1. Installer Expo Go sur votre téléphone
2. Configurer le pare-feu Windows
3. Lancer l'application mobile
4. Scanner le QR code pour tester sur votre téléphone

**Temps estimé : 10 minutes**

---

## 📱 Étape 1 : Installer Expo Go

### Sur Android
1. Ouvrez le **Google Play Store**
2. Cherchez **"Expo Go"**
3. Installez l'application
4. Ouvrez-la (pas besoin de créer un compte)

### Sur iOS
1. Ouvrez l'**App Store**
2. Cherchez **"Expo Go"**
3. Installez l'application
4. Ouvrez-la (pas besoin de créer un compte)

---

## 🔧 Étape 2 : Configuration du pare-feu

### Option A : Automatique (Recommandé)

1. Ouvrez PowerShell **en tant qu'administrateur** :
   - Clic droit sur l'icône Windows
   - "Terminal (Admin)" ou "Windows PowerShell (Admin)"

2. Exécutez le script de configuration :
   ```powershell
   cd "c:\Users\Elohim Mickael\Documents\plan-b\planb-mobile"
   .\configure-firewall.ps1
   ```

3. Confirmez les autorisations si demandé

### Option B : Manuelle

Si le script ne fonctionne pas, ajoutez manuellement :

```powershell
# Port 8000 - Backend
New-NetFirewallRule -DisplayName "Plan B Backend" -Direction Inbound -LocalPort 8000 -Protocol TCP -Action Allow

# Port 19000 - Expo
New-NetFirewallRule -DisplayName "Expo Dev Server" -Direction Inbound -LocalPort 19000 -Protocol TCP -Action Allow

# Port 19001 - Metro Bundler
New-NetFirewallRule -DisplayName "Expo Metro Bundler" -Direction Inbound -LocalPort 19001 -Protocol TCP -Action Allow
```

---

## 🌐 Étape 3 : Trouver votre IP locale

1. Ouvrez PowerShell (normal, pas admin)

2. Tapez :
   ```powershell
   ipconfig
   ```

3. Cherchez la section **"Carte réseau sans fil Wi-Fi"** ou **"Ethernet"**

4. Notez l'**Adresse IPv4** (exemple : `192.168.1.10` ou `172.29.240.1`)

---

## ⚙️ Étape 4 : Configurer l'IP dans l'application

1. Ouvrez le fichier :
   ```
   c:\Users\Elohim Mickael\Documents\plan-b\planb-mobile\config\api.js
   ```

2. Modifiez la ligne 6 avec VOTRE IP :
   ```javascript
   const LOCAL_IP = '192.168.1.10'; // <- REMPLACEZ PAR VOTRE IP
   ```

3. Sauvegardez le fichier (Ctrl+S)

---

## 🖥️ Étape 5 : Démarrer le backend

1. Ouvrez un **nouveau** PowerShell

2. Lancez le backend Plan B :
   ```powershell
   cd "c:\Users\Elohim Mickael\Documents\plan-b"
   .\demarrer.ps1
   ```

3. Attendez que tout soit démarré (30 secondes)

4. Vérifiez que ça fonctionne : http://localhost:8000

---

## 📱 Étape 6 : Lancer l'application mobile

1. Ouvrez un **nouveau** PowerShell (le backend doit rester ouvert)

2. Allez dans le dossier mobile :
   ```powershell
   cd "c:\Users\Elohim Mickael\Documents\plan-b\planb-mobile"
   ```

3. Lancez l'application :
   ```powershell
   npm start
   ```

4. Attendez que le QR code s'affiche (1 minute)

---

## 📷 Étape 7 : Scanner le QR code

### Sur Android
1. Ouvrez **Expo Go** sur votre téléphone
2. Appuyez sur **"Scan QR code"**
3. Scannez le QR code affiché dans PowerShell
4. L'application va se charger (15-30 secondes)

### Sur iOS
1. Ouvrez l'application **Appareil Photo**
2. Pointez vers le QR code affiché dans PowerShell
3. Une notification apparaît en haut
4. Touchez la notification
5. Expo Go s'ouvre et charge l'app

---

## ✅ Étape 8 : Tester l'application

Une fois l'app chargée, vous devriez voir :

### Écran d'accueil
- ✅ Logo "🏠 Plan B"
- ✅ Statistiques (4 annonces, 3 catégories)
- ✅ Boutons "Connexion" et "Explorer"
- ✅ Catégories (Immobilier, Véhicules, Hôtels)

### Test de connexion
1. Appuyez sur **"📱 Connexion"**
2. Entrez :
   - **Email** : `demo@test.com`
   - **Mot de passe** : `Demo123!`
3. Si ça fonctionne, vous verrez votre profil ! 🎉

---

## 🐛 Dépannage

### Le QR code ne s'affiche pas

```powershell
# Arrêtez le serveur (Ctrl+C)
# Effacez le cache et relancez
npm start --clear
```

### L'app ne se charge pas sur le téléphone

**Vérifiez :**
- [ ] Téléphone et PC sur le **même Wi-Fi**
- [ ] Backend lancé (`http://localhost:8000` fonctionne)
- [ ] IP correcte dans `config/api.js`
- [ ] Pare-feu autorise les ports

**Solution rapide :**
```powershell
# Mode tunnel (plus lent mais plus fiable)
npm start --tunnel
```

### Erreur "Network request failed"

1. Vérifiez l'IP dans `config/api.js`
2. Testez depuis votre téléphone : `http://VOTRE_IP:8000`
3. Si ça ne fonctionne pas, désactivez temporairement le pare-feu

### L'app se charge mais affiche des erreurs

1. Secouez votre téléphone
2. Dans le menu Expo, appuyez sur **"Reload"**
3. Si ça persiste, arrêtez tout et relancez :
   ```powershell
   # Arrêtez Expo (Ctrl+C)
   npm start --clear
   ```

---

## 💡 Astuces

### Rechargement automatique
Chaque modification du code recharge automatiquement l'app sur votre téléphone !

### Menu Expo
**Secouez** votre téléphone pour ouvrir le menu :
- **Reload** : Recharge l'app
- **Go to Home** : Retour à l'accueil Expo
- **Enable Fast Refresh** : Rechargement automatique

### Voir les logs
Dans PowerShell où vous avez lancé `npm start`, vous voyez tous les logs en temps réel.

### Mode développement
Appuyez longuement sur l'écran avec 3 doigts pour ouvrir le menu de debug.

---

## 🎨 Personnalisation

### Changer les couleurs

Éditez `App.js` ligne 77 :
```javascript
backgroundColor: '#FF6B35',  // Couleur principale
```

### Ajouter un écran

1. Créez un fichier dans `screens/`
2. Importez-le dans `App.js`
3. Ajoutez-le à la navigation

---

## 📊 État des services

Pour que tout fonctionne, vous devez avoir :

| Service | État | Port | Comment lancer |
|---------|------|------|----------------|
| **Backend** | ✅ Actif | 8000 | `.\demarrer.ps1` |
| **PostgreSQL** | ✅ Actif | 5432 | Lancé par demarrer.ps1 |
| **Expo** | ✅ Actif | 19000 | `npm start` |

---

## 🔗 Liens rapides

- **Documentation complète** : `planb-mobile/README.md`
- **Guide rapide** : `planb-mobile/DEMARRAGE_RAPIDE.md`
- **Configuration API** : `planb-mobile/config/api.js`

---

## 📞 Prochaines étapes

1. ✅ L'app se charge sur votre téléphone
2. 🔄 Testez la navigation et les fonctionnalités
3. 🎨 Personnalisez l'interface
4. 🚀 Développez de nouvelles fonctionnalités
5. 📦 Publiez sur les stores (optionnel)

---

## 🎉 Félicitations !

Vous avez maintenant une application mobile fonctionnelle connectée à votre backend !

**Bon développement ! 🚀**

---

## 📚 Ressources utiles

- [Documentation Expo](https://docs.expo.dev/)
- [Documentation React Native](https://reactnative.dev/)
- [Expo Go Guide](https://docs.expo.dev/get-started/expo-go/)
- [React Navigation](https://reactnavigation.org/)
- [Communauté Expo Discord](https://chat.expo.dev/)
