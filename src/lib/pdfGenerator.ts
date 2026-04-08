import jsPDF from "jspdf";
import { RoutineData } from "@/components/routines/RoutineForm";
import { TRAINING_LEVELS, TRAINING_OBJECTIVES, TRAINING_FOCUS } from "./constants";

// Import QR images
import qrTiktok from "@/assets/qr-tiktok.jpeg";
import qrInstagram from "@/assets/qr-instagram.jpeg";
import qrWhatsapp from "@/assets/qr-whatsapp.jpeg";

// Brand colors
const COLORS = {
  primary: { r: 220, g: 38, b: 38 }, // Red
  black: { r: 0, g: 0, b: 0 },
  white: { r: 255, g: 255, b: 255 },
  gray: { r: 107, g: 114, b: 128 },
  lightGray: { r: 243, g: 244, b: 246 },
  green: { r: 34, g: 197, b: 94 },
  blue: { r: 59, g: 130, b: 246 },
};

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading image:", error);
    return null;
  }
}

const DEFAULT_EXERCISE_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&h=150&fit=crop";

export async function generateRoutinePDF(data: RoutineData): Promise<void> {
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const levelInfo = TRAINING_LEVELS[data.level as keyof typeof TRAINING_LEVELS];
  const objectiveInfo = TRAINING_OBJECTIVES[data.objective as keyof typeof TRAINING_OBJECTIVES];
  const focusInfo = TRAINING_FOCUS[data.focus as keyof typeof TRAINING_FOCUS];

  // Pre-load all exercise images
  const imageCache: Map<string, string | null> = new Map();
  
  const imageUrls = new Set<string>();
  data.routine?.forEach((month) => {
    month.days?.forEach((day) => {
      day.exercises?.forEach((exercise) => {
        const url = exercise.imageUrl || DEFAULT_EXERCISE_IMAGE;
        imageUrls.add(url);
      });
    });
  });

  // Load exercise images and QR codes
  const imagePromises = Array.from(imageUrls).map(async (url) => {
    const base64 = await loadImageAsBase64(url);
    imageCache.set(url, base64);
  });
  
  // Load QR codes
  const [qrTiktokBase64, qrInstagramBase64, qrWhatsappBase64] = await Promise.all([
    loadImageAsBase64(qrTiktok),
    loadImageAsBase64(qrInstagram),
    loadImageAsBase64(qrWhatsapp),
    ...imagePromises
  ]);

  // Helper functions
  const setColor = (color: { r: number; g: number; b: number }) => {
    pdf.setTextColor(color.r, color.g, color.b);
  };

  const setFillColor = (color: { r: number; g: number; b: number }) => {
    pdf.setFillColor(color.r, color.g, color.b);
  };

  const checkNewPage = (requiredSpace: number) => {
    if (y + requiredSpace > pageHeight - margin) {
      pdf.addPage();
      y = margin;
      return true;
    }
    return false;
  };

  const drawHeader = () => {
    setFillColor(COLORS.black);
    pdf.rect(0, 0, pageWidth, 35, "F");
    
    setFillColor(COLORS.primary);
    pdf.rect(0, 35, pageWidth, 2, "F");

    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.white);
    pdf.text("98 FITNESS CLUB", pageWidth / 2, 15, { align: "center" });
    
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    pdf.text("RUTINA PERSONALIZADA", pageWidth / 2, 26, { align: "center" });

    y = 45;
  };

  const drawFooter = (pageNum: number) => {
    pdf.setFontSize(7);
    setColor(COLORS.gray);
    pdf.text(`@98fitnessclub • Bogotá, Colombia • Página ${pageNum}`, pageWidth / 2, pageHeight - 8, { align: "center" });
  };

  // ===== COVER PAGE =====
  drawHeader();

  // Welcome message
  pdf.setFontSize(18);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.black);
  pdf.text(`¡Bienvenido/a, ${data.name}!`, pageWidth / 2, y + 5, { align: "center" });

  y += 15;

  // ===== COMMUNITY SECTION WITH QR CODES =====
  setFillColor(COLORS.primary);
  pdf.roundedRect(margin, y, contentWidth, 65, 3, 3, "F"); // Increased height for larger QRs
  
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.white);
  pdf.text("¡ÚNETE A LA MANADA 98 FITNESS!", margin + contentWidth / 2, y + 8, { align: "center" });
  
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.text("Escanea estos códigos para descuentos exclusivos, sorteos y noticias de aliados", margin + contentWidth / 2, y + 14, { align: "center" });

  const qrSize = 35; // Increased from 28 for better scannability
  const qrY = y + 18;
  const qrSpacing = (contentWidth - qrSize * 3) / 4;
  const qr1X = margin + qrSpacing;
  const qr2X = margin + qrSpacing * 2 + qrSize;
  const qr3X = margin + qrSpacing * 3 + qrSize * 2;

  // Draw QR codes with white backgrounds
  [{ x: qr1X, img: qrTiktokBase64, label: "TikTok" }, 
   { x: qr2X, img: qrInstagramBase64, label: "Instagram" }, 
   { x: qr3X, img: qrWhatsappBase64, label: "WhatsApp" }].forEach(({ x, img, label }) => {
    setFillColor(COLORS.white);
    pdf.roundedRect(x - 1, qrY - 1, qrSize + 2, qrSize + 2, 2, 2, "F");
    if (img) {
      try {
        pdf.addImage(img, "JPEG", x, qrY, qrSize, qrSize);
      } catch (e) {
        console.error("Error adding QR:", e);
      }
    }
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.white);
    pdf.text(label, x + qrSize / 2, qrY + qrSize + 5, { align: "center" });
  });

  y += 72; // Adjusted for larger QR section

  // User info box
  setFillColor(COLORS.lightGray);
  pdf.roundedRect(margin, y, contentWidth, 55, 3, 3, "F");
  
  pdf.setFontSize(9);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.primary);
  pdf.text("TU PERFIL", margin + 5, y + 7);

  pdf.setFont("helvetica", "normal");
  setColor(COLORS.black);
  pdf.setFontSize(9);
  
  const col1X = margin + 5;
  const col2X = margin + contentWidth / 2;
  let infoY = y + 15;

  pdf.text(`Edad: ${data.age} años`, col1X, infoY);
  pdf.text(`Sexo: ${data.sex}`, col2X, infoY);
  infoY += 7;
  
  pdf.text(`Peso: ${data.weight} kg`, col1X, infoY);
  pdf.text(`Estatura: ${data.height} cm`, col2X, infoY);
  infoY += 7;
  
  pdf.text(`Nivel: ${levelInfo?.label || data.level}`, col1X, infoY);
  pdf.text(`Objetivo: ${objectiveInfo?.label || data.objective}`, col2X, infoY);
  infoY += 7;
  
  pdf.text(`Enfoque: ${focusInfo?.label || data.focus}`, col1X, infoY);
  pdf.text(`Días/semana: ${data.daysPerWeek}`, col2X, infoY);
  infoY += 7;
  
  // Cardio protocol
  if (data.cardioProtocol) {
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.primary);
    pdf.text(`Protocolo Cardio: ${data.cardioProtocol.description || `${data.warmupMinutes} min pre + ${data.cardioProtocol.postCardio} min post`}`, col1X, infoY);
  } else {
    pdf.text(`Calentamiento: ${data.warmupMinutes} min cardio`, col1X, infoY);
  }

  if (data.pathologies && data.pathologies !== "Ninguna") {
    infoY += 7;
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.primary);
    pdf.text(`Consideraciones: ${data.pathologies}`, col1X, infoY);
  }

  y += 60;

  // Recommended Classes (if any)
  if (data.recommendedClasses && data.recommendedClasses.length > 0) {
    setFillColor(COLORS.green);
    pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.white);
    pdf.text("CLASES GRUPALES RECOMENDADAS (¡Potencia tus resultados!)", margin + 5, y + 7);
    
    pdf.setFontSize(8);
    pdf.setFont("helvetica", "normal");
    pdf.text(data.recommendedClasses.join(" • "), margin + 5, y + 13);
    
    y += 22;
  }

  // Training parameters
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.black);
  pdf.text("PARÁMETROS DE ENTRENAMIENTO", margin, y);
  y += 7;

  pdf.setFontSize(9);
  pdf.setFont("helvetica", "normal");
  setColor(COLORS.gray);
  pdf.text(`• Frecuencia: ${levelInfo?.frequency || "2-3 días"}`, margin, y);
  y += 5;
  pdf.text(`• Volumen: ${levelInfo?.volume || "8-10 series por grupo"}`, margin, y);
  y += 5;
  pdf.text(`• Descanso entre series: 2-3 min (general), 4 min (fuerza pura)`, margin, y);
  y += 5;
  pdf.text(`• Semana 8: DESCARGA (50% volumen, misma intensidad)`, margin, y);

  drawFooter(1);

  // ===== ROUTINE PAGES WITH IMAGES =====
  data.routine?.forEach((month) => {
    pdf.addPage();
    y = margin;

    // Month header with RIR target
    setFillColor(COLORS.primary);
    pdf.rect(margin, y, contentWidth, 12, "F");
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.white);
    pdf.text(`MES ${month.month} - SEMANAS ${month.weeks}`, margin + 5, y + 7);
    
    if (month.rirTarget) {
      pdf.setFontSize(9);
      pdf.text(`RIR Objetivo: ${month.rirTarget}`, margin + contentWidth - 5, y + 7, { align: "right" });
    }
    y += 17;

    // Check if this month has exercises or is a progression-only month
    if (!month.days || month.days.length === 0) {
      // This is Month 2 or 3 - show progression info instead of exercises
      setFillColor(COLORS.lightGray);
      pdf.roundedRect(margin, y, contentWidth, 80, 3, 3, "F");
      
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.primary);
      pdf.text("PROGRESIÓN DEL MES", margin + contentWidth / 2, y + 15, { align: "center" });
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      setColor(COLORS.black);
      
      const progressionText = month.month === 2 
        ? [
            "Este mes se mantiene la misma estructura de ejercicios del Mes 1.",
            "",
            "CAMBIOS CLAVE:",
            `• RIR Objetivo: ${month.rirTarget || "RIR 2"}`,
            "• Incrementa el peso 2.5-5% respecto al mes anterior",
            "• Mantén la técnica perfecta en cada repetición",
            "",
            "⚠️ SEMANA 8 = DESCARGA:",
            "Reduce el volumen al 50%, mantén la misma intensidad (peso).",
            "Es una semana de recuperación del sistema nervioso."
          ]
        : [
            "Este mes se mantiene la misma estructura de ejercicios del Mes 1.",
            "",
            "CAMBIOS CLAVE:",
            `• RIR Objetivo: ${month.rirTarget || "RIR 0-1"} (máxima intensidad)`,
            "• Incrementa el peso 2.5-5% respecto al mes anterior",
            "• Puedes aplicar técnicas de intensificación",
            "",
            "TÉCNICAS AVANZADAS (opcional):",
            "• Drop sets en la última serie de ejercicios principales",
            "• Rest-pause para maximizar el estímulo muscular"
          ];
      
      let textY = y + 28;
      progressionText.forEach((line) => {
        pdf.text(line, margin + 10, textY);
        textY += 6;
      });
      
      y += 90;
      
      // Add reference to Month 1
      setFillColor(COLORS.black);
      pdf.roundedRect(margin, y, contentWidth, 25, 2, 2, "F");
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.white);
      pdf.text("📋 REFERENCIA: Consulta los ejercicios detallados en el MES 1", margin + contentWidth / 2, y + 10, { align: "center" });
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      pdf.text("La estructura de días y ejercicios es la misma, solo cambia la intensidad (RIR)", margin + contentWidth / 2, y + 18, { align: "center" });
      
    } else {
      // This month has exercises - render them normally
      month.days.forEach((day) => {
        checkNewPage(50);

        // Day header
        setFillColor(COLORS.black);
        pdf.rect(margin, y, contentWidth, 8, "F");
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        setColor(COLORS.white);
        pdf.text(day.day, margin + 3, y + 6);
        y += 10;

        // Warmup
        pdf.setFontSize(8);
        pdf.setFont("helvetica", "italic");
        setColor(COLORS.gray);
        pdf.text(`Calentamiento: ${data.warmupMinutes} min en trotadora o elíptica`, margin, y + 3);
        y += 6;

        // Exercises with images - 2 columns layout
        const exerciseWidth = (contentWidth - 5) / 2;
        const exerciseHeight = 38;
        const imageWidth = 25;
        const imageHeight = 18;
        
        day.exercises?.forEach((exercise, idx) => {
          const isLeftColumn = idx % 2 === 0;
          const colX = isLeftColumn ? margin : margin + exerciseWidth + 5;
          
          if (idx % 2 === 0) {
            checkNewPage(exerciseHeight + 5);
          }
          
          const exerciseY = isLeftColumn ? y : y;
          
          // Exercise card background
          setFillColor({ r: 250, g: 250, b: 250 });
          pdf.roundedRect(colX, exerciseY, exerciseWidth, exerciseHeight, 2, 2, "F");
          
          pdf.setDrawColor(220, 220, 220);
          pdf.roundedRect(colX, exerciseY, exerciseWidth, exerciseHeight, 2, 2, "S");
          
          // Try to add image
          const imageUrl = exercise.imageUrl || DEFAULT_EXERCISE_IMAGE;
          const base64Image = imageCache.get(imageUrl);
          
          if (base64Image) {
            try {
              pdf.addImage(base64Image, "JPEG", colX + 2, exerciseY + 2, imageWidth, imageHeight);
            } catch (e) {
              setFillColor(COLORS.lightGray);
              pdf.rect(colX + 2, exerciseY + 2, imageWidth, imageHeight, "F");
            }
          } else {
            setFillColor(COLORS.lightGray);
            pdf.rect(colX + 2, exerciseY + 2, imageWidth, imageHeight, "F");
          }
          
          // Exercise info (right of image)
          const textX = colX + imageWidth + 5;
          const textWidth = exerciseWidth - imageWidth - 8;
          
          // Exercise name
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          setColor(COLORS.black);
          const nameLines = pdf.splitTextToSize(exercise.name, textWidth);
          pdf.text(nameLines.slice(0, 2), textX, exerciseY + 6);
          
          // Equipment badge
          pdf.setFontSize(6);
          const equipColor = exercise.equipment?.toLowerCase().includes("mancuerna") 
            ? COLORS.blue 
            : COLORS.primary;
          setColor(equipColor);
          pdf.text(exercise.equipment?.substring(0, 18) || "—", textX, exerciseY + 14);
          
          // Sets x Reps
          pdf.setFontSize(9);
          pdf.setFont("helvetica", "bold");
          setColor(COLORS.primary);
          pdf.text(`${exercise.sets} × ${exercise.reps}`, textX, exerciseY + 21);
          
          // RIR and Rest time
          pdf.setFontSize(7);
          setColor(COLORS.gray);
          const rirText = exercise.rir ? `RIR: ${exercise.rir}` : "";
          const restText = exercise.restMinutes ? `| ${exercise.restMinutes} descanso` : "";
          pdf.text(`${rirText} ${restText}`, textX, exerciseY + 27);
          
          // Notes if any
          if (exercise.notes) {
            pdf.setFontSize(6);
            pdf.setFont("helvetica", "italic");
            setColor(COLORS.gray);
            const noteLines = pdf.splitTextToSize(exercise.notes, textWidth);
            pdf.text(noteLines.slice(0, 1), textX, exerciseY + 33);
          }
          
          if (!isLeftColumn || idx === day.exercises.length - 1) {
            y += exerciseHeight + 3;
          }
        });

        // Final cardio
        if (day.finalCardio) {
          y += 2;
          setFillColor(COLORS.primary);
          pdf.rect(margin, y, contentWidth, 7, "F");
          pdf.setFontSize(7);
          pdf.setFont("helvetica", "bold");
          setColor(COLORS.white);
          pdf.text(`CARDIO FINAL: ${day.finalCardio}`, margin + 2, y + 5);
          y += 9;
        }

        y += 8;
      });
    }

    drawFooter(pdf.getNumberOfPages());
  });

  // ===== NUTRITION PAGE =====
  if (data.nutrition) {
    pdf.addPage();
    y = margin;

    // Section header
    setFillColor(COLORS.green);
    pdf.rect(margin, y, contentWidth, 10, "F");
    pdf.setFontSize(12);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.white);
    pdf.text("GUÍA DE NUTRICIÓN (Harris-Benedict)", margin + 5, y + 7);
    y += 15;

    // Caloric info box
    setFillColor(COLORS.lightGray);
    pdf.roundedRect(margin, y, contentWidth, 30, 3, 3, "F");
    
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.primary);
    pdf.text("CALORÍAS Y METABOLISMO", margin + 5, y + 7);
    
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    setColor(COLORS.black);
    
    const calY = y + 14;
    pdf.text(`TMB: ${data.nutrition.tmb || "—"} kcal`, margin + 5, calY);
    pdf.text(`TDEE: ${data.nutrition.tdee || "—"} kcal`, margin + 55, calY);
    pdf.text(`Objetivo: ${data.nutrition.targetCalories || data.nutrition.dailyCalories} kcal`, margin + 105, calY);
    
    if (data.nutrition.water) {
      pdf.text(`Agua: ${data.nutrition.water}`, margin + 5, calY + 7);
    }
    
    y += 35;

    // Macros
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.black);
    pdf.text("Macronutrientes Recomendados", margin, y);
    y += 7;

    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(`• Proteína: ${data.nutrition.proteinGrams || "—"}g (${data.nutrition.protein})`, margin, y);
    y += 5;
    pdf.text(`• Carbohidratos: ${data.nutrition.carbsGrams || "—"}g (${data.nutrition.carbs})`, margin, y);
    y += 5;
    pdf.text(`• Grasas: ${data.nutrition.fatsGrams || "—"}g (${data.nutrition.fats})`, margin, y);
    y += 10;

    // Supplements section
    if (data.nutrition.supplements && data.nutrition.supplements.length > 0) {
      setFillColor({ r: 255, g: 237, b: 213 }); // Light orange
      pdf.roundedRect(margin, y, contentWidth, 25, 2, 2, "F");
      
      pdf.setFontSize(9);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.primary);
      pdf.text("SUPLEMENTACIÓN RECOMENDADA (Cafetería 98 Fitness)", margin + 5, y + 7);
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      setColor(COLORS.black);
      let suppY = y + 13;
      data.nutrition.supplements.forEach((supp) => {
        pdf.text(`• ${supp}`, margin + 5, suppY);
        suppY += 4;
      });
      
      y += 28;
    }

    // Meal plan
    if (data.nutrition.mealPlan) {
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.black);
      pdf.text("Plan de Comidas", margin, y);
      y += 7;

      pdf.setFontSize(8);
      data.nutrition.mealPlan.forEach((meal) => {
        checkNewPage(18);
        
        pdf.setFont("helvetica", "bold");
        setColor(COLORS.primary);
        pdf.text(meal.meal, margin, y);
        y += 4;
        
        pdf.setFont("helvetica", "normal");
        setColor(COLORS.black);
        meal.options.forEach((option) => {
          const lines = pdf.splitTextToSize(`• ${option}`, contentWidth - 5);
          pdf.text(lines, margin + 3, y);
          y += lines.length * 4;
        });
        y += 2;
      });
    }

    // Tips
    if (data.nutrition.tips) {
      y += 3;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.black);
      pdf.text("Consejos", margin, y);
      y += 6;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      data.nutrition.tips.forEach((tip) => {
        checkNewPage(8);
        setColor(COLORS.primary);
        pdf.text("✓", margin, y);
        setColor(COLORS.black);
        const lines = pdf.splitTextToSize(tip, contentWidth - 8);
        pdf.text(lines, margin + 4, y);
        y += lines.length * 4 + 2;
      });
    }

    drawFooter(pdf.getNumberOfPages());
  }

  // ===== PROGRESSION & RECOVERY PAGE =====
  if (data.progression || data.recovery) {
    pdf.addPage();
    y = margin;

    // Progression section
    if (data.progression) {
      setFillColor(COLORS.blue);
      pdf.rect(margin, y, contentWidth, 10, "F");
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.white);
      pdf.text("PROGRESIÓN DE CARGA (SOBRECARGA PROGRESIVA)", margin + 5, y + 7);
      y += 15;

      const progressionItems = [
        { title: "Semanas 1-2", content: data.progression.weeks1to2 },
        { title: "Semanas 3-4", content: data.progression.weeks3to4 },
        { title: "Progresión Mensual", content: data.progression.monthlyIncrease },
        { title: "Semana de Descarga (Semana 8)", content: data.progression.deloadWeek || "Reducir volumen al 50%, mantener misma intensidad" },
      ];

      progressionItems.forEach((item) => {
        if (!item.content) return;
        setFillColor(COLORS.lightGray);
        pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
        
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        setColor(COLORS.primary);
        pdf.text(item.title, margin + 5, y + 7);
        
        pdf.setFont("helvetica", "normal");
        setColor(COLORS.black);
        pdf.setFontSize(8);
        const lines = pdf.splitTextToSize(item.content, contentWidth - 10);
        pdf.text(lines, margin + 5, y + 12);
        
        y += 20;
      });
    }

    // Recovery section
    if (data.recovery) {
      y += 5;
      setFillColor({ r: 139, g: 92, b: 246 }); // Purple
      pdf.rect(margin, y, contentWidth, 10, "F");
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.white);
      pdf.text("PROTOCOLO DE RECUPERACIÓN", margin + 5, y + 7);
      y += 15;

      if (data.recovery.sleep && data.recovery.sleep.length > 0) {
        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        setColor(COLORS.black);
        pdf.text("Higiene del Sueño", margin, y);
        y += 6;

        pdf.setFontSize(8);
        pdf.setFont("helvetica", "normal");
        data.recovery.sleep.forEach((tip) => {
          pdf.text(`• ${tip}`, margin + 3, y);
          y += 5;
        });
        y += 3;
      }

      if (data.recovery.deloadProtocol) {
        setFillColor(COLORS.lightGray);
        pdf.roundedRect(margin, y, contentWidth, 15, 2, 2, "F");
        
        pdf.setFontSize(9);
        pdf.setFont("helvetica", "bold");
        setColor(COLORS.primary);
        pdf.text("Protocolo de Descarga", margin + 5, y + 6);
        
        pdf.setFont("helvetica", "normal");
        setColor(COLORS.black);
        pdf.setFontSize(8);
        pdf.text(data.recovery.deloadProtocol, margin + 5, y + 11);
        y += 18;
      }
    }

    // Notes
    if (data.notes && data.notes.length > 0) {
      y += 5;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.black);
      pdf.text("Notas Importantes", margin, y);
      y += 7;

      pdf.setFontSize(8);
      pdf.setFont("helvetica", "normal");
      data.notes.forEach((note) => {
        checkNewPage(8);
        setColor(COLORS.primary);
        pdf.text("•", margin, y);
        setColor(COLORS.black);
        const lines = pdf.splitTextToSize(note, contentWidth - 8);
        pdf.text(lines, margin + 4, y);
        y += lines.length * 4 + 2;
      });
    }

    // Disclaimer
    if (data.disclaimer) {
      y += 10;
      setFillColor({ r: 254, g: 243, b: 199 }); // Light yellow
      pdf.roundedRect(margin, y, contentWidth, 18, 2, 2, "F");
      
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      setColor(COLORS.gray);
      pdf.text("AVISO LEGAL", margin + 5, y + 6);
      
      pdf.setFontSize(7);
      pdf.setFont("helvetica", "normal");
      const disclaimerLines = pdf.splitTextToSize(data.disclaimer, contentWidth - 10);
      pdf.text(disclaimerLines, margin + 5, y + 11);
    }

    drawFooter(pdf.getNumberOfPages());
  }

  // ===== FINAL PAGE - CTA =====
  pdf.addPage();
  y = pageHeight / 2 - 50;

  // Big logo area
  setFillColor(COLORS.black);
  pdf.rect(0, 0, pageWidth, pageHeight, "F");

  pdf.setFontSize(32);
  pdf.setFont("helvetica", "bold");
  setColor(COLORS.white);
  pdf.text("98 FITNESS CLUB", pageWidth / 2, y, { align: "center" });

  y += 12;
  setFillColor(COLORS.primary);
  pdf.rect(pageWidth / 2 - 35, y, 70, 2, "F");

  y += 15;
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.text("¡Gracias por confiar en nosotros!", pageWidth / 2, y, { align: "center" });

  y += 20;
  
  // QR codes on final page - larger for easy scanning
  const finalQrSize = 45; // Increased from 35
  const finalQrY = y;
  const finalQrSpacing = (pageWidth - finalQrSize * 3) / 4;
  
  [{ x: finalQrSpacing, img: qrTiktokBase64, label: "@98fitness_club" }, 
   { x: finalQrSpacing * 2 + finalQrSize, img: qrInstagramBase64, label: "@98FITNESSCLUB" }, 
   { x: finalQrSpacing * 3 + finalQrSize * 2, img: qrWhatsappBase64, label: "Comunidad WhatsApp" }].forEach(({ x, img, label }) => {
    setFillColor(COLORS.white);
    pdf.roundedRect(x - 2, finalQrY - 2, finalQrSize + 4, finalQrSize + 4, 2, 2, "F");
    if (img) {
      try {
        pdf.addImage(img, "JPEG", x, finalQrY, finalQrSize, finalQrSize);
      } catch (e) {
        console.error("Error adding final QR:", e);
      }
    }
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "bold");
    setColor(COLORS.white);
    pdf.text(label, x + finalQrSize / 2, finalQrY + finalQrSize + 8, { align: "center" });
  });

  y = finalQrY + finalQrSize + 25;
  
  pdf.setFontSize(9);
  setColor(COLORS.gray);
  pdf.text("Bogotá, Colombia", pageWidth / 2, y, { align: "center" });

  // Save PDF
  pdf.save(`Rutina_${data.name.replace(/\s+/g, "_")}_98FitnessClub.pdf`);
}
