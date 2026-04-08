import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Build exercise catalog from database for AI prompt with equipment classification
function buildExerciseCatalog(exerciseImages: ExerciseImageRecord[]): string {
  const grouped: Record<string, { name: string; equipment: string | null }[]> = {};
  
  // Count by equipment type for anti-saturation stats
  const equipmentStats = { maquina: 0, mancuernas: 0, peso_corporal: 0, other: 0 };
  
  for (const img of exerciseImages) {
    const group = img.muscle_group || "otros";
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push({
      name: img.exercise_name,
      equipment: img.equipment
    });
    
    // Track equipment distribution
    if (img.equipment === "maquina") equipmentStats.maquina++;
    else if (img.equipment === "mancuernas") equipmentStats.mancuernas++;
    else if (img.equipment === "peso_corporal") equipmentStats.peso_corporal++;
    else equipmentStats.other++;
  }
  
  let catalog = "CATÁLOGO DE EJERCICIOS DISPONIBLES (SOLO PUEDES USAR ESTOS):\n\n";
  catalog += "⚠️ REGLA FUNDAMENTAL: NO inventes ejercicios. Usa ÚNICAMENTE los ejercicios de esta lista.\n";
  catalog += "Si necesitas un ejercicio que no está en la lista, elige el más similar disponible.\n\n";
  
  catalog += `📊 INVENTARIO TOTAL: ${exerciseImages.length} ejercicios disponibles\n`;
  catalog += `   - Máquinas/Poleas: ${equipmentStats.maquina} ejercicios\n`;
  catalog += `   - Mancuernas/Peso Libre: ${equipmentStats.mancuernas} ejercicios\n`;
  catalog += `   - Peso Corporal: ${equipmentStats.peso_corporal} ejercicios\n\n`;
  
  const groupOrder = ["pecho", "espalda", "hombros", "biceps", "triceps", "piernas", "gluteos", "core", "cardio", "otros"];
  
  for (const group of groupOrder) {
    if (grouped[group] && grouped[group].length > 0) {
      const groupTitle = group.charAt(0).toUpperCase() + group.slice(1);
      catalog += `${groupTitle.toUpperCase()} (${grouped[group].length} ejercicios):\n`;
      
      // Separate by equipment type for clarity
      const machines = grouped[group].filter(e => e.equipment === "maquina");
      const freeWeights = grouped[group].filter(e => e.equipment === "mancuernas");
      const bodyweight = grouped[group].filter(e => e.equipment === "peso_corporal");
      const other = grouped[group].filter(e => !["maquina", "mancuernas", "peso_corporal"].includes(e.equipment || ""));
      
      if (machines.length > 0) {
        catalog += `  [MÁQUINAS]: ${machines.map(e => e.name).join(", ")}\n`;
      }
      if (freeWeights.length > 0) {
        catalog += `  [MANCUERNAS/PESO LIBRE]: ${freeWeights.map(e => e.name).join(", ")}\n`;
      }
      if (bodyweight.length > 0) {
        catalog += `  [PESO CORPORAL]: ${bodyweight.map(e => e.name).join(", ")}\n`;
      }
      if (other.length > 0) {
        catalog += `  [OTROS]: ${other.map(e => e.name).join(", ")}\n`;
      }
      catalog += "\n";
    }
  }
  
  return catalog;
}

// Find alternative exercise from same muscle group
function findAlternativeExercise(
  originalName: string,
  muscleGroup: string | undefined,
  exerciseImages: ExerciseImageRecord[]
): ExerciseImageRecord | null {
  if (muscleGroup) {
    const alternatives = exerciseImages.filter(img => img.muscle_group === muscleGroup);
    if (alternatives.length > 0) {
      return alternatives[Math.floor(Math.random() * alternatives.length)];
    }
  }
  
  if (exerciseImages.length > 0) {
    return exerciseImages[Math.floor(Math.random() * exerciseImages.length)];
  }
  
  return null;
}

