import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export const registerSchema = z.object({
  name: z.string().min(2, { message: "Le nom complet est requis" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
});

export const createMissionSchema = z.object({
  title: z.string().min(5, { message: "Le titre doit contenir au moins 5 caractères" }),
  category: z.string().min(1, { message: "Veuillez sélectionner une catégorie" }),
  description: z.string().min(20, { message: "La description doit être plus détaillée (20 caractères minimum)" }),
  budget: z.coerce.number().min(5, { message: "Le budget minimum est de 5€" }),
  location: z.string().min(3, { message: "L'adresse ou la ville est requise" }),
  date: z.string().min(1, { message: "La date d'exécution est requise" }),
  duration: z.string().min(1, { message: "La durée estimée est requise" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
export type CreateMissionFormValues = z.infer<typeof createMissionSchema>;
