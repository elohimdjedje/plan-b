import PlanBLoader from '../animations/PlanBLoader';

/**
 * Écran de chargement pleine page style macOS
 */
export default function LoadingScreen({ text = 'Chargement...' }) {
  return <PlanBLoader text={text} />;
}
