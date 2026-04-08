// 98 Fitness Club Constants

export const GYM_EQUIPMENT = [
  // Mancuernas
  "Mancuernas (2.5kg - 40kg)",
  // Cardio
  "Trotadoras (8)",
  "Elípticas (8)",
  // Pecho
  "Pec deck",
  "Pec fly/Rear delt",
  "Chest press",
  "Press inclinado con barra",
  "Press plano con barra",
  // Brazos
  "Curl predicador en máquina",
  "Curl de pie en máquina",
  "Seated dip",
  // Hombros
  "Shoulder press",
  "Elevaciones laterales en máquina",
  // Piernas
  "Elevación de talones",
  "Patada de glúteo en máquina",
  "Hip thrust en máquina",
  "Aductor",
  "Hacka squat hammer",
  "Sentadilla libre",
  "Prensa",
  "Máquina Smith",
  "Seated leg curl",
  "Total hip",
  "Leg extension",
  "Rotary calf",
  "Extensión de cadera en máquina",
  // Espalda
  "Poleas fijas (2)",
  "Poleas ajustables (2)",
  "Jalón al pecho (2)",
  "Remo sentado en cable (2)",
  "Remo T",
  "Jalón al pecho rebundante en máquina",
  "Remo sentado en máquina",
  // Core
  "Crunch abdominal en máquina",
];

export const TRAINING_LEVELS = {
  principiante: {
    label: "Principiante",
    frequency: "2-3 días",
    volume: "8-10 series semanales por grupo muscular",
    focus: "Técnica (semanas 1-2), luego RIR",
  },
  intermedio: {
    label: "Intermedio",
    frequency: "4-5 días",
    volume: "12-16 series semanales por grupo muscular",
    focus: "Sobrecarga progresiva, técnicas de intensidad",
  },
  avanzado: {
    label: "Avanzado",
    frequency: "5-6 días",
    volume: "16-20 series semanales por grupo muscular",
    focus: "Drop sets, Rest-pause, Sobrecarga progresiva",
  },
};

export const TRAINING_OBJECTIVES = {
  perdida_grasa: {
    label: "Pérdida de Grasa",
    warmup: 20,
    description: "Enfocado en déficit calórico y cardio",
  },
  hipertrofia: {
    label: "Hipertrofia",
    warmup: 10,
    description: "Enfocado en ganancia de masa muscular",
  },
  recomposicion: {
    label: "Recomposición Corporal",
    warmup: 20,
    description: "Pérdida de grasa y ganancia muscular simultánea",
  },
};

export const TRAINING_FOCUS = {
  tren_superior: {
    label: "Tren Superior",
    muscles: ["Pecho", "Espalda", "Hombros", "Brazos"],
  },
  gluteo_pierna: {
    label: "Glúteo/Pierna",
    muscles: ["Cuádriceps", "Isquiotibiales", "Glúteos", "Pantorrillas"],
  },
  full_body: {
    label: "Full Body",
    muscles: ["Todo el cuerpo"],
  },
  push_pull_legs: {
    label: "Push/Pull/Legs",
    muscles: ["Empuje", "Tirón", "Piernas"],
  },
};

export const SOCIAL_LINKS = {
  instagram: "", // TODO: añadir link de Instagram
  whatsapp: "", // TODO: añadir link de WhatsApp
  whatsappNumber: "", // TODO: añadir número de WhatsApp
  tiktok: "", // TODO: añadir link de TikTok
  maps: "", // TODO: añadir link de Google Maps
};

export const BOGOTA_FOODS = {
  proteins: [
    "Pollo (pechuga)",
    "Huevos",
    "Carne de res magra",
    "Pescado (mojarra, tilapia)",
    "Atún en agua",
    "Cerdo magro",
    "Queso campesino",
    "Cuajada",
  ],
  carbs: [
    "Arroz integral",
    "Papa criolla",
    "Papa pastusa",
    "Plátano maduro",
    "Plátano verde",
    "Yuca",
    "Avena en hojuelas",
    "Arepa de maíz",
    "Pan integral",
  ],
  fats: [
    "Aguacate",
    "Aceite de oliva",
    "Maní",
    "Almendras",
    "Mantequilla de maní",
  ],
  vegetables: [
    "Espinaca",
    "Brócoli",
    "Tomate",
    "Cebolla",
    "Pimentón",
    "Zanahoria",
    "Lechuga",
    "Habichuela",
  ],
  fruits: [
    "Banano",
    "Manzana",
    "Fresas",
    "Mango",
    "Papaya",
    "Guayaba",
    "Maracuyá",
    "Lulo",
  ],
};