// Validate and correct exercises in the routine
function validateAndCorrectExercises(
  routineData: any,
  exerciseImages: ExerciseImageRecord[]
): void {
  if (!routineData.routine) return;
  
  for (const month of routineData.routine) {
    if (!month.days) continue;
    
    for (const day of month.days) {
      if (!day.exercises) continue;
      
      const dayLower = day.day?.toLowerCase() || "";
      let muscleGroup: string | undefined;
      if (dayLower.includes("pecho")) muscleGroup = "pecho";
      else if (dayLower.includes("espalda")) muscleGroup = "espalda";
      else if (dayLower.includes("pierna") || dayLower.includes("leg")) muscleGroup = "piernas";
      else if (dayLower.includes("glúteo") || dayLower.includes("gluteo")) muscleGroup = "gluteos";
      else if (dayLower.includes("hombro")) muscleGroup = "hombros";
      else if (dayLower.includes("brazo") || dayLower.includes("bícep") || dayLower.includes("bicep")) muscleGroup = "biceps";
      else if (dayLower.includes("trícep") || dayLower.includes("tricep")) muscleGroup = "triceps";
      else if (dayLower.includes("core") || dayLower.includes("abdom")) muscleGroup = "core";
      
      for (const exercise of day.exercises) {
        const normalized = normalizeExerciseName(exercise.name);
        
        let found = exerciseImages.find(img => img.exercise_name_normalized === normalized);
        
        if (!found) {
          found = exerciseImages.find(img => 
            normalized.includes(img.exercise_name_normalized) || 
            img.exercise_name_normalized.includes(normalized)
          );
        }
        
        if (!found) {
          const keywords = normalized.split("_").filter(k => k.length > 3);
          for (const keyword of keywords) {
            found = exerciseImages.find(img => 
              img.exercise_name_normalized.includes(keyword)
            );
            if (found) break;
          }
        }
        
        if (found) {
          exercise.name = found.exercise_name;
          exercise.imageUrl = found.image_url;
          exercise.equipment = found.equipment || exercise.equipment;
        } else {
          console.warn(`Exercise not found in repository: "${exercise.name}", finding alternative...`);
          const alternative = findAlternativeExercise(exercise.name, muscleGroup, exerciseImages);
          if (alternative) {
            console.log(`Replaced with: "${alternative.exercise_name}"`);
            exercise.name = alternative.exercise_name;
            exercise.imageUrl = alternative.image_url;
            exercise.equipment = alternative.equipment || exercise.equipment;
          }
        }
      }
    }
  }
}

const BOGOTA_FOODS = `
ALIMENTOS DISPONIBLES EN BOGOTÁ:
- Proteínas: Pollo (pechuga), huevos, carne de res magra, pescado (mojarra, tilapia), atún en agua, cerdo magro, queso campesino, cuajada
- Carbohidratos: Arroz integral, papa criolla, papa pastusa, plátano maduro, plátano verde, yuca, avena en hojuelas, arepa de maíz, pan integral
- Grasas saludables: Aguacate, aceite de oliva, maní, almendras, mantequilla de maní
- Vegetales: Espinaca, brócoli, tomate, cebolla, pimentón, zanahoria, lechuga, habichuela
- Frutas: Banano, manzana, fresas, mango, papaya, guayaba, maracuyá, lulo
`;

const FALLBACK_IMAGES: Record<string, string> = {
  "pecho": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&h=300&fit=crop",
  "espalda": "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400&h=300&fit=crop",
  "hombros": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop",
  "biceps": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop",
  "triceps": "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=400&h=300&fit=crop",
  "piernas": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop",
  "gluteos": "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=300&fit=crop",
  "core": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop",
  "cardio": "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?w=400&h=300&fit=crop",
  "default": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop"
};

interface ExerciseImageRecord {
  exercise_name: string;
  exercise_name_normalized: string;
  image_url: string;
  muscle_group: string | null;
  equipment: string | null;
}

function normalizeExerciseName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "_")
    .trim();
}

/**
 * Makes a best-effort attempt to turn an almost-valid JSON string into valid JSON.
 * Primary issue seen in model output: raw newlines inside string literals.
 */
