# 📱 Sélecteur d'indicatif avec drapeaux - Style Wave

## ✅ Composant créé

### PhoneInput.jsx
Un composant React moderne avec sélecteur d'indicatif téléphonique et drapeaux emoji.

**Caractéristiques :**
- 🇨🇮 Drapeaux emoji pour tous les pays
- 📱 Menu déroulant style Wave
- ✨ Design moderne avec glassmorphism
- 🎯 12 pays d'Afrique de l'Ouest pré-configurés
- 🔄 Gestion automatique du format complet (+225 XX XX XX XX)

---

## 🎨 Aperçu visuel

### Menu fermé
```
┌────────────────────────────────────┐
│ [🇨🇮 +225 ▼] [07 XX XX XX XX___] │
└────────────────────────────────────┘
```

### Menu ouvert
```
┌────────────────────────────────────┐
│ [🇨🇮 +225 ▲] [07 XX XX XX XX___] │
├────────────────────────────────────┤
│ 🇨🇮  Côte d'Ivoire      +225     │
│ 🇸🇳  Sénégal            +221     │
│ 🇧🇯  Bénin              +229     │
│ 🇲🇱  Mali               +223     │
│ 🇧🇫  Burkina Faso       +226     │
│ 🇹🇬  Togo               +228     │
│ 🇳🇪  Niger              +227     │
│ 🇬🇳  Guinée             +224     │
│ 🇨🇲  Cameroun           +237     │
│ 🇬🇦  Gabon              +241     │
│ 🇨🇩  RD Congo           +243     │
│ 🇲🇦  Maroc              +212     │
└────────────────────────────────────┘
```

---

## 📍 Où il est utilisé

### 1. Page d'inscription (Auth.jsx)
**Champ :** WhatsApp (optionnel)

```jsx
<PhoneInput
  label="WhatsApp (optionnel)"
  value={formData.whatsappPhone}
  onChange={(value) => handleChange('whatsappPhone', value)}
  placeholder="07 XX XX XX XX"
  defaultCountry={formData.country || 'CI'}
/>
```

### 2. Page Paramètres (Settings.jsx)
**Champs :**
- Téléphone principal
- WhatsApp pour discussions

```jsx
<PhoneInput
  label="Téléphone principal"
  value={formData.phone}
  onChange={(value) => handleChange('phone', value)}
  placeholder="07 XX XX XX XX"
  defaultCountry="CI"
/>

<PhoneInput
  label="WhatsApp (pour les discussions)"
  value={formData.whatsapp}
  onChange={(value) => handleChange('whatsapp', value)}
  placeholder="07 XX XX XX XX"
  defaultCountry="CI"
/>
```

---

## 🛠️ Props du composant

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `label` | string | - | Label du champ |
| `value` | string | '' | Valeur complète (+225 07...) |
| `onChange` | function | - | Callback avec valeur complète |
| `placeholder` | string | 'XX XX XX XX' | Placeholder du numéro |
| `required` | boolean | false | Champ obligatoire |
| `error` | string | null | Message d'erreur |
| `defaultCountry` | string | 'CI' | Code pays par défaut (CI, SN, BJ, etc.) |

---

## 🌍 Pays disponibles

| Drapeau | Pays | Code | Indicatif |
|---------|------|------|-----------|
| 🇨🇮 | Côte d'Ivoire | CI | +225 |
| 🇸🇳 | Sénégal | SN | +221 |
| 🇧🇯 | Bénin | BJ | +229 |
| 🇲🇱 | Mali | ML | +223 |
| 🇧🇫 | Burkina Faso | BF | +226 |
| 🇹🇬 | Togo | TG | +228 |
| 🇳🇪 | Niger | NE | +227 |
| 🇬🇳 | Guinée | GN | +224 |
| 🇨🇲 | Cameroun | CM | +237 |
| 🇬🇦 | Gabon | GA | +241 |
| 🇨🇩 | RD Congo | CD | +243 |
| 🇲🇦 | Maroc | MA | +212 |

---

## 💡 Fonctionnalités

### 1. Sélection du pays
- Clic sur le bouton avec drapeau
- Menu déroulant avec tous les pays
- Recherche visuelle par drapeau

### 2. Formatage automatique
```javascript
// L'utilisateur tape: 07123456
// Le composant envoie: +225 07123456
```

### 3. Validation
- Accepte seulement les chiffres et espaces
- Nettoie automatiquement l'input
- Affiche un message d'exemple

### 4. UX/UI
- Animation smooth du dropdown
- Overlay pour fermer en cliquant dehors
- Highlight du pays sélectionné
- Style cohérent avec le design Plan B

---

## 🎨 Design

### Couleurs
- Border normale : `border-gray-200`
- Border hover : `border-gray-300`
- Border focus : `border-primary-500`
- Fond dropdown : `bg-white`
- Hover item : `bg-primary-50`

