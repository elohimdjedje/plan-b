import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Crown, CreditCard, TrendingUp, BarChart3, Eye, 
  CheckCircle, XCircle, Clock, Search, Filter, RefreshCw,
  ChevronDown, ChevronUp, ExternalLink, Shield, AlertCircle,
  DollarSign, Calendar, Phone, Mail, UserCheck, UserX,
  Package, ArrowUpRight, ArrowDownRight, Activity, Zap,
  Settings, LogOut, Home, Bell, Menu, X, Image, FileText,
  ChevronLeft, ChevronRight, MoreVertical, Check, Trash2,
  Infinity, Timer, Star, Download
} from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import adminAPI from '../api/admin';

// ==================== COMPOSANTS UTILITAIRES ====================

// Badge de statut
function StatusBadge({ status, size = 'sm' }) {
  const styles = {
    PRO: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white',
    FREE: 'bg-secondary-100 text-secondary-600',
    active: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    pending_verification: 'bg-orange-100 text-orange-700',
    completed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    failed: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-600',
    draft: 'bg-blue-100 text-blue-700',
    sold: 'bg-purple-100 text-purple-700'
  };

  const labels = {
    PRO: 'PRO',
    FREE: 'FREE',
    active: 'Actif',
    pending: 'En attente',
    pending_verification: 'À vérifier',
    completed: 'Confirmé',
    rejected: 'Rejeté',
    failed: 'Échoué',
    expired: 'Expiré',
    draft: 'Brouillon',
    sold: 'Vendu'
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px]',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${styles[status] || 'bg-gray-100 text-gray-600'} ${sizeClasses[size]}`}>
      {labels[status] || status}
    </span>
  );
}

// Carte statistique
function StatCard({ icon: Icon, label, value, subValue, trend, trendValue, color = 'primary', onClick }) {
  const colors = {
    primary: 'from-primary-500 to-orange-500',
    blue: 'from-blue-500 to-indigo-500',
    green: 'from-green-500 to-emerald-500',
    yellow: 'from-yellow-500 to-orange-400',
    purple: 'from-purple-500 to-pink-500',
    red: 'from-red-500 to-rose-500'
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-secondary-100 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trendValue}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-secondary-900">
          {typeof value === 'number' ? value.toLocaleString('fr-FR') : value}
        </p>
        <p className="text-sm text-secondary-600 mt-1">{label}</p>
        {subValue && (
          <p className="text-xs text-secondary-500 mt-1">{subValue}</p>
        )}
      </div>
    </motion.div>
  );
}