function sanitizeJsonString(input: string): string {
  let out = "";
  let inString = false;
  let escaped = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (inString) {
      if (escaped) {
        out += ch;
        escaped = false;
        continue;
      }

      if (ch === "\\") {
        // JSON only allows certain escape sequences. If the next char isn't valid,
        // treat this as a literal backslash and escape it.
        const next = input[i + 1] ?? "";
        const isValidEscape =
          next === '"' ||
          next === "\\" ||
          next === "/" ||
          next === "b" ||
          next === "f" ||
          next === "n" ||
          next === "r" ||
          next === "t" ||
          next === "u";

        if (!isValidEscape) {
          out += "\\\\"; // emit an escaped backslash
          continue;
        }

        out += ch;
        escaped = true;
        continue;
      }

      if (ch === '"') {
        out += ch;
        inString = false;
        continue;
      }

      // Raw control chars inside strings break JSON parsing
      if (ch === "\n") {
        out += "\\n";
        continue;
      }
      if (ch === "\r") {
        out += "\\r";
        continue;
      }
      if (ch === "\t") {
        out += "\\t";
        continue;
      }

      out += ch;
      continue;
    }

    if (ch === '"') {
      out += ch;
      inString = true;
      continue;
    }

    out += ch;
  }

  // Remove trailing commas before } or ] (common in LLM output)
  out = out.replace(/,\s*([\]}])/g, "$1");

  return out;
}

function logJsonParseContext(candidate: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const m = msg.match(/position\s+(\d+)/i);
  if (!m) return;
  const pos = Number(m[1]);
  const start = Math.max(0, pos - 200);
  const end = Math.min(candidate.length, pos + 200);
  console.log(`JSON.parse failed around position ${pos} (showing ${start}-${end}):`);
  console.log(candidate.slice(start, end));
}

/**
 * Extracts the first balanced JSON object from a string, ignoring braces inside strings.
 * This avoids greedy-regex issues when the model adds trailing text after the JSON.
 */
function extractFirstJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === "\\") {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = false;
        continue;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
      continue;
    }

    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return text.slice(start, i + 1);
      }
    }
  }

  return null;
}