### Animations
- Rotation chevron : 180deg
- Transition : `transition-all duration-300`
- Shadow : `shadow-2xl` sur le dropdown

### Responsive
- Largeur flexible avec `flex-1`
- Dropdown fixe avec `fixed inset-0` overlay
- Scroll si trop de pays avec `max-h-80 overflow-y-auto`

---

## 📝 Exemple d'utilisation complet

```jsx
import PhoneInput from '../components/common/PhoneInput';

function MyForm() {
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('CI');

  return (
    <PhoneInput
      label="Votre numéro WhatsApp"
      value={phone}
      onChange={setPhone}
      placeholder="07 XX XX XX XX"
      defaultCountry={country}
      required
      error={phone && phone.length < 10 ? 'Numéro trop court' : null}
    />
  );
}
```

**Résultat :**
```
┌──────────────────────────────────┐
│ Votre numéro WhatsApp *          │
├──────────────────────────────────┤
│ [🇨🇮 +225 ▼] [07 12 34 56 78] │
├──────────────────────────────────┤
│ Exemple: +225 07 12 34 56 78     │
└──────────────────────────────────┘
```

---

## 🔄 Comparaison avant/après

### Avant
```jsx
<Input
  label="WhatsApp"
  type="tel"
  value={phone}
  onChange={(e) => setPhone(e.target.value)}
  placeholder="+225 07 XX XX XX XX"
/>
```

**Problèmes :**
- ❌ Pas de sélection de pays
- ❌ Utilisateur doit taper l'indicatif
- ❌ Pas de validation du format
- ❌ Pas visuel (pas de drapeau)

### Après
```jsx
<PhoneInput
  label="WhatsApp"
  value={phone}
  onChange={setPhone}
  placeholder="07 XX XX XX XX"
  defaultCountry="CI"
/>
```

**Avantages :**
- ✅ Sélection visuelle avec drapeaux
- ✅ Indicatif automatique
- ✅ Validation intégrée
- ✅ Format automatique
- ✅ UX moderne style Wave

---

## 🧪 Test rapide

### 1. Page d'inscription
```
1. Aller sur http://localhost:5173/auth
2. Cliquer "Inscription"
3. Scroller jusqu'à "WhatsApp (optionnel)"
4. Voir le composant avec 🇨🇮 +225
5. Cliquer sur le drapeau
6. Menu déroulant s'ouvre
7. Sélectionner un autre pays (ex: 🇸🇳 Sénégal)
8. Taper un numéro: 07 12 34 56 78
9. Valeur envoyée: +221 07 12 34 56 78
```

### 2. Page Paramètres
```
1. Se connecter
2. Aller sur Paramètres
3. Section "Numéros de contact"
4. Deux PhoneInput visibles
5. Tester la sélection de pays
```

---

## 🎯 Résultat final

### Interface utilisateur
- ✅ Moderne et professionnelle
- ✅ Drapeaux emoji (pas besoin d'images SVG)
- ✅ Dropdown fluide
- ✅ Responsive

### Expérience utilisateur
- ✅ Rapide (1 clic pour changer de pays)
- ✅ Intuitif (drapeaux reconnaissables)
- ✅ Validation automatique
- ✅ Pas d'erreurs de format

### Technique
- ✅ Composant réutilisable
- ✅ Props flexibles
- ✅ Gestion d'état propre
- ✅ Performance optimale

---

## 🚀 À ajouter plus tard (optionnel)

1. **Recherche dans le dropdown**
   - Input de recherche en haut
   - Filtrage en temps réel

2. **Détection automatique du pays**
   - Via IP géolocalisation
   - API : ipapi.co ou ipinfo.io

3. **Favoris**
   - Épingler pays fréquents en haut
   - Basé sur l'historique utilisateur

4. **Validation avancée**
   - Longueur spécifique par pays
   - Format national vs international

---

## 📖 Documentation technique

### Structure du fichier
```
PhoneInput.jsx
├── COUNTRIES array (12 pays)
├── PhoneInput component
│   ├── State (selectedCountry, isDropdownOpen, phoneNumber)
│   ├── handleCountrySelect
│   ├── handlePhoneChange
│   └── JSX
│       ├── Label
│       ├── Container flex
│       │   ├── Country selector button
│       │   │   └── Dropdown (conditional)
│       │   └── Number input
│       └── Helper text / Error
```

### Gestion du format
```javascript
// Input brut: "07123456"
// État interne: phoneNumber = "07123456"
// Valeur envoyée: "+225 07123456"

// Lors du changement de pays:
// selectedCountry = { dialCode: '+221', ... }
// onChange() est appelé avec nouvelle valeur
```

---

**✅ Composant PhoneInput installé et fonctionnel !**

**Style Wave avec drapeaux emoji 🇨🇮🇸🇳🇧🇯🇲🇱**

**Testez maintenant : http://localhost:5173/auth** 🚀
