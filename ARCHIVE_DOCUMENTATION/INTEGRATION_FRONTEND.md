# 🎨 Guide d'intégration Frontend - Authentification simplifiée

## 🚀 API disponibles

| Endpoint | Méthode | Auth | Description |
|----------|---------|------|-------------|
| `/api/v1/auth/register` | POST | ❌ | Inscription (email, password, firstName, lastName) |
| `/api/v1/auth/login` | POST | ❌ | Connexion (email, password) |
| `/api/v1/auth/me` | GET | ✅ | Profil utilisateur |
| `/api/v1/auth/update-profile` | PUT | ✅ | Mise à jour profil (bio, whatsapp, country, city) |

---

## 📝 Schéma de données User

```typescript
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  bio?: string | null;
  whatsappPhone?: string | null;
  country?: string | null;
  city?: string | null;
  accountType: 'FREE' | 'PRO';
  isPro: boolean;
  profilePicture?: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  subscriptionExpiresAt?: string | null;
  createdAt: string;
}
```

---

## 🔧 Service API (TypeScript/JavaScript)

### authService.ts

```typescript
const API_URL = 'http://localhost:8000/api/v1';

export class AuthService {
  
  // Inscription
  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    country?: string;
    whatsappPhone?: string;
  }) {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de l\'inscription');
    }

    return await response.json();
  }

  // Connexion
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Identifiants invalides');
    }

    const data = await response.json();
    
    // Sauvegarder le token
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    return data;
  }

  // Déconnexion
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Récupérer le profil
  async getProfile() {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du profil');
    }

    return await response.json();
  }

  // Mettre à jour le profil
  async updateProfile(data: {
    bio?: string;
    whatsappPhone?: string;
    country?: string;
    city?: string;
    firstName?: string;
    lastName?: string;
  }) {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${API_URL}/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur lors de la mise à jour');
    }

    const result = await response.json();
    
    // Mettre à jour le localStorage
    localStorage.setItem('user', JSON.stringify(result.user));
    
    return result;
  }

  // Vérifier si connecté
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Récupérer l'utilisateur du localStorage
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const authService = new AuthService();
```

---

## ⚛️ Composants React

### 1. Page d'inscription

```tsx
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.register(formData);
      
      // Connexion automatique après inscription
      await authService.login(formData.email, formData.password);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <h1>Créer un compte</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="votre@email.com"
          />
        </div>

        <div className="form-group">
          <label>Mot de passe *</label>
          <input
            type="password"
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Prénom *</label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              placeholder="John"
            />
          </div>

          <div className="form-group">
            <label>Nom *</label>
            <input
              type="text"
              required
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              placeholder="Doe"
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Inscription...' : 'Créer mon compte'}
        </button>
      </form>

      <p className="login-link">
        Déjà un compte ? <a href="/login">Se connecter</a>
      </p>
    </div>
  );
};
```

### 2. Page de connexion

```tsx
import React, { useState } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Connexion</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
          />
        </div>

        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>

      <p className="register-link">
        Pas encore de compte ? <a href="/register">S'inscrire</a>
      </p>
    </div>
  );
};
```

### 3. Page Paramètres (Profil)

```tsx
import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const SettingsPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    whatsappPhone: '',
    country: '',
    city: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
      setFormData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        bio: profile.bio || '',
        whatsappPhone: profile.whatsappPhone || '',
        country: profile.country || '',
        city: profile.city || '',
      });
    } catch (err) {
      setError('Erreur lors du chargement du profil');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await authService.updateProfile(formData);
      setSuccess('Profil mis à jour avec succès !');
      await loadProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <h1>Paramètres du profil</h1>
      
      {success && <div className="success-message">{success}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <section className="section">
          <h2>Informations personnelles</h2>
          
          <div className="form-row">
            <div className="form-group">
              <label>Prénom</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Nom</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Bio (facultatif)</label>
            <textarea
              rows={4}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Parlez-nous de vous..."
            />
          </div>
        </section>

        <section className="section">
          <h2>Contact</h2>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
            />
            <small>L'email ne peut pas être modifié</small>
          </div>

          <div className="form-group">
            <label>WhatsApp (facultatif)</label>
            <input
              type="tel"
              value={formData.whatsappPhone}
              onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
              placeholder="+225 07 XX XX XX XX"
            />
          </div>
        </section>

        <section className="section">
          <h2>Localisation</h2>
          
          <div className="form-group">
            <label>Pays (facultatif)</label>
            <select
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            >
              <option value="">Sélectionner...</option>
              <option value="CI">Côte d'Ivoire</option>
              <option value="BJ">Bénin</option>
              <option value="SN">Sénégal</option>
              <option value="ML">Mali</option>
            </select>
          </div>

          <div className="form-group">
            <label>Ville (facultatif)</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              placeholder="Abidjan"
            />
          </div>
        </section>

        <section className="section">
          <h2>Abonnement</h2>
          <div className="account-info">
            <p>Type de compte : <strong>{user?.accountType}</strong></p>
            <p>Statut : {user?.isPro ? '✅ PRO' : '⭕ FREE'}</p>
            {user?.subscriptionExpiresAt && (
              <p>Expire le : {new Date(user.subscriptionExpiresAt).toLocaleDateString()}</p>
            )}
          </div>
        </section>

        <button type="submit" disabled={loading}>
          {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </div>
  );
};
```

### 4. Hook personnalisé useAuth

```tsx
import { useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const profile = await authService.getProfile();
        setUser(profile);
      }
    } catch (error) {
      authService.logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (data: any) => {
    await authService.register(data);
    return await login(data.email, data.password);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };
};
```

---

## 🛡️ Route protégée

```tsx
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Usage dans App.tsx
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  } />
  
  <Route path="/settings" element={
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  } />
</Routes>
```

---

## 🎨 CSS suggéré

```css
.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #007bff;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.error-message {
  padding: 1rem;
  background: #fee;
  color: #c33;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.success-message {
  padding: 1rem;
  background: #efe;
  color: #3c3;
  border-radius: 8px;
  margin-bottom: 1rem;
}

button[type="submit"] {
  width: 100%;
  padding: 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  background: #0056b3;
}

button[type="submit"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.section {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.section h2 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #333;
  font-size: 1.25rem;
}
```

---

## ✅ Checklist d'intégration

### Installation
- [ ] Installer React Router (`npm install react-router-dom`)
- [ ] Copier le service `authService.ts`
- [ ] Créer l'interface `User`

### Composants
- [ ] Créer `RegisterPage`
- [ ] Créer `LoginPage`
- [ ] Créer `SettingsPage`
- [ ] Créer `ProtectedRoute`
- [ ] Créer hook `useAuth`

### Configuration
- [ ] Configurer `API_URL` dans `authService.ts`
- [ ] Configurer les routes dans `App.tsx`
- [ ] Ajouter le CSS

### Tests
- [ ] Tester l'inscription
- [ ] Tester la connexion
- [ ] Tester la mise à jour du profil
- [ ] Tester la déconnexion
- [ ] Tester les routes protégées

---

## 🚀 Prêt pour l'intégration !

Tout le backend est fonctionnel et testé. Il ne reste plus qu'à créer le frontend !

**Bon développement ! 🎨**