// Harris-Benedict TMB calculation
function calculateTMB(weight: number, height: number, age: number, sex: string): number {
  if (sex === "masculino") {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

// Activity factors for TDEE
const ACTIVITY_FACTORS: Record<string, number> = {
  sedentario: 1.2,
  ligera: 1.375,
  moderada: 1.55,
  activa: 1.725,
  muy_activa: 1.9
};

// Objective adjustments
const OBJECTIVE_ADJUSTMENTS: Record<string, { 
  calorieMultiplier: number; 
  proteinPerKg: number; 
  carbsPerKg: number; 
  fatsPerKg: number;
}> = {
  perdida_grasa: { 
    calorieMultiplier: 0.8,
    proteinPerKg: 2.2,
    carbsPerKg: 2.5,
    fatsPerKg: 0.8
  },
  hipertrofia: { 
    calorieMultiplier: 1.1,
    proteinPerKg: 2.0,
    carbsPerKg: 4.5,
    fatsPerKg: 1.0
  },
  recomposicion: { 
    calorieMultiplier: 1.0,
    proteinPerKg: 2.2,
    carbsPerKg: 3.5,
    fatsPerKg: 0.9
  }
};

// Cardio protocols by objective
function getCardioProtocol(objective: string): { preCardio: number; postCardio: number; warmupType: string; description: string } {
  switch (objective) {
    case "perdida_grasa":
      return {
        preCardio: 25,
        postCardio: 25,
        warmupType: "Intensidad moderada",
        description: "25 min Cardio Pre (Moderado) + Rutina + 25 min Cardio Post (Suave)"
      };
    case "recomposicion":
      return {
        preCardio: 20,
        postCardio: 20,
        warmupType: "Intensidad moderada",
        description: "20 min Cardio Pre + Rutina + 20 min Cardio Post"
      };
    case "hipertrofia":
    default:
      return {
        preCardio: 10,
        postCardio: 10,
        warmupType: "Calentamiento suave",
        description: "10 min Calentamiento + Rutina + 10 min Vuelta a la calma"
      };
  }
}

// Get recommended classes by objective
function getRecommendedClasses(objective: string): string[] {
  if (objective === "perdida_grasa" || objective === "recomposicion") {
    return ["Baile", "Bodycombat", "Rumba", "Quema Grasa", "Súper Abdomen", "Spinning"];
  }
  return [];
}

// Get supplementation recommendations by objective
function getSupplementRecommendations(objective: string): string[] {
  const supplements = ["Creatina Monohidrato (5g diarios) - Disponible en Cafetería"];
  
  if (objective === "hipertrofia") {
    supplements.push("Ganador de Peso (Mass Gainer) post-entreno - Disponible en Cafetería");
  }
  
  if (objective === "perdida_grasa" || objective === "recomposicion") {
    supplements.push("Proteína Isolate como sustituto de cena - Disponible en Cafetería");
  }
  
  return supplements;
}

// Training parameters by level with rest times
function getTrainingParams(level: string, objective: string) {
  const baseRestTime = objective === "fuerza" ? "4 min" : "2-3 min";
  
  const params = {
    principiante: {
      frequency: "2-3 días",
      volume: "10-12 series semanales por grupo muscular",
      rir: "RIR 3-4",
      techniques: "Solo ejercicios básicos, enfoque en técnica",
      restTime: "2-3 min",
      monthlyProgression: {
        month1: "RIR 3-4 (enfoque en técnica las primeras 2 semanas)",
        month2: "RIR 3",
        month3: "RIR 2-3"
      }
    },
    intermedio: {
      frequency: "4-5 días",
      volume: "12-16 series semanales por grupo muscular",
      rir: "RIR 2-3",
      techniques: "Drop sets y Rest-pause en última serie de ejercicios principales",
      restTime: baseRestTime,
      monthlyProgression: {
        month1: "RIR 3",
        month2: "RIR 2",
        month3: "RIR 1-0"
      }
    },
    avanzado: {
      frequency: "5-6 días",
      volume: "16-20 series semanales por grupo muscular",
      rir: "RIR 1-2",
      techniques: "Drop sets, Rest-pause, series gigantes en ejercicios grandes",
      restTime: baseRestTime,
      monthlyProgression: {
        month1: "RIR 3",
        month2: "RIR 2",
        month3: "RIR 1-0"
      }
    }
  };
  
  return params[level as keyof typeof params] || params.principiante;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      name, age, level, objective, focus, daysPerWeek, 
      sex, weight, height, pathologies, weeklyActivity,
      dislikedFoods 
    } = await req.json();

    console.log("Received request with data:", { name, age, sex, weight, height, level, objective, focus, daysPerWeek, weeklyActivity });

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY no está configurada. Agrega tu API Key de Gemini como secreto.");
    }

    // Fetch custom exercise images from database
    let exerciseImages: ExerciseImageRecord[] = [];
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
        const { data, error } = await supabase
          .from("exercise_images")
          .select("exercise_name, exercise_name_normalized, image_url, muscle_group, equipment");
        
        if (!error && data) {
          exerciseImages = data;
          console.log(`Loaded ${exerciseImages.length} custom exercise images`);
        }
      } catch (e) {
        console.warn("Could not load exercise images:", e);
      }
    }

    // Calculate nutrition values using Harris-Benedict
    const tmb = calculateTMB(weight, height, age, sex);
    const activityFactor = ACTIVITY_FACTORS[weeklyActivity] || 1.55;
    const tdee = tmb * activityFactor;
    const objectiveParams = OBJECTIVE_ADJUSTMENTS[objective] || OBJECTIVE_ADJUSTMENTS.recomposicion;
    const targetCalories = Math.round(tdee * objectiveParams.calorieMultiplier);
    
    const proteinGrams = Math.round(weight * objectiveParams.proteinPerKg);
    const carbsGrams = Math.round(weight * objectiveParams.carbsPerKg);
    const fatsGrams = Math.round(weight * objectiveParams.fatsPerKg);

    console.log("Calculated nutrition:", { tmb, tdee, targetCalories, proteinGrams, carbsGrams, fatsGrams });

    // Get cardio protocol, classes, supplements
    const cardioProtocol = getCardioProtocol(objective);
    const recommendedClasses = getRecommendedClasses(objective);
    const supplements = getSupplementRecommendations(objective);
    const trainingParams = getTrainingParams(level, objective);

    // Build exercise catalog from database for the AI prompt
    const exerciseCatalog = buildExerciseCatalog(exerciseImages);
    console.log("Built exercise catalog with", exerciseImages.length, "exercises");

    // Generate a random seed for exercise rotation (0-3)
    const rotationSeed = Math.floor(Math.random() * 4);
    console.log("Using rotation seed:", rotationSeed, "for opening exercise variation");
    
    const systemPrompt = `Eres el Director Científico de 98 Fitness Club en Bogotá, Colombia.

Tienes PhD en fisiología del ejercicio y nutrición deportiva.

TU MISIÓN: Generar un plan de entrenamiento de 12 semanas hiper-personalizado, seguro y científicamente validado.

RESTRICCIONES SUPREMAS (SISTEMA CERRADO):

CATÁLOGO: SOLO puedes prescribir ejercicios que existan EXACTAMENTE en el catálogo proporcionado. NUNCA inventes nombres. Si necesitas un ejercicio que no está, elige el más similar.

FORMATO: JSON estricto RFC8259, sin markdown ni comentarios. Mes 2 y 3: "days" debe ser [] (array vacío) para evitar truncamiento.

★★★ REGLAS DE VOLUMEN Y DOSIS (CÁLCULO MATEMÁTICO) ★★★

1. LÍMITE DIARIO (HARD CAP):

MÁXIMO 6 EJERCICIOS por sesión de entrenamiento. Sin excepciones.

2. VOLUMEN SEMANAL POR GRUPO MUSCULAR (SERIES EFECTIVAS):

Calcula el volumen total de series semanales para cada grupo muscular basándote estrictamente en el nivel del usuario:

Principiante: 10 - 12 series semanales por grupo muscular.

Intermedio: 12 - 16 series semanales por grupo muscular.

Avanzado: 16 - 20 series semanales por grupo muscular.

3. AJUSTE DE "ENFOQUE" (FOCUS AREA):

SI el usuario selecciona un "Grupo Muscular de Enfoque":

ACCIÓN: Suma +2 a +3 series semanales adicionales a ese grupo muscular específico, por encima del rango de su nivel.

Ejemplo: Un Intermedio (base 12-16) con enfoque en Glúteo debe realizar 15-19 series de Glúteo a la semana.

★★★ ALGORITMOS DE ESTRUCTURA Y FLUJO (DISTRIBUCIÓN) ★★★

1. REGLA DE DISTRIBUCIÓN ESTOCÁSTICA (Split Aleatorio):

NO uses un orden fijo semanal (ej. Prohibido asignar siempre "Pecho" los lunes).

ALEATORIZA la estructura del "Split" semanal basándote en una semilla aleatoria para cada usuario.

Semilla de rotación para este usuario: ${rotationSeed}

Objetivo: Que la ocupación del gimnasio se distribuya equitativamente.

2. REGLA DE FLUJO "ANTI-AGLOMERACIÓN" (Patrón Obligatorio):

Estructura el orden de los ejercicios dentro de cada sesión alternando ESTRICTAMENTE el tipo de equipamiento.

SECUENCIA OBLIGATORIA: Máquina - Peso Libre - Máquina - Peso Libre... (Hasta completar máx 6 ejercicios).

PROHIBIDO: Programar dos ejercicios de máquina seguidos O dos de peso libre seguidos en el mismo bloque.

3. REGLA DE VARIEDAD Y NO-REPETICIÓN:

Maximiza el uso de la base de datos completa (88 ejercicios).

PENALIZACIÓN: No repitas el mismo ejercicio en dos sesiones consecutivas de la misma semana. Si debes trabajar el mismo músculo, busca una variante biomecánica en el catálogo.

★★★ LÓGICA CONDICIONAL AVANZADA (ADAPTACIÓN) ★★★

SI EL GÉNERO ES "MUJER":

PROHIBIDO: Press de Banca (Barbell Bench Press), Press Inclinado con Barra.

SUSTITUCIÓN OBLIGATORIA: Usa variantes con Mancuernas (Dumbbell Press) o Press Floor (Floor Press).

Enfoque: Prioriza estabilidad y rango de movimiento sobre carga absoluta.

SI EL OBJETIVO ES "PÉRDIDA DE GRASA" (Fat Loss):

ACCIÓN: Elimina 1 día de la rutina de pesas estándar de la semana.

INSERCIÓN: En esos días, inserta un BLOQUE DE LLAMADA A LA ACCIÓN que diga textualmente: "¡DÍA DE CLASE GRUPAL OBLIGATORIA!".

INSTRUCCIÓN: Instruye al usuario a asistir a: Entrenamiento Funcional, Quema Grasa, Súper Abdomen, S.A.G (Spinning, Abdomen y Glúteo) o Baile. Usa un tono urgente y motivante.

SEGMENTACIÓN POR NIVEL (Integrada con Flujo):

Principiante: Aunque debes mantener la alternancia Máquina/Peso Libre, selecciona ejercicios de peso libre de baja complejidad técnica (ej. Mancuernas simples) para cumplir el criterio de seguridad.

Intermedio/Avanzado: Prioriza pesos libres complejos y Drop Sets.

REGLAS DE PARAMETRIZACIÓN FINAL:

Descanso: 2-3 min (hipertrofia general), 4 min (fuerza/compuestos pesados).

Semana 8: Descarga obligatoria (50% volumen, mantener intensidad).

Semana 1-12: Generar estructura completa pero detallar ejercicios día a día según formato JSON.

CONTROL DE TAMAÑO (CRÍTICO PARA EVITAR RESPUESTA TRUNCADA):
- El array routine DEBE contener 3 meses.
- Para Mes 2 y Mes 3: el campo "days" DEBE ser un array vacío []. NO listes días ni ejercicios para esos meses.
- La progresión de Mes 2 y Mes 3 debe explicarse en "progression" y "notes" (y/o "recovery"), no repitiendo todo el calendario.
- No incluyas saltos de línea dentro de strings; usa " - " como separador.
- No uses comas colgantes.
`;

    const nutritionContext = `
DATOS NUTRICIONALES CALCULADOS (Harris-Benedict):
- TMB: ${Math.round(tmb)} kcal
- TDEE: ${Math.round(tdee)} kcal
- Calorías objetivo (${objective}): ${targetCalories} kcal
- Proteína: ${proteinGrams}g/día (${objectiveParams.proteinPerKg}g/kg)
- Carbohidratos: ${carbsGrams}g/día (${objectiveParams.carbsPerKg}g/kg)
- Grasas: ${fatsGrams}g/día (${objectiveParams.fatsPerKg}g/kg)
${dislikedFoods ? `\n⚠️ ALIMENTOS A EXCLUIR DEL PLAN: ${dislikedFoods}` : ""}
`;

    const cardioContext = `
PROTOCOLO DE CARDIO ASIGNADO (${objective}):
${cardioProtocol.description}
- Cardio PRE-entreno: ${cardioProtocol.preCardio} min
- Cardio POST-entreno: ${cardioProtocol.postCardio} min

${recommendedClasses.length > 0 ? `
CLASES GRUPALES RECOMENDADAS (Upselling):
${recommendedClasses.map(c => `- ${c}`).join("\n")}
Incluye estas recomendaciones de clases en las notas para maximizar resultados.
` : ""}
`;

    const supplementContext = `
SUPLEMENTACIÓN RECOMENDADA (Disponible en Cafetería 98 Fitness):
${supplements.map(s => `- ${s}`).join("\n")}
`;

    const recoveryContext = `
PROTOCOLO DE RECUPERACIÓN:
- SEMANA 8: Semana de DESCARGA obligatoria (50% volumen, misma intensidad)
- SUEÑO: Incluir 3 pautas estrictas (7-9h, oscuridad total, desconexión digital 1h antes)
`;

    const progressionContext = `
PROGRESIÓN DE INTENSIDAD (RIR):
- Mes 1: ${trainingParams.monthlyProgression.month1}
- Mes 2: ${trainingParams.monthlyProgression.month2}
- Mes 3: ${trainingParams.monthlyProgression.month3}
`;

     const userPrompt = `Genera una rutina de entrenamiento CIENTÍFICA de 12 semanas:

DATOS DEL USUARIO:
- Nombre: ${name}
- Edad: ${age} años
- Sexo: ${sex}
- Peso: ${weight} kg
- Estatura: ${height} cm
- Nivel: ${level} (Base para cálculo de series: Principiante=10-12, Intermedio=12-16, Avanzado=16-20)
- Objetivo: ${objective}
- GRUPO MUSCULAR DE ENFOQUE: ${focus} (Instrucción: Sumar OBLIGATORIAMENTE +2 a +3 series semanales a este grupo).
- Días por semana: ${daysPerWeek}
- Actividad física actual: ${weeklyActivity}
- Patologías/Limitaciones: ${pathologies || "Ninguna"}
- SEMILLA DE ALEATORIEDAD (ROTACIÓN): ${new Date().getTime()}

${exerciseCatalog}

PARÁMETROS DE ENTRENAMIENTO PARA NIVEL ${level.toUpperCase()}:
- Frecuencia: ${trainingParams.frequency}
- CÁLCULO DE VOLUMEN: Calcular dinámicamente según Nivel + Enfoque (ver reglas del sistema).
- LÍMITE DIARIO: MÁXIMO 6 EJERCICIOS por sesión (Hard Cap).
- RIR objetivo: ${trainingParams.rir}
- Técnicas permitidas: ${trainingParams.techniques}
- Descanso entre series: ${trainingParams.restTime}

${cardioContext}

${nutritionContext}

${supplementContext}

${recoveryContext}

${progressionContext}

${BOGOTA_FOODS}

REGLAS CRÍTICAS DE AUDITORÍA:
1. SOLO usa ejercicios del catálogo - NUNCA inventes nombres.
2. ALTERNA ESTRICTAMENTE: Máquina → Peso Libre → Máquina.
3. Incluye tiempo de descanso (2-3 min / 4 min fuerza).
4. SI Objetivo == "Fat Loss": Reemplazar 1-2 días pesas por CLASE GRUPAL.
5. Adapta si hay patologías.
6. RIR específico por mes.
7. SI Sexo == "Mujer": ELIMINAR Press Banca/Inclinado Barra (Usar mancuernas).
8. EXCLUYE alimentos odiados.
9. Semana 8 = descarga.
10. Nombres EXACTOS del catálogo.
11. Mes 2 y 3: "days" = [] (vacío).
${recommendedClasses.length > 0 ? "12. Recomienda clases grupales (si aplica)." : ""}

 Responde con este JSON exacto (sin markdown, solo JSON):
{
  "name": "${name}",
  "age": ${age},
  "sex": "${sex}",
  "weight": ${weight},
  "height": ${height},
  "level": "${level}",
  "objective": "${objective}",
  "focus": "${focus}",
  "daysPerWeek": ${daysPerWeek},
  "weeklyActivity": "${weeklyActivity}",
  "pathologies": "${pathologies || "Ninguna"}",
  "warmupMinutes": ${cardioProtocol.preCardio},
  "warmupDescription": "${cardioProtocol.warmupType} en trotadora o elíptica",
  "cardioProtocol": {
    "preCardio": ${cardioProtocol.preCardio},
    "postCardio": ${cardioProtocol.postCardio},
    "description": "${cardioProtocol.description}"
  },
  "recommendedClasses": ${JSON.stringify(recommendedClasses)},
  "supplements": ${JSON.stringify(supplements)},
  "routine": [
    {
      "month": 1,
      "weeks": "1-4",
      "rirTarget": "${trainingParams.monthlyProgression.month1}",
      "days": [
        {
          "day": "Día 1 - [Nombre del día]",
          "exercises": [
            {
              "name": "Nombre del ejercicio EXACTO del catálogo",
              "equipment": "Máquina/Mancuernas",
              "sets": 3,
              "reps": "8-12",
              "rir": "3",
              "restMinutes": "2-3",
              "notes": "Nota técnica opcional"
            }
          ],
          "finalCardio": "${cardioProtocol.postCardio} min cardio suave"
        }
      ]
    },
    {
      "month": 2,
      "weeks": "5-8 (Semana 8 = Descarga)",
      "rirTarget": "${trainingParams.monthlyProgression.month2}",
      "days": []
    },
    {
      "month": 3,
      "weeks": "9-12",
      "rirTarget": "${trainingParams.monthlyProgression.month3}",
      "days": []
    }
  ],
  "nutrition": {
    "tmb": ${Math.round(tmb)},
    "tdee": ${Math.round(tdee)},
    "targetCalories": ${targetCalories},
    "dailyCalories": "${targetCalories} kcal",
    "protein": "${objectiveParams.proteinPerKg}g/kg",
    "proteinGrams": ${proteinGrams},
    "carbs": "${objectiveParams.carbsPerKg}g/kg",
    "carbsGrams": ${carbsGrams},
    "fats": "${objectiveParams.fatsPerKg}g/kg",
    "fatsGrams": ${fatsGrams},
    "water": "Mínimo ${Math.round(weight * 0.035)} litros diarios",
    "mealPlan": [
      {
        "meal": "Desayuno (7:00 AM)",
        "options": ["opción con alimentos de Bogotá, SIN alimentos odiados"],
        "macros": "~Xg proteína, ~Xg carbos, ~Xg grasa"
      },
      {
        "meal": "Media Mañana (10:00 AM)",
        "options": ["snack saludable"],
        "macros": "descripción"
      },
      {
        "meal": "Almuerzo (1:00 PM)",
        "options": ["plato principal bogotano"],
        "macros": "descripción"
      },
      {
        "meal": "Pre-entreno (4:00 PM)",
        "options": ["snack energético"],
        "macros": "descripción"
      },
      {
        "meal": "Post-entreno (inmediatamente después)",
        "options": ["recuperación muscular"],
        "macros": "descripción"
      },
      {
        "meal": "Cena (8:00 PM)",
        "options": ["cena ligera"],
        "macros": "descripción"
      }
    ],
    "supplements": ${JSON.stringify(supplements)},
    "tips": ["tip1", "tip2"]
  },
  "progression": {
    "weeks1to2": "Enfoque en técnica, aprender patrones de movimiento correctos",
    "weeks3to4": "Aumentar peso gradualmente manteniendo técnica perfecta",
    "monthlyIncrease": "Incrementar peso 2.5-5% cada 2-4 semanas cuando se logre el RIR objetivo",
    "deloadWeek": "SEMANA 8: Reducir volumen al 50%, mantener misma intensidad (peso). Permite recuperación del sistema nervioso."
  },
  "recovery": {
    "sleep": [
      "Dormir 7-9 horas cada noche",
      "Habitación completamente oscura",
      "Desconexión digital 1 hora antes de dormir"
    ],
    "deloadProtocol": "Semana 8: 50% del volumen normal, misma intensidad"
  },
  "notes": [
    "Semana 8 es de descarga obligatoria",
    "Serie de aproximación antes de ejercicios pesados"
  ],
  "disclaimer": "Este plan es orientativo. Consulta con un profesional de la salud antes de iniciar cualquier programa de ejercicios."
}`;

    console.log("Sending request to Gemini API...");

    async function callGemini(temperature: number) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      const resp = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
          ],
          generationConfig: {
            temperature,
            maxOutputTokens: 65536,
            responseMimeType: "application/json",
          },
        }),
      });

      if (!resp.ok) {
        const errorText = await resp.text();
        console.error("Gemini API error:", resp.status, errorText);
        
        if (resp.status === 429) {
          throw new Error("Límite de uso de la API de Gemini excedido. Intenta más tarde.");
        }
        if (resp.status === 403 || resp.status === 401) {
          throw new Error("API Key de Gemini inválida o sin permisos. Verifica tu clave.");
        }
        throw new Error(`Error de la API de Gemini (${resp.status}): ${errorText.substring(0, 200)}`);
      }

      const result = await resp.json();
      const text = result?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error("La API de Gemini no devolvió contenido");
      return text;
    }

    const content = await callGemini(0.2);

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse JSON from response - robust extraction + sanitize + retry
    let routineData;
    const tryParse = (raw: string) => {
      const cleanContent = raw
        .replace(/```json\s*/gi, "")
        .replace(/```javascript\s*/gi, "")
        .replace(/```\s*/g, "")
        .trim();

      const extracted = extractFirstJsonObject(cleanContent);
      if (!extracted) return null;
      const candidate = sanitizeJsonString(extracted);
      try {
        return JSON.parse(candidate);
      } catch (e) {
        logJsonParseContext(candidate, e);
        throw e;
      }
    };

    try {
      routineData = tryParse(content);
      if (!routineData) throw new Error("No JSON found in response");
    } catch (parseError) {
      console.error("JSON parse error (attempt 1):", parseError);
      console.log("Raw content preview:", content.substring(0, 800));
      console.log("Raw content tail:", content.substring(Math.max(0, content.length - 800)));
      console.log("Content length:", content.length);
      console.log("Content ends with:", JSON.stringify(content.slice(-20)));

      console.log("Retrying Gemini generation with stricter settings...");
      let retryContent: string;
      try {
        retryContent = await callGemini(0.0);
      } catch (retryErr) {
        console.error("Gemini retry error:", retryErr);
        throw new Error("Failed to parse routine data");
      }

      try {
        routineData = tryParse(retryContent);
        if (!routineData) throw new Error("No JSON found in response");
      } catch (parseError2) {
        console.error("JSON parse error (attempt 2):", parseError2);
        console.log("Retry content preview:", retryContent.substring(0, 800));
        console.log("Retry content tail:", retryContent.substring(Math.max(0, retryContent.length - 800)));
        console.log("Retry content ends with:", JSON.stringify(retryContent.slice(-20)));
        console.log("Retry content length:", retryContent.length);
        throw new Error("Failed to parse routine data");
      }
    }

    // Validate and correct exercises to match repository
    validateAndCorrectExercises(routineData, exerciseImages);

    console.log("Successfully generated routine for:", name);

    return new Response(JSON.stringify(routineData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating routine:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
