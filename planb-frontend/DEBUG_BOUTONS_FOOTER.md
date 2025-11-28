# 🔍 Debug : Boutons Footer

## ✅ Modifications Appliquées

### 1. **Overflow Hidden**
```jsx
className="... overflow-hidden"
```
Le modal principal a `overflow-hidden` pour empêcher le débordement.

### 2. **Z-Index Élevé**
```jsx
className="... z-20"
```
Le footer a `z-20` pour être au-dessus du contenu.

### 3. **Hauteurs Minimales**
```jsx
Footer : min-h-[80px]
Boutons : min-h-[48px]
```
Garantit que les boutons ont une taille minimale visible.

---

## 🎯 Structure Actuelle

```jsx
<motion.div className="h-[85vh] flex flex-col overflow-hidden">
  
  {/* Header - ~60px */}
  <div className="flex-shrink-0 ...">
    Rechercher
  </div>
  
  {/* Contenu - Reste de l'espace */}
  <div className="flex-1 overflow-y-auto ...">
    ... Filtres ...
  </div>
  
  {/* Footer - MIN 80px */}
  <div className="flex-shrink-0 min-h-[80px] z-20 ...">
    <Button className="min-h-[48px]">Réinitialiser</Button>
    <Button className="min-h-[48px]">Rechercher</Button>
  </div>
  
</motion.div>
```

---

## 🧪 Test de Debug

### Rechargez : **http://localhost:5173**

### Test 1 : Ouvrir le Modal
1. Cliquez sur l'icône ⚙️ (filtres)
2. Le modal doit s'ouvrir

### Test 2 : Vérifier la Hauteur
1. Ouvrez les **DevTools** (F12)
2. Inspectez l'élément du modal
3. Vérifiez que la hauteur est `85vh`

### Test 3 : Vérifier le Footer
1. Dans les DevTools, trouvez le `div` avec `flex-shrink-0 min-h-[80px]`
2. Vérifiez qu'il a bien une hauteur d'au moins 80px
3. Vérifiez qu'il est bien visible en bas du modal

### Test 4 : Vérifier les Boutons
1. Trouvez les éléments `<button>` dans le footer
2. Vérifiez qu'ils ont une hauteur d'au moins 48px
3. Vérifiez qu'ils sont visibles

---

## 🔧 Si Toujours Invisible

### Option A : Vérifier avec DevTools
```
1. F12 → Elements
2. Cherchez "Réinitialiser" dans le code
3. Si trouvé → Le bouton existe mais est caché
4. Si non trouvé → Problème de rendu
```

### Option B : Forcer l'Affichage
Si le bouton existe mais n'est pas visible, ajoutez temporairement :
```jsx
<div style={{
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  background: 'red',
  padding: '20px',
  zIndex: 9999
}}>
  TEST BOUTONS
</div>
```

### Option C : Problème de Hauteur du Navigateur
Le problème pourrait venir de `85vh` qui ne se calcule pas bien.

**Solution alternative :**
Utilisez `calc()` :
```jsx
className="h-[calc(100vh-80px)]"
```

---

## 📸 Capture d'Écran Debug

**Ouvrez DevTools et prenez une capture d'écran de :**
1. L'onglet "Elements" avec le modal ouvert
2. L'onglet "Computed" du footer
3. La hauteur calculée du modal

---

## 🎨 CSS Debug Temporaire

Ajoutez temporairement au footer pour forcer la visibilité :

```jsx
<div className="... bg-red-500 text-white">
  {/* Pour debug - fond rouge */}
  <Button>Réinitialiser</Button>
  <Button>Rechercher</Button>
</div>
```

Si vous voyez du rouge → Le footer existe
Si pas de rouge → Problème de structure

---

## 🔥 Solution de Secours

Si rien ne marche, utilisez cette structure alternative :

```jsx
<div className="fixed inset-0 z-50">
  <div className="absolute bottom-0 left-0 right-0 bg-white" 
       style={{ height: '85vh' }}>
    
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '100%' 
    }}>
      {/* Header */}
      <div style={{ flexShrink: 0 }}>...</div>
      
      {/* Contenu */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto' 
      }}>...</div>
      
      {/* Footer */}
      <div style={{ 
        flexShrink: 0, 
        minHeight: '80px',
        background: 'white',
        zIndex: 20
      }}>
        <button>Réinitialiser</button>
        <button>Rechercher</button>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 Checklist de Vérification

- [ ] Le modal s'ouvre bien
- [ ] La hauteur du modal est 85vh (DevTools)
- [ ] Le footer existe dans le DOM
- [ ] Le footer a `min-h-[80px]`
- [ ] Les boutons ont `min-h-[48px]`
- [ ] Le footer a `z-20`
- [ ] Le modal a `overflow-hidden`
- [ ] Le contenu a `overflow-y-auto`

---

**Rechargez et testez ! Si toujours invisible, envoyez une capture d'écran des DevTools ! 📸**
