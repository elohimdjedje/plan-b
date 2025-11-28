import { z } from 'zod';

/**
 * Schémas de validation Zod pour toutes les entrées utilisateur
 * Utilisez ces schémas dans vos composants et API calls
 */

// ========== Authentification ==========

/**
 * Schéma de validation pour le login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide')
    .min(5, 'Email trop court')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(255, 'Mot de passe trop long')
});

/**
 * Schéma de validation pour l'inscription
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Adresse email invalide')
    .min(5, 'Email trop court')
    .max(255, 'Email trop long'),
  password: z
    .string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[!@#$%^&*]/, 'Doit contenir au moins un caractère spécial (!@#$%^&*)'),
  confirmPassword: z.string(),
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long'),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long'),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide'),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'Vous devez accepter les conditions d\'utilisation'
  })
}).refine(data => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

/**
 * Schéma de validation pour la vérification OTP
 */
export const otpSchema = z.object({
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide'),
  code: z
    .string()
    .length(6, 'Le code OTP doit contenir 6 chiffres')
    .regex(/^[0-9]{6}$/, 'Le code OTP doit contenir uniquement des chiffres')
});

// ========== Annonces (Listings) ==========

/**
 * Schéma de validation pour la création d'annonce
 */
export const createListingSchema = z.object({
  title: z
    .string()
    .min(10, 'Le titre doit contenir au moins 10 caractères')
    .max(100, 'Le titre ne doit pas dépasser 100 caractères'),
  description: z
    .string()
    .min(50, 'La description doit contenir au moins 50 caractères')
    .max(5000, 'La description ne doit pas dépasser 5000 caractères'),
  category: z
    .string()
    .min(1, 'Vous devez sélectionner une catégorie'),
  price: z
    .number()
    .positive('Le prix doit être positif')
    .max(999999999, 'Le prix est trop élevé'),
  priceUnit: z.enum(['XOF', 'USD', 'EUR'], {
    errorMap: () => ({ message: 'Devise invalide' })
  }),
  location: z
    .string()
    .min(3, 'La localisation doit contenir au moins 3 caractères'),
  condition: z.enum(['new', 'like-new', 'used', 'for-parts'], {
    errorMap: () => ({ message: 'État du produit invalide' })
  }),
  contactMethod: z.enum(['phone', 'whatsapp', 'email', 'both'], {
    errorMap: () => ({ message: 'Méthode de contact invalide' })
  })
});

/**
 * Schéma de validation pour la mise à jour d'annonce
 */
export const updateListingSchema = createListingSchema.partial().extend({
  id: z.string().uuid('ID d\'annonce invalide')
});

// ========== Profil Utilisateur ==========

/**
 * Schéma de validation pour la mise à jour du profil
 */
export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, 'Le prénom doit contenir au moins 2 caractères')
    .max(50, 'Le prénom est trop long')
    .optional(),
  lastName: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom est trop long')
    .optional(),
  email: z
    .string()
    .email('Adresse email invalide')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Numéro de téléphone invalide')
    .optional(),
  bio: z
    .string()
    .max(500, 'La bio ne doit pas dépasser 500 caractères')
    .optional(),
  profileImage: z
    .string()
    .url('URL d\'image invalide')
    .optional()
}).strict();

/**
 * Schéma de validation pour le changement de mot de passe
 */
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  newPassword: z
    .string()
    .min(12, 'Le nouveau mot de passe doit contenir au moins 12 caractères')
    .regex(/[A-Z]/, 'Doit contenir au least une majuscule')
    .regex(/[a-z]/, 'Doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Doit contenir au moins un chiffre')
    .regex(/[!@#$%^&*]/, 'Doit contenir au moins un caractère spécial'),
  confirmPassword: z.string()
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
}).refine(data => data.currentPassword !== data.newPassword, {
  message: 'Le nouveau mot de passe doit être différent du mot de passe actuel',
  path: ['newPassword']
});

// ========== Avis et Évaluations ==========

/**
 * Schéma de validation pour les avis
 */
export const createReviewSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, 'L\'évaluation doit être au minimum 1')
    .max(5, 'L\'évaluation ne peut pas dépasser 5'),
  comment: z
    .string()
    .min(10, 'Le commentaire doit contenir au moins 10 caractères')
    .max(1000, 'Le commentaire ne doit pas dépasser 1000 caractères')
    .optional(),
  sellerId: z
    .string()
    .uuid('ID de vendeur invalide'),
  listingId: z
    .string()
    .uuid('ID d\'annonce invalide')
    .optional()
});

// ========== Messages et Conversations ==========

/**
 * Schéma de validation pour les messages
 */
export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Le message ne peut pas être vide')
    .max(5000, 'Le message est trop long'),
  conversationId: z
    .string()
    .uuid('ID de conversation invalide'),
  image: z
    .string()
    .url('URL d\'image invalide')
    .optional()
});

// ========== Utilitaires de validation ==========

/**
 * Valide les données avec un schéma Zod
 * Retourne { success, data, errors }
 */
export const validateData = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return {
      success: true,
      data: validatedData,
      errors: {}
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return {
        success: false,
        data: null,
        errors
      };
    }
    return {
      success: false,
      data: null,
      errors: { general: 'Erreur de validation' }
    };
  }
};

/**
 * Hook personnalisé pour la validation
 */
export const useValidation = (schema) => {
  const [errors, setErrors] = React.useState({});

  const validate = (data) => {
    const result = validateData(schema, data);
    setErrors(result.errors);
    return result.success;
  };

  const clearErrors = () => setErrors({});

  return { validate, errors, clearErrors };
};
