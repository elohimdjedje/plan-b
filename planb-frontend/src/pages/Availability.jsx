import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MobileContainer from '../components/layout/MobileContainer';
import AvailabilityManager from '../components/availability/AvailabilityManager';

/**
 * Page de gestion des disponibilités pour les visites
 */
export default function Availability() {
  const navigate = useNavigate();

  return (
    <MobileContainer>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              Retour
            </button>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
              Mes disponibilités
            </h1>
            <p className="text-gray-400">
              Gérez vos créneaux de visite pour vos annonces
            </p>
          </div>

          {/* Gestionnaire de disponibilités */}
          <AvailabilityManager />
        </div>
      </div>
    </MobileContainer>
  );
}