// Modal de confirmation
function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirmer', type = 'primary' }) {
  if (!isOpen) return null;

  const colors = {
    primary: 'bg-primary-500 hover:bg-primary-600',
    danger: 'bg-red-500 hover:bg-red-600',
    success: 'bg-green-500 hover:bg-green-600'
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <h3 className="text-lg font-bold text-secondary-900 mb-2">{title}</h3>
        <p className="text-secondary-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-secondary-100 text-secondary-700 rounded-xl font-medium hover:bg-secondary-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-2.5 text-white rounded-xl font-medium transition-colors ${colors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Modal d'activation PRO
function ActivateProModal({ isOpen, onClose, onConfirm, user }) {
  const [months, setMonths] = useState(1);

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl">
            <Crown size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-secondary-900">Activer PRO</h3>
            <p className="text-sm text-secondary-600">{user.fullName || user.email}</p>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            Durée de l'abonnement
          </label>
          <select
            value={months}
            onChange={(e) => setMonths(Number(e.target.value))}
            className="w-full px-4 py-3 bg-secondary-50 border border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none"
          >
            {[1, 2, 3, 6, 12].map(m => (
              <option key={m} value={m}>{m} mois</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-secondary-100 text-secondary-700 rounded-xl font-medium hover:bg-secondary-200 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(months)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Activer PRO
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== COMPOSANTS PRINCIPAUX ====================

// Section Tableau de bord
function DashboardSection({ stats, loading, onRefresh }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 animate-pulse">
            <div className="w-12 h-12 bg-secondary-200 rounded-xl mb-4" />
            <div className="h-6 bg-secondary-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-secondary-100 rounded w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  const { users, listings, payments, revenue } = stats?.dashboard || {};

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-secondary-900">Vue d'ensemble</h2>
          <p className="text-sm text-secondary-600">Statistiques globales de la plateforme</p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-secondary-100 rounded-xl hover:bg-secondary-200 transition-colors"
        >
          <RefreshCw size={20} className="text-secondary-600" />
        </button>
      </div>

      {/* Cartes stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Utilisateurs"
          value={users?.total || 0}
          subValue={`+${users?.newThisMonth || 0} ce mois`}
          color="blue"
        />
        <StatCard
          icon={Crown}
          label="Comptes PRO"
          value={users?.pro || 0}
          subValue={`${users?.free || 0} gratuits`}
          color="yellow"
        />
        <StatCard
          icon={Package}
          label="Annonces actives"
          value={listings?.active || 0}
          subValue={`${listings?.total || 0} total`}
          color="green"
        />
        <StatCard
          icon={DollarSign}
          label="Revenus"
          value={`${((revenue?.total || 0) / 1000).toFixed(0)}k`}
          subValue="FCFA"
          color="primary"
        />
      </div>

      {/* Stats secondaires */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Clock}
          label="Paiements en attente"
          value={payments?.pending || 0}
          color="yellow"
        />
        <StatCard
          icon={CheckCircle}
          label="Paiements confirmés"
          value={payments?.completed || 0}
          color="green"
        />
        <StatCard
          icon={FileText}
          label="Brouillons"
          value={listings?.draft || 0}
          color="blue"
        />
        <StatCard
          icon={AlertCircle}
          label="Annonces expirées"
          value={listings?.expired || 0}
          color="red"
        />
      </div>
    </div>
  );
}

// Section Paiements en attente
function PendingPaymentsSection({ onUserClick }) {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState({ open: false, payment: null, action: null });

  const loadPayments = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getPendingPayments();
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Erreur chargement paiements:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleConfirm = async (payment) => {
    try {
      await adminAPI.confirmPayment(payment.id);
      toast.success(`✅ PRO activé pour ${payment.user.fullName || payment.user.email}`);
      loadPayments();
    } catch (error) {
      toast.error('Erreur lors de la confirmation');
    }
    setConfirmModal({ open: false, payment: null, action: null });
  };

  const handleReject = async (payment) => {
    try {
      await adminAPI.rejectPayment(payment.id, 'Paiement non reçu');
      toast.success('Paiement rejeté');
      loadPayments();
    } catch (error) {
      toast.error('Erreur lors du rejet');
    }
    setConfirmModal({ open: false, payment: null, action: null });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 animate-pulse">
        <div className="h-6 bg-secondary-200 rounded w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-20 bg-secondary-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
      <div className="p-4 border-b border-secondary-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-xl">
            <Clock size={20} className="text-orange-600" />
          </div>
          <div>
            <h3 className="font-bold text-secondary-900">Paiements à vérifier</h3>
            <p className="text-xs text-secondary-500">{payments.length} en attente</p>
          </div>
        </div>
        <button
          onClick={loadPayments}
          className="p-2 hover:bg-secondary-100 rounded-xl transition-colors"
        >
          <RefreshCw size={18} className="text-secondary-500" />
        </button>
      </div>

      {payments.length === 0 ? (
        <div className="p-8 text-center">
          <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
          <p className="text-secondary-600">Aucun paiement en attente</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary-100">
          {payments.map((payment) => {
            const wavePhone = payment.metadata?.phone || payment.metadata?.phoneNumber;
            const profilePhone = payment.user.phone;
            const phonesMatch = wavePhone && profilePhone && wavePhone.replace(/\s/g, '') === profilePhone.replace(/\s/g, '');
            
            return (
              <div key={payment.id} className="p-4 hover:bg-secondary-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => onUserClick && onUserClick(payment.user)}
                  >
                    {/* Infos utilisateur */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {(payment.user.fullName || payment.user.email)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-secondary-900">
                          {payment.user.fullName || payment.user.email}
                        </p>
                        <p className="text-xs text-secondary-500">
                          {payment.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Numéros de téléphone - IMPORTANT pour vérification */}
                    <div className="bg-secondary-50 rounded-xl p-3 mb-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-secondary-500 flex items-center gap-1">
                          <Phone size={12} className="text-green-500" />
                          N° Wave (paiement):
                        </span>
                        <span className={`font-bold text-sm ${wavePhone ? 'text-green-600' : 'text-secondary-400'}`}>
                          {wavePhone || 'Non renseigné'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-secondary-500 flex items-center gap-1">
                          <Phone size={12} className="text-blue-500" />
                          N° Profil:
                        </span>
                        <span className={`font-medium text-sm ${profilePhone ? 'text-blue-600' : 'text-secondary-400'}`}>
                          {profilePhone || 'Non renseigné'}
                        </span>
                      </div>
                      {wavePhone && profilePhone && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${phonesMatch ? 'text-green-600' : 'text-orange-500'}`}>
                          {phonesMatch ? (
                            <>
                              <CheckCircle size={14} />
                              Numéros identiques ✓
                            </>
                          ) : (
                            <>
                              <AlertCircle size={14} />
                              Numéros différents - Vérifier!
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Détails du paiement */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <span className="font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                        {payment.amount?.toLocaleString()} {payment.currency}
                      </span>
                      <span className="text-secondary-600 bg-secondary-100 px-2 py-1 rounded-lg">
                        {payment.metadata?.months || 1} mois PRO
                      </span>
                      <span className="text-secondary-400 text-xs">
                        {formatDistanceToNow(parseISO(payment.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                  </div>

                  {/* Boutons d'action */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setConfirmModal({ open: true, payment, action: 'confirm' })}
                      className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-600 rounded-xl hover:bg-green-200 transition-colors font-medium text-sm"
                      title="Confirmer le paiement"
                    >
                      <Check size={16} />
                      Confirmer
                    </button>
                    <button
                      onClick={() => setConfirmModal({ open: true, payment, action: 'reject' })}
                      className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors font-medium text-sm"
                      title="Rejeter le paiement"
                    >
                      <X size={16} />
                      Rejeter
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, payment: null, action: null })}
        onConfirm={() => {
          if (confirmModal.action === 'confirm') {
            handleConfirm(confirmModal.payment);
          } else {
            handleReject(confirmModal.payment);
          }
        }}
        title={confirmModal.action === 'confirm' ? 'Confirmer le paiement' : 'Rejeter le paiement'}
        message={
          confirmModal.action === 'confirm'
            ? `Confirmer le paiement de ${confirmModal.payment?.amount?.toLocaleString()} FCFA et activer le compte PRO pour ${confirmModal.payment?.user?.fullName || confirmModal.payment?.user?.email} ?`
            : `Rejeter le paiement de ${confirmModal.payment?.user?.fullName || confirmModal.payment?.user?.email} ?`
        }
        confirmText={confirmModal.action === 'confirm' ? 'Confirmer' : 'Rejeter'}
        type={confirmModal.action === 'confirm' ? 'success' : 'danger'}
      />
    </div>
  );
}

// Section Utilisateurs
function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, FREE, PRO
  const [selectedUser, setSelectedUser] = useState(null);
  const [activateModal, setActivateModal] = useState({ open: false, user: null });
  const [confirmModal, setConfirmModal] = useState({ open: false, user: null, action: null });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.accountType = filter;
      if (search) params.search = search;
      
      const data = await adminAPI.getUsers(params);
      setUsers(data.users || []);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [filter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (search !== '') loadUsers();
    }, 500);
    return () => clearTimeout(debounce);
  }, [search]);

  const handleActivatePro = async (months) => {
    try {
      await adminAPI.activatePro(activateModal.user.id, months);
      toast.success(`✅ PRO activé pour ${months} mois`);
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de l\'activation');
    }
    setActivateModal({ open: false, user: null });
  };

  const handleDeactivatePro = async (user) => {
    try {
      await adminAPI.deactivatePro(user.id);
      toast.success('PRO désactivé');
      loadUsers();
    } catch (error) {
      toast.error('Erreur lors de la désactivation');
    }
    setConfirmModal({ open: false, user: null, action: null });
  };

  const handleSetLifetimePro = async (user) => {
    try {
      await adminAPI.setLifetimePro(user.id);
      toast.success('PRO illimité activé');
      loadUsers();
    } catch (error) {
      toast.error('Erreur');
    }
    setConfirmModal({ open: false, user: null, action: null });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-secondary-100">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Recherche */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-400" />
            <input
              type="text"
              placeholder="Rechercher par email ou téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-secondary-50 border border-secondary-200 rounded-xl focus:border-primary-500 focus:outline-none"
            />
          </div>
          
          {/* Filtres */}
          <div className="flex gap-2">
            {['all', 'FREE', 'PRO'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-500 text-white'
                    : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                }`}
              >
                {f === 'all' ? 'Tous' : f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-secondary-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="p-8 text-center">
          <Users size={48} className="mx-auto text-secondary-300 mb-3" />
          <p className="text-secondary-600">Aucun utilisateur trouvé</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary-100 max-h-[500px] overflow-y-auto">
          {users.map((user) => (
            <div key={user.id} className="p-4 hover:bg-secondary-50 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    user.accountType === 'PRO' 
                      ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                      : 'bg-secondary-400'
                  }`}>
                    {(user.fullName || user.email)?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-secondary-900 truncate">
                        {user.fullName || 'Sans nom'}
                      </p>
                      <StatusBadge status={user.accountType} size="xs" />
                      {user.isLifetimePro && (
                        <span className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded-full">
                          <Infinity size={12} />
                          Illimité
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-secondary-500">
                      <span className="flex items-center gap-1">
                        <Mail size={12} />
                        {user.email}
                      </span>
                      {user.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={12} />
                          {user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.subscriptionExpiresAt && (
                    <span className="text-xs text-secondary-500 hidden md:block">
                      Expire: {format(parseISO(user.subscriptionExpiresAt), 'dd/MM/yyyy')}
                    </span>
                  )}
                  
                  {user.accountType === 'FREE' ? (
                    <button
                      onClick={() => setActivateModal({ open: true, user })}
                      className="px-3 py-1.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Activer PRO
                    </button>
                  ) : (
                    <div className="flex gap-1">
                      {!user.isLifetimePro && (
                        <button
                          onClick={() => setConfirmModal({ open: true, user, action: 'lifetime' })}
                          className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors"
                          title="PRO illimité"
                        >
                          <Infinity size={16} />
                        </button>
                      )}
                      <button
                        onClick={() => setConfirmModal({ open: true, user, action: 'deactivate' })}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Désactiver PRO"
                      >
                        <UserX size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal activation PRO */}
      <ActivateProModal
        isOpen={activateModal.open}
        onClose={() => setActivateModal({ open: false, user: null })}
        onConfirm={handleActivatePro}
        user={activateModal.user}
      />

      {/* Modal confirmation */}
      <ConfirmModal
        isOpen={confirmModal.open}
        onClose={() => setConfirmModal({ open: false, user: null, action: null })}
        onConfirm={() => {
          if (confirmModal.action === 'deactivate') {
            handleDeactivatePro(confirmModal.user);
          } else if (confirmModal.action === 'lifetime') {
            handleSetLifetimePro(confirmModal.user);
          }
        }}
        title={confirmModal.action === 'deactivate' ? 'Désactiver PRO' : 'PRO Illimité'}
        message={
          confirmModal.action === 'deactivate'
            ? `Désactiver le compte PRO de ${confirmModal.user?.fullName || confirmModal.user?.email} ?`
            : `Activer le PRO illimité pour ${confirmModal.user?.fullName || confirmModal.user?.email} ?`
        }
        confirmText={confirmModal.action === 'deactivate' ? 'Désactiver' : 'Activer'}
        type={confirmModal.action === 'deactivate' ? 'danger' : 'success'}
      />
    </div>
  );
}

// Section Historique Paiements
function PaymentsHistorySection() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const loadPayments = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const data = await adminAPI.getAllPayments(params);
      setPayments(data.payments || []);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const statusColors = {
    completed: 'text-green-600',
    pending: 'text-yellow-600',
    pending_verification: 'text-orange-600',
    rejected: 'text-red-600',
    failed: 'text-red-600'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-secondary-100 overflow-hidden">
      <div className="p-4 border-b border-secondary-100 flex items-center justify-between">
        <h3 className="font-bold text-secondary-900">Historique des paiements</h3>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-3 py-1.5 bg-secondary-50 border border-secondary-200 rounded-lg text-sm"
        >
          <option value="all">Tous</option>
          <option value="completed">Confirmés</option>
          <option value="pending_verification">À vérifier</option>
          <option value="rejected">Rejetés</option>
        </select>
      </div>

      {loading ? (
        <div className="p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-secondary-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <div className="p-8 text-center">
          <CreditCard size={48} className="mx-auto text-secondary-300 mb-3" />
          <p className="text-secondary-600">Aucun paiement</p>
        </div>
      ) : (
        <div className="divide-y divide-secondary-100 max-h-[400px] overflow-y-auto">
          {payments.map((payment) => (
            <div key={payment.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  payment.status === 'completed' ? 'bg-green-500' :
                  payment.status === 'pending_verification' ? 'bg-orange-500' :
                  payment.status === 'rejected' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <p className="font-medium text-secondary-900">
                    {payment.user?.fullName || payment.user?.email}
                  </p>
                  <p className="text-xs text-secondary-500">
                    {format(parseISO(payment.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-secondary-900">
                  {payment.amount?.toLocaleString()} {payment.currency}
                </p>
                <StatusBadge status={payment.status} size="xs" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL ====================

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Vérifier si admin
  useEffect(() => {
    if (!user?.roles?.includes('ROLE_ADMIN')) {
      toast.error('Accès non autorisé');
      navigate('/');
    }
  }, [user, navigate]);

  // Charger les stats
  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDashboard();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement dashboard:', error);
      if (error.response?.status === 403) {
        toast.error('Accès non autorisé');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
    { id: 'payments', icon: CreditCard, label: 'Paiements', badge: stats?.dashboard?.payments?.pending },
    { id: 'users', icon: Users, label: 'Utilisateurs' },
    { id: 'history', icon: Clock, label: 'Historique' },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-secondary-200 z-50 transform transition-transform lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Shield size={24} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-secondary-900">Admin</h1>
              <p className="text-xs text-secondary-500">PlanB Dashboard</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-secondary-600 hover:bg-secondary-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Footer sidebar */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-2 text-secondary-600 hover:bg-secondary-50 rounded-xl transition-colors"
          >
            <Home size={20} />
            <span>Retour au site</span>
          </button>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors mt-1"
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b border-secondary-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-secondary-100 rounded-xl"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-secondary-900">
                  {menuItems.find(m => m.id === activeTab)?.label}
                </h1>
                <p className="text-sm text-secondary-500">
                  {format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-secondary-600">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user?.firstName?.[0] || 'A'}
                </div>
                <span>{user?.firstName || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-4 lg:p-6 space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <DashboardSection stats={stats} loading={loading} onRefresh={loadStats} />
                <div className="grid lg:grid-cols-2 gap-6">
                  <PendingPaymentsSection />
                  <PaymentsHistorySection />
                </div>
              </motion.div>
            )}

            {activeTab === 'payments' && (
              <motion.div
                key="payments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PendingPaymentsSection />
              </motion.div>
            )}

            {activeTab === 'users' && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <UsersSection />
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <PaymentsHistorySection />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
