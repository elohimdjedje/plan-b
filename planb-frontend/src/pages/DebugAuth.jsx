import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../api/axios';

/**
 * Page de debug pour diagnostiquer les problèmes d'authentification
 */
export default function DebugAuth() {
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const authStore = useAuthStore();
  
  const runDiagnostic = async () => {
    setLoading(true);
    const results = [];
    
    // 1. Vérifier localStorage
    const token = localStorage.getItem('token');
    results.push({
      test: 'Token dans localStorage',
      pass: !!token,
      value: token ? token.substring(0, 50) + '...' : 'null'
    });
    
    // 2. Vérifier le store Zustand
    results.push({
      test: 'Store isAuthenticated',
      pass: authStore.isAuthenticated,
      value: String(authStore.isAuthenticated)
    });
    
    results.push({
      test: 'Store user',
      pass: !!authStore.user,
      value: authStore.user?.email || 'null'
    });
    
    results.push({
      test: 'Store token',
      pass: !!authStore.token,
      value: authStore.token ? authStore.token.substring(0, 50) + '...' : 'null'
    });
    
    // 3. Tester l'API /auth/me
    if (token) {
      try {
        const response = await api.get('/auth/me');
        results.push({
          test: 'API /auth/me',
          pass: true,
          value: response.data?.email || 'Succès sans email'
        });
      } catch (error) {
        results.push({
          test: 'API /auth/me',
          pass: false,
          value: `Erreur ${error.response?.status}: ${error.message}`
        });
      }
    } else {
      results.push({
        test: 'API /auth/me',
        pass: false,
        value: 'Non testé (pas de token)'
      });
    }
    
    // 4. Vérifier le token après l'appel API
    const tokenAfter = localStorage.getItem('token');
    results.push({
      test: 'Token après API call',
      pass: !!tokenAfter,
      value: tokenAfter ? tokenAfter.substring(0, 50) + '...' : 'SUPPRIMÉ!'
    });
    
    // 5. Tester une route protégée fictive
    if (token) {
      try {
        const response = await api.get('/users/my-listings');
        results.push({
          test: 'API /users/my-listings',
          pass: true,
          value: `${response.data?.length || 0} annonces`
        });
      } catch (error) {
        results.push({
          test: 'API /users/my-listings',
          pass: false,
          value: `Erreur ${error.response?.status}: ${error.message}`
        });
      }
    }
    
    setTestResult(results);
    setLoading(false);
  };
  
  const forceLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'aurianedjedje01@gmail.com',
          password: 'Admin123!'
        })
      });
      const data = await response.json();
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        if (window.useAuthStore && data.user) {
          window.useAuthStore.getState().login(data.user, data.token);
        }
        alert('Connexion forcée réussie! Token: ' + data.token.substring(0, 30) + '...');
        runDiagnostic();
      } else {
        alert('Erreur: ' + JSON.stringify(data));
      }
    } catch (error) {
      alert('Erreur: ' + error.message);
    }
    setLoading(false);
  };
  
  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('planb-auth-storage');
    if (window.useAuthStore) {
      window.useAuthStore.getState().logout();
    }
    runDiagnostic();
  };
  
  useEffect(() => {
    runDiagnostic();
  }, []);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">🔍 Debug Authentification</h1>
      
      <div className="flex gap-4 mb-8">
        <button
          onClick={runDiagnostic}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Test en cours...' : '🔄 Re-tester'}
        </button>
        <button
          onClick={forceLogin}
          disabled={loading}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 disabled:opacity-50"
        >
          🔑 Forcer la connexion
        </button>
        <button
          onClick={clearAuth}
          className="px-4 py-2 bg-red-600 rounded hover:bg-red-700"
        >
          🗑️ Vider l'authentification
        </button>
      </div>
      
      {testResult && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Résultats des tests :</h2>
          {testResult.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${result.pass ? 'bg-green-900/50 border border-green-500' : 'bg-red-900/50 border border-red-500'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-2xl">{result.pass ? '✅' : '❌'}</span>
                <span className="font-medium">{result.test}</span>
              </div>
              <div className="mt-2 text-sm text-gray-300 font-mono break-all">
                {result.value}
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-800 rounded-lg">
        <h3 className="font-semibold mb-2">État actuel du Store:</h3>
        <pre className="text-xs font-mono overflow-auto">
          {JSON.stringify({
            isAuthenticated: authStore.isAuthenticated,
            user: authStore.user,
            token: authStore.token ? authStore.token.substring(0, 50) + '...' : null,
            accountType: authStore.accountType
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
}
