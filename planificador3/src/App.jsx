import { useState, useEffect, useRef } from "react";

// ─── LOCAL STORAGE HELPERS ────────────────────────────────────
function useLocalStorage(key, defaultVal) {
  const [val, setValState] = useState(() => {
    try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : defaultVal; } catch { return defaultVal; }
  });
  function setVal(v) {
    const next = typeof v === "function" ? v(val) : v;
    setValState(next);
    try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
  }
  return [val, setVal];
}

const DEFAULT_PROFILE = {
  name: "",
  weight: 80,
  height: 178,
  age: 30,
  sex: "H",
  bodyfat: "",
  tdee: 2231,
  targetKcal: 2031,
  restrictions: [],   // "sin_gluten", "vegetariano", "sin_lactosa", "sin_marisco"
  dislikes: "",       // free text
  favoriteProteins: [],
};

const RESTRICTION_OPTIONS = [
  { id: "sin_gluten",   label: "Sin gluten" },
  { id: "vegetariano",  label: "Vegetariano" },
  { id: "sin_lactosa",  label: "Sin lácteos" },
  { id: "sin_marisco",  label: "Sin marisco" },
  { id: "sin_cerdo",    label: "Sin cerdo" },
];

const PROTEIN_OPTIONS = ["Pollo", "Ternera", "Salmón", "Atún", "Gambas", "Huevos", "Bacalao"];



// ─── CONSTANTS ────────────────────────────────────────────────
const DAYS = ["LUN","MAR","MIÉ","JUE","VIE","SÁB","DOM"];
const DAY_FULL = ["Lunes","Martes","Miércoles","Jueves","Viernes","Sábado","Domingo"];

const C = {
  bg:       "#f0ede6",
  card:     "#faf8f4",
  border:   "#ddd8ce",
  accent:   "#3a7d5a",
  accentDim:"#2d6247",
  text:     "#1c1c1a",
  sub:      "#6b6660",
  muted:    "#a09890",
  red:      "#c0392b",
  orange:   "#c47a1a",
  blue:     "#1a5c8a",
};

const MEAL_SLOTS = [
  { key:"desayuno",  label:"Desayuno",       kcal: "400–500" },
  { key:"media_m",   label:"Media mañana",    kcal: "150–300" },
  { key:"almuerzo",  label:"Almuerzo",        kcal: "500–650" },
  { key:"pre",       label:"Pre-entreno",     kcal: "250–380" },
  { key:"cena",      label:"Cena",            kcal: "400–550" },
];

const meals = {
  desayunos: [
    { name: "Tortilla de claras + avena", emoji: "🍳",
      ingredients: ["6 claras de huevo (180g)", "1 huevo entero (60g)", "40g avena en copos", "100g fresas", "Sal, pimienta, AOVE spray"],
      prep: "Bate claras + huevo, cocina en sartén antiadherente. Avena con agua en microondas 2 min.",
      macros: { kcal: 375, prot: 39, carb: 32, fat: 8 }, tupper: false },
    { name: "Yogurt griego + avena + plátano", emoji: "🥣",
      ingredients: ["200g yogurt griego 0%", "40g avena en copos", "1 plátano pequeño (100g)", "5g canela"],
      prep: "Mezcla todo en bol. Overnight oats: prepáralo la noche anterior en tupper.",
      macros: { kcal: 365, prot: 22, carb: 58, fat: 4 }, tupper: true },
    { name: "Tostadas centeno + huevos revueltos", emoji: "🍞",
      ingredients: ["2 rebanadas pan centeno (60g)", "3 huevos enteros", "100g tomate cherry", "Sal, pimienta, AOVE spray"],
      prep: "Revuelve huevos en sartén antiadherente. Tuesta el pan. Tomates crudos al lado.",
      macros: { kcal: 385, prot: 27, carb: 34, fat: 16 }, tupper: false },
    { name: "Batido proteico + avena", emoji: "🥤",
      ingredients: ["30g whey proteína", "300ml leche desnatada", "40g avena en copos", "1 cucharadita cacao puro"],
      prep: "Bate leche + whey. Avena con agua en microondas o mezclada cruda con el batido.",
      macros: { kcal: 385, prot: 43, carb: 40, fat: 5 }, tupper: true },
    { name: "Overnight oats completo", emoji: "🌙",
      ingredients: ["50g avena", "150g yogurt griego 0%", "150ml leche desnatada", "30g arándanos", "15g almendras laminadas"],
      prep: "Mezcla la noche anterior en tupper. Deja en nevera. Listo en 1 min por la mañana.",
      macros: { kcal: 395, prot: 21, carb: 50, fat: 10 }, tupper: true },
    { name: "Tostada centeno + aguacate + salmón ahumado", emoji: "🥑",
      ingredients: ["60g pan de centeno (2 rebanadas)", "40g aguacate", "60g salmón ahumado", "Limón, eneldo, pimienta negra"],
      prep: "Tuesta el pan. Aplasta el aguacate con limón. Coloca el salmón encima y añade eneldo.",
      macros: { kcal: 370, prot: 26, carb: 28, fat: 16 }, tupper: false },
    { name: "Protein pancakes de cottage", emoji: "🥞",
      ingredients: ["150g queso cottage 0%", "3 claras de huevo", "40g avena en copos", "Canela, edulcorante, AOVE spray"],
      prep: "Bate cottage + claras + avena hasta homogéneo. Cocina porciones en sartén antiadherente a fuego medio-bajo. 3-4 min por lado.",
      macros: { kcal: 380, prot: 36, carb: 34, fat: 6 }, tupper: true },
    { name: "Skyr + granola sin azúcar + arándanos", emoji: "🫐",
      ingredients: ["200g skyr natural", "30g granola sin azúcar añadido", "80g arándanos frescos"],
      prep: "Monta en bowl o tupper en capas. La granola encima para que no se ablande si lo preparas la noche anterior.",
      macros: { kcal: 355, prot: 26, carb: 46, fat: 5 }, tupper: true },
    { name: "Sándwich proteico de huevo y jamón", emoji: "🥪",
      ingredients: ["2 rebanadas pan integral (70g)", "2 huevos revueltos", "40g jamón serrano", "Tomate, pimienta, AOVE spray"],
      prep: "Revuelve los huevos con el jamón en sartén. Monta el sándwich con tomate. Rápido y contundente.",
      macros: { kcal: 390, prot: 30, carb: 32, fat: 14 }, tupper: false },
    { name: "Mug cake proteico", emoji: "☕",
      ingredients: ["40g avena en copos", "25g whey proteína chocolate", "1 huevo entero", "1 cucharadita cacao puro", "Agua c/s"],
      prep: "Mezcla todo con agua hasta pasta espesa. Microondas 90 segundos a potencia máxima. Deja reposar 1 min.",
      macros: { kcal: 365, prot: 34, carb: 32, fat: 8 }, tupper: false },
    { name: "Tortilla + jamón + queso fresco", emoji: "🍳",
      ingredients: ["3 huevos enteros", "40g jamón serrano", "50g queso fresco batido 0%", "Sal, pimienta, AOVE spray"],
      prep: "Bate los huevos con el queso fresco. Añade el jamón en trozos. Cocina en sartén antiadherente a fuego medio.",
      macros: { kcal: 375, prot: 36, carb: 2, fat: 24 }, tupper: false },
    { name: "Batido verde proteico", emoji: "💚",
      ingredients: ["25g whey proteína vainilla", "200ml leche desnatada", "50g espinacas frescas", "1 plátano pequeño (100g)"],
      prep: "Bate todo en licuadora 30 segundos. Beber inmediatamente o conservar en bote cerrado en nevera máx 8h.",
      macros: { kcal: 360, prot: 32, carb: 44, fat: 4 }, tupper: true },
    { name: "Bowl de requesón + aguacate + huevo", emoji: "🥗",
      ingredients: ["200g requesón o cottage 0%", "60g aguacate", "1 huevo duro", "100g tomate cherry", "10g AOVE", "Orégano, sal, pimienta"],
      prep: "Monta en bowl con el requesón de base. Aguacate en dados, huevo en rodajas, tomate cherry y AOVE. Listo en 3 min.",
      macros: { kcal: 420, prot: 30, carb: 14, fat: 26 }, tupper: true },
    { name: "Huevos al horno en tomate", emoji: "🍅",
      ingredients: ["2 huevos enteros", "200g salsa de tomate casera (o triturado)", "40g pan de centeno", "Ajo, orégano, AOVE"],
      prep: "Calienta el tomate en sartén apta para horno. Haz dos huecos y casca los huevos. Horno 180° 10-12 min.",
      macros: { kcal: 370, prot: 22, carb: 34, fat: 14 }, tupper: false },
    { name: "Gachas de arroz proteicas", emoji: "🍚",
      ingredients: ["50g arroz cocido (o 20g en seco)", "25g whey chocolate", "200ml leche desnatada", "Canela al gusto"],
      prep: "Calienta el arroz con la leche. Retira del fuego y disuelve el whey removiendo rápido. Añade canela.",
      macros: { kcal: 370, prot: 30, carb: 46, fat: 4 }, tupper: true },
    { name: "Requesón + miel + nueces", emoji: "🧀",
      ingredients: ["250g requesón o cottage 0%", "10g miel", "20g nueces", "Canela al gusto"],
      prep: "Mezcla en bowl, nueces encima. Listo en 2 min. Perfecto cuando no hay tiempo de cocinar.",
      macros: { kcal: 370, prot: 28, carb: 22, fat: 18 }, tupper: true },
    { name: "Yogur griego + avena + arándanos", emoji: "🫐",
      ingredients: ["250g yogurt griego 0%", "50g avena en copos", "80g arándanos frescos o congelados"],
      prep: "Mezcla avena + yogur, añade arándanos encima. Puedes dejarlo preparado la noche anterior.",
      macros: { kcal: 380, prot: 24, carb: 55, fat: 5 }, tupper: true },
    { name: "Avena con mantequilla de cacahuete + plátano", emoji: "🥜",
      ingredients: ["60g avena en copos", "2 cucharadas crema de cacahuete (30g)", "1 plátano (120g)", "200ml leche desnatada", "10g miel"],
      prep: "Avena con leche en microondas 3 min. Añade el plátano en rodajas, la crema de cacahuete y la miel. Ideal pre-carrera larga.",
      macros: { kcal: 540, prot: 20, carb: 78, fat: 16 }, tupper: true },
    { name: "Wrap de huevos + jamón + queso", emoji: "🌯",
      ingredients: ["1 tortilla integral grande (70g)", "3 huevos enteros", "50g jamón serrano", "30g queso semicurado", "Tomate, sal, AOVE spray"],
      prep: "Revuelve los huevos con el jamón. Monta el wrap con el queso y el tomate. Enrolla y come o llévalo en papel de aluminio.",
      macros: { kcal: 510, prot: 38, carb: 36, fat: 22 }, tupper: false },
    { name: "Bowl de quinoa + huevo + aguacate", emoji: "🥑",
      ingredients: ["60g quinoa (seco)", "2 huevos enteros", "80g aguacate", "100g tomate cherry", "Limón, sal, AOVE 10g"],
      prep: "Quinoa cocida 15 min. Huevos fritos o escalfados. Monta el bowl con aguacate en dados y tomates. Alíña con limón y AOVE.",
      macros: { kcal: 560, prot: 28, carb: 52, fat: 24 }, tupper: false },
    { name: "Tostadas francesas proteicas + fruta", emoji: "🍞",
      ingredients: ["3 rebanadas pan brioche integral (90g)", "3 huevos enteros", "100ml leche desnatada", "150g fresas o arándanos", "Canela, vainilla, AOVE spray"],
      prep: "Bate huevos con leche y canela. Empapa el pan y cocina en sartén 3 min por lado. Sirve con fruta.",
      macros: { kcal: 490, prot: 32, carb: 56, fat: 14 }, tupper: false },
    { name: "Batido hipercalórico de recuperación", emoji: "💪",
      ingredients: ["30g whey proteína chocolate", "60g avena en copos", "1 plátano maduro (120g)", "20g mantequilla de almendras", "300ml leche desnatada"],
      prep: "Bate todo en licuadora. Ideal post-carrera larga de más de 15 km o día de full body intenso.",
      macros: { kcal: 620, prot: 42, carb: 80, fat: 14 }, tupper: false },
    { name: "Gofres proteicos con plátano", emoji: "🧇",
      ingredients: ["50g avena molida", "150g yogurt griego 0%", "2 huevos enteros", "1 plátano (120g)", "Canela, levadura en polvo, AOVE spray"],
      prep: "Tritura avena con yogur, huevos y canela. Cocina en gofrera o sartén pequeña. Sirve con plátano en rodajas.",
      macros: { kcal: 490, prot: 30, carb: 62, fat: 12 }, tupper: false },  ],
  almuerzos: [
    { name: "Pollo + arroz basmati + brócoli", emoji: "🍗",
      ingredients: ["200g pechuga de pollo", "60g arroz basmati (seco)", "200g brócoli", "Sal, especias, AOVE spray"],
      prep: "Pollo a la plancha o al horno 200° 20 min. Arroz cocido. Brócoli al vapor 5 min. Tupper.",
      macros: { kcal: 520, prot: 52, carb: 52, fat: 7 }, tupper: true },
    { name: "Pollo al curry + arroz integral", emoji: "🍛",
      ingredients: ["200g pechuga de pollo troceada", "60g arroz integral (seco)", "100g cebolla", "Curry, cúrcuma, comino, AOVE spray"],
      prep: "Saltea pollo con cebolla y especias 10 min. Arroz integral cocido 25 min. Mezcla en tupper.",
      macros: { kcal: 510, prot: 47, carb: 53, fat: 8 }, tupper: true },
    { name: "Salmón al horno + boniato + espinacas", emoji: "🐟",
      ingredients: ["180g salmón fresco (lomo)", "200g boniato", "150g espinacas frescas", "Eneldo, zumo limón, sal, AOVE spray"],
      prep: "Boniato al horno 200° 35 min. Salmón al horno 180° 15 min. Espinacas salteadas 2 min.",
      macros: { kcal: 520, prot: 42, carb: 40, fat: 18 }, tupper: true },
    { name: "Ternera magra + quinoa + espinacas", emoji: "🥩",
      ingredients: ["200g ternera picada 5% grasa", "50g quinoa (seco)", "150g espinacas frescas", "Ajo, sal, AOVE spray"],
      prep: "Saltea la ternera con ajo. Quinoa cocida 15 min. Espinacas salteadas 2 min. Mezcla en tupper.",
      macros: { kcal: 530, prot: 48, carb: 38, fat: 14 }, tupper: true },
    { name: "Pollo teriyaki + arroz + edamame", emoji: "🍱",
      ingredients: ["200g pechuga de pollo", "60g arroz jazmín (seco)", "80g edamame descongelado", "Salsa teriyaki light 20ml, sésamo"],
      prep: "Marina el pollo en teriyaki 10 min. Cocina a la plancha. Arroz cocido. Edamame al micro 3 min.",
      macros: { kcal: 530, prot: 50, carb: 55, fat: 9 }, tupper: true },
    { name: "Pollo al limón + patata + brócoli", emoji: "🍋",
      ingredients: ["200g muslo de pollo sin piel", "200g patata", "150g brócoli", "Limón, romero, ajo, AOVE"],
      prep: "Todo al horno 200° con limón y romero durante 35 min. Brócoli al vapor los últimos 5 min.",
      macros: { kcal: 510, prot: 44, carb: 42, fat: 14 }, tupper: true },
    { name: "Bowl de pollo asado + boniato + aguacate", emoji: "🥑",
      ingredients: ["200g pechuga de pollo", "150g boniato asado", "50g aguacate", "Ensalada mixta, limón, sal"],
      prep: "Pollo y boniato al horno juntos 25 min. Monta el bowl con la ensalada y el aguacate en el momento.",
      macros: { kcal: 540, prot: 46, carb: 38, fat: 18 }, tupper: true },
    { name: "Carne picada + patata cocida + espinacas", emoji: "🫕",
      ingredients: ["200g carne picada magra 5% grasa", "300g patata cocida", "150g espinacas", "Ajo, AOVE spray, sal"],
      prep: "Saltea la carne con ajo. Patata cocida previamente. Espinacas salteadas 2 min. Todo en tupper.",
      macros: { kcal: 540, prot: 46, carb: 45, fat: 14 }, tupper: true },
    { name: "Ternera magra + arroz + zanahoria", emoji: "🥕",
      ingredients: ["180g ternera magra", "60g arroz (seco)", "150g zanahoria", "Caldo, laurel, sal, AOVE spray"],
      prep: "Ternera a la plancha o en guiso suave. Arroz cocido. Zanahoria al vapor o cocida. Tupper.",
      macros: { kcal: 500, prot: 44, carb: 48, fat: 10 }, tupper: true },
    { name: "Pollo tikka masala + arroz basmati", emoji: "🫕",
      ingredients: ["200g pechuga de pollo", "60g arroz basmati (seco)", "100g tomate triturado", "80g yogur griego 0%", "Curry, cúrcuma, comino, ajo, AOVE"],
      prep: "Marina el pollo en yogur+especias 10 min. Saltea con tomate 10 min. Arroz cocido. Mezcla en tupper.",
      macros: { kcal: 520, prot: 50, carb: 50, fat: 9 }, tupper: true },
    { name: "Pollo con champiñones al ajillo + patata", emoji: "🍄",
      ingredients: ["200g pechuga de pollo", "150g champiñones", "200g patata cocida", "Ajo laminado, perejil, AOVE 10g"],
      prep: "Saltea el ajo con AOVE. Añade el pollo y los champiñones 8 min. Patata cocida aparte. Tupper.",
      macros: { kcal: 510, prot: 46, carb: 40, fat: 12 }, tupper: true },
    { name: "Pollo marroquí (chermoula) + cuscús", emoji: "🌍",
      ingredients: ["200g pechuga de pollo", "60g cuscús (seco)", "Comino, cilantro, pimentón, limón, ajo, AOVE 10g"],
      prep: "Marina el pollo con especias 20 min. A la plancha 6 min por lado. Cuscús: agua hirviendo, tapa 5 min.",
      macros: { kcal: 515, prot: 48, carb: 50, fat: 11 }, tupper: true },
    { name: "Hamburguesa de ternera + boniato chips", emoji: "🍔",
      ingredients: ["200g ternera picada 5%", "200g boniato", "Ajo en polvo, sal, pimienta, AOVE spray"],
      prep: "Boniato en láminas al horno 200° 25 min. Forma la hamburguesa y cocina a la plancha 4 min por lado.",
      macros: { kcal: 530, prot: 44, carb: 42, fat: 16 }, tupper: true },
    { name: "Berenjena rellena de carne picada", emoji: "🍆",
      ingredients: ["1 berenjena grande (300g)", "220g carne picada magra 5%", "100g tomate triturado", "50g mozzarella light", "60g arroz cocido"],
      prep: "Mezcla la carne salteada con el arroz cocido y el tomate. Rellena la berenjena, cubre con mozzarella. Horno 200° 20 min.",
      macros: { kcal: 570, prot: 48, carb: 36, fat: 22 }, tupper: true },
    { name: "Wok de ternera + brócoli + arroz", emoji: "🥦",
      ingredients: ["180g ternera magra en tiras", "200g brócoli", "60g arroz (seco)", "Salsa soja light 20ml, ajo, jengibre"],
      prep: "Wok muy caliente. Ternera 2 min, añade brócoli y soja, 4 min más. Arroz cocido aparte. Tupper.",
      macros: { kcal: 510, prot: 46, carb: 48, fat: 10 }, tupper: true },
    { name: "Pasta integral + pollo + pesto + parmesano", emoji: "🍝",
      ingredients: ["80g pasta integral (seco)", "200g pechuga de pollo", "20g pesto", "15g parmesano rallado", "Sal, pimienta"],
      prep: "Pasta cocida al dente 10 min. Pollo a la plancha en trozos. Mezcla con pesto caliente. Parmesano encima.",
      macros: { kcal: 680, prot: 54, carb: 68, fat: 18 }, tupper: true },
    { name: "Ternera + arroz + aguacate + huevo frito", emoji: "🥩",
      ingredients: ["200g ternera magra", "70g arroz basmati (seco)", "60g aguacate", "1 huevo entero", "Salsa soja, sal, AOVE 10g"],
      prep: "Arroz cocido. Ternera a la plancha. Huevo frito en sartén con AOVE. Monta el bowl con aguacate y soja.",
      macros: { kcal: 710, prot: 54, carb: 60, fat: 26 }, tupper: false },
    { name: "Bowl de salmón + arroz + edamame + aguacate", emoji: "🐟",
      ingredients: ["200g salmón fresco", "70g arroz jazmín (seco)", "80g edamame descongelado", "50g aguacate", "Soja light, sésamo, jengibre"],
      prep: "Arroz cocido. Salmón al horno 15 min. Monta el bowl con edamame y aguacate. Aliña con soja y jengibre.",
      macros: { kcal: 720, prot: 52, carb: 64, fat: 26 }, tupper: true },
    { name: "Pollo + boniato grande + frutos secos", emoji: "🍠",
      ingredients: ["220g pechuga de pollo", "300g boniato", "25g almendras + nueces", "Romero, ajo, AOVE 10g"],
      prep: "Boniato al horno 35 min. Pollo a la plancha con ajo. Sirve con frutos secos encima del boniato caliente.",
      macros: { kcal: 690, prot: 52, carb: 62, fat: 22 }, tupper: true },
    { name: "Estofado de ternera + patata + pan centeno", emoji: "🫕",
      ingredients: ["200g ternera para guisar", "250g patata", "150g zanahoria", "40g pan de centeno", "Caldo, laurel, AOVE"],
      prep: "Estofado lento 45 min. La patata absorbe el caldo. Con el pan de centeno alcanza las kcal de carga.",
      macros: { kcal: 650, prot: 46, carb: 68, fat: 14 }, tupper: true },  ],
  cenas: [
    { name: "Pollo + verduras asadas al horno", emoji: "🍗",
      ingredients: ["220g pechuga de pollo", "150g calabacín", "150g berenjena", "100g cebolla", "Hierbas provenzales, sal, AOVE spray"],
      prep: "Todo al horno 200° durante 25 min. Ideal para batch cooking del domingo.",
      macros: { kcal: 400, prot: 48, carb: 20, fat: 8 }, tupper: true },
    { name: "Salmón al horno + calabacín", emoji: "🐟",
      ingredients: ["180g salmón fresco", "200g calabacín en rodajas", "100g tomate cherry", "Eneldo, limón, sal, AOVE spray"],
      prep: "Salmón al horno 180° 15 min. Calabacín a la plancha o al horno junto. Tomates crudos al lado.",
      macros: { kcal: 415, prot: 40, carb: 12, fat: 20 }, tupper: true },
    { name: "Tortilla de claras + espinacas + champiñones", emoji: "🍄",
      ingredients: ["3 huevos enteros", "100g claras pasteurizadas", "150g espinacas", "100g champiñones", "Sal, ajo en polvo"],
      prep: "Saltea espinacas y champiñones. Añade huevos batidos. Fuego medio hasta cuajar.",
      macros: { kcal: 390, prot: 41, carb: 8, fat: 20 }, tupper: false },
    { name: "Pollo + ensalada grande + huevos duros", emoji: "🥗",
      ingredients: ["220g pechuga de pollo", "Lechuga, tomate, pepino (ilimitado)", "2 huevos duros", "Limón, mostaza, sal"],
      prep: "Pollo a la plancha. Huevos duros 10 min. Monta la ensalada y alíña con limón y mostaza.",
      macros: { kcal: 440, prot: 54, carb: 8, fat: 16 }, tupper: true },
    { name: "Ternera + calabacín y champiñones salteados", emoji: "🥩",
      ingredients: ["200g ternera magra en tiras", "200g calabacín", "100g champiñones", "Salsa soja baja sal 15ml, ajo"],
      prep: "Saltea ternera a fuego fuerte 3 min. Añade verduras, soja y ajo. Listo en 8 min.",
      macros: { kcal: 410, prot: 46, carb: 10, fat: 18 }, tupper: true },
    { name: "Crema de calabaza + huevo poché + pan centeno", emoji: "🎃",
      ingredients: ["300g calabaza", "2 huevos", "15g AOVE", "2 rebanadas pan centeno (60g)", "Sal, nuez moscada, caldo de verduras"],
      prep: "Cuece la calabaza en caldo 20 min, tritura con AOVE. Escalfa los huevos 3 min. Sirve con el pan de centeno tostado.",
      macros: { kcal: 480, prot: 24, carb: 46, fat: 22 }, tupper: false },
    { name: "Salmón al vapor con jengibre + brócoli", emoji: "🐟",
      ingredients: ["180g salmón fresco", "200g brócoli", "Jengibre rallado 5g", "Salsa soja light 10ml, limón"],
      prep: "Salmón al vapor 12 min. Brócoli al vapor 5 min. Aliña con jengibre, soja y limón al momento.",
      macros: { kcal: 410, prot: 40, carb: 10, fat: 22 }, tupper: true },
    { name: "Rollitos de lechuga con carne + arroz jazmín", emoji: "🥬",
      ingredients: ["200g ternera picada 5%", "8 hojas lechuga romana", "60g arroz jazmín cocido", "Soja light 15ml", "Ajo, jengibre, sésamo"],
      prep: "Saltea la carne con ajo, jengibre y soja 5 min. Mezcla con el arroz. Sirve dentro de las hojas de lechuga.",
      macros: { kcal: 490, prot: 46, carb: 42, fat: 14 }, tupper: false },
    { name: "Pollo en salsa de mostaza + calabacín", emoji: "🍋",
      ingredients: ["220g pechuga de pollo", "200g calabacín", "15g mostaza de Dijon", "80g yogur griego 0%, sal"],
      prep: "Pollo a la plancha. Mezcla mostaza+yogur como salsa. Calabacín a la plancha. Sirve la salsa encima.",
      macros: { kcal: 405, prot: 52, carb: 8, fat: 14 }, tupper: true },
    { name: "Tortilla española proteica", emoji: "🥚",
      ingredients: ["3 huevos enteros", "100g claras pasteurizadas", "200g patata cocida", "1/2 cebolla (80g)", "AOVE spray"],
      prep: "Sofríe la cebolla. Mezcla huevos+claras+patata cocida en dados. Cocina tapada a fuego suave 8 min.",
      macros: { kcal: 430, prot: 38, carb: 30, fat: 16 }, tupper: true },
    { name: "Pollo al ajillo + espárragos trigueros", emoji: "🌾",
      ingredients: ["220g pechuga de pollo", "200g espárragos trigueros", "4 dientes ajo", "Limón, AOVE 10g, perejil"],
      prep: "Dora el ajo en AOVE. Añade el pollo en trozos 6 min. Espárragos a la plancha paralelo. Exprime limón.",
      macros: { kcal: 390, prot: 50, carb: 8, fat: 16 }, tupper: true },
    { name: "Sopa de pollo con fideos", emoji: "🍜",
      ingredients: ["200g pechuga de pollo", "40g fideos finos", "150g zanahoria", "Caldo casero, laurel, sal"],
      prep: "Cuece el pollo en caldo 15 min. Desmenuza. Añade fideos y zanahoria 8 min más. Ideal post-carrera larga.",
      macros: { kcal: 390, prot: 42, carb: 32, fat: 6 }, tupper: true },
    { name: "Revuelto de claras + gambas + espárragos + patata", emoji: "🍤",
      ingredients: ["150g claras pasteurizadas", "100g gambas peladas", "150g espárragos", "200g patata cocida en dados", "Ajo, AOVE 10g, sal"],
      prep: "Saltea la patata con ajo y AOVE 4 min. Añade gambas y espárragos 3 min más. Vuelca las claras y revuelve hasta cuajar.",
      macros: { kcal: 490, prot: 48, carb: 36, fat: 14 }, tupper: false },
    { name: "Pollo con berenjena al horno", emoji: "🍆",
      ingredients: ["220g pechuga de pollo", "200g berenjena", "100g tomate triturado", "Orégano, ajo, AOVE spray"],
      prep: "Berenjena en rodajas al horno con tomate 15 min. Añade el pollo encima otros 20 min a 200°. Tupper.",
      macros: { kcal: 400, prot: 50, carb: 14, fat: 10 }, tupper: true },
    { name: "Ternera + champiñones + crema de coliflor", emoji: "🥦",
      ingredients: ["200g ternera magra", "100g champiñones", "250g coliflor", "Ajo, caldo, AOVE 10g, nuez moscada"],
      prep: "Coliflor cocida 15 min y triturada con caldo. Ternera y champiñones a la plancha. Sirve sobre la crema.",
      macros: { kcal: 410, prot: 48, carb: 12, fat: 18 }, tupper: true },
    { name: "Pollo al pesto + calabacín a la plancha", emoji: "🌿",
      ingredients: ["220g pechuga de pollo", "200g calabacín en rodajas", "15g pesto ligero", "Sal, pimienta"],
      prep: "Pollo a la plancha 6 min por lado. Unta pesto al final. Calabacín a la plancha paralelo.",
      macros: { kcal: 420, prot: 50, carb: 8, fat: 18 }, tupper: true },
    { name: "Ternera magra + espárragos + AOVE", emoji: "🌾",
      ingredients: ["200g ternera magra", "200g espárragos verdes", "10g aceite oliva virgen extra", "Sal, limón"],
      prep: "Ternera a la plancha 3-4 min por lado. Espárragos a la plancha o al vapor. Alíña con AOVE y limón.",
      macros: { kcal: 400, prot: 46, carb: 5, fat: 18 }, tupper: true },
    { name: "Pollo + ensalada + aguacate", emoji: "🥑",
      ingredients: ["200g pechuga de pollo", "Lechuga + tomate grande 250g", "60g aguacate", "AOVE, limón, sal"],
      prep: "Pollo a la plancha. Monta la ensalada con aguacate en dados. Alíña al momento.",
      macros: { kcal: 430, prot: 46, carb: 8, fat: 22 }, tupper: true },
    { name: "Salmón al horno + patata + ensalada AOVE", emoji: "🐟",
      ingredients: ["200g salmón fresco", "250g patata cocida", "Ensalada mixta grande", "15g AOVE", "Limón, sal, eneldo"],
      prep: "Salmón al horno 15 min. Patata cocida. Ensalada aliñada generosamente con AOVE. Cena de recuperación.",
      macros: { kcal: 540, prot: 44, carb: 38, fat: 24 }, tupper: false },
    { name: "Pollo al horno + boniato + guacamole", emoji: "🥑",
      ingredients: ["220g pechuga de pollo", "250g boniato", "60g aguacate", "Limón, cilantro, sal, AOVE spray"],
      prep: "Boniato y pollo al horno juntos 30 min. Aplasta el aguacate con limón y sal. Sirve el guacamole encima.",
      macros: { kcal: 560, prot: 50, carb: 48, fat: 16 }, tupper: true },
    { name: "Ternera + arroz basmati + brócoli + AOVE", emoji: "🥩",
      ingredients: ["200g ternera magra", "60g arroz basmati (seco)", "200g brócoli", "15g AOVE", "Ajo, limón, sal"],
      prep: "La misma combinación clásica pero con más grasa saludable. El AOVE extra sube las calorías sin afectar la saciedad.",
      macros: { kcal: 530, prot: 48, carb: 52, fat: 14 }, tupper: true },
    { name: "Tortilla española + ensalada + pan centeno", emoji: "🥚",
      ingredients: ["3 huevos + 2 claras", "200g patata cocida", "1/2 cebolla", "Ensalada mixta", "40g pan centeno", "AOVE 10g"],
      prep: "Tortilla española con cebolla pochada. Ensalada aliñada. Pan de centeno al lado. Cena completa y saciante.",
      macros: { kcal: 520, prot: 36, carb: 46, fat: 18 }, tupper: false },
    { name: "Pasta integral + ternera + salsa de tomate", emoji: "🍝",
      ingredients: ["70g pasta integral (seco)", "150g ternera picada 5%", "150g tomate triturado", "Ajo, orégano, AOVE spray"],
      prep: "Pasta cocida al dente. Saltea la ternera con ajo, añade tomate y reduce 10 min. Mezcla con la pasta.",
      macros: { kcal: 550, prot: 44, carb: 62, fat: 12 }, tupper: true },  ],
  media_manana: [
    { name: "Skyr + frutos rojos + granola + almendras", emoji: "🍓",
      ingredients: ["200g skyr natural", "80g frutos rojos mixtos", "20g granola sin azúcar", "15g almendras laminadas"],
      prep: "Monta en capas. La granola y las almendras dan textura y suben las calorías a un nivel útil de media mañana.",
      macros: { kcal: 310, prot: 24, carb: 32, fat: 9 }, tupper: true },
    { name: "Huevos duros + aguacate + tomate", emoji: "🥚",
      ingredients: ["2 huevos duros", "50g aguacate", "1 tomate mediano (150g)", "Sal, limón, AOVE spray"],
      prep: "Huevos del batch cooking del domingo. Aguacate en dados con limón. Snack completo y saciante.",
      macros: { kcal: 250, prot: 16, carb: 8, fat: 16 }, tupper: true },
    { name: "Tortilla de claras + pavo + queso", emoji: "🍳",
      ingredients: ["3 claras de huevo", "1 huevo entero", "40g pavo en lonchas", "20g queso fresco batido", "Sal, especias"],
      prep: "Bate claras con el huevo, añade el pavo en trozos. Cocina en sartén pequeña. Come con el queso encima.",
      macros: { kcal: 220, prot: 30, carb: 2, fat: 10 }, tupper: true },
    { name: "Jamón ibérico + manzana", emoji: "🍎",
      ingredients: ["50g jamón ibérico (sin grasa visible)", "1 manzana (150g)"],
      prep: "Come por separado. El ibérico aporta proteína + grasa de calidad. La manzana, fibra y saciedad.",
      macros: { kcal: 175, prot: 14, carb: 22, fat: 6 }, tupper: false },
    { name: "Smoothie proteico express", emoji: "🥤",
      ingredients: ["20g whey proteína vainilla", "150ml leche desnatada", "50g fresas frescas o congeladas"],
      prep: "Bate o agita en shaker. Consume en 10 min. Preparado en menos de 2 minutos.",
      macros: { kcal: 165, prot: 22, carb: 14, fat: 2 }, tupper: false },
    { name: "Queso fresco + pepino + nueces + tomate", emoji: "🧀",
      ingredients: ["150g queso fresco batido 0%", "100g pepino", "100g tomate cherry", "20g nueces", "Sal, AOVE 5g, eneldo"],
      prep: "Mezcla en tupper. Las nueces y el AOVE convierten este snack ligero en una media mañana real y saciante.",
      macros: { kcal: 270, prot: 18, carb: 10, fat: 18 }, tupper: true },
    { name: "Pollo frío + tortitas de arroz + mostaza", emoji: "🍗",
      ingredients: ["120g pechuga de pollo cocida", "2 tortitas de arroz (18g)", "1 cucharada mostaza Dijon", "100g tomate cherry"],
      prep: "Pollo del batch cooking partido en tiras. Tortitas como base. Tomates al lado. Snack completo.",
      macros: { kcal: 250, prot: 32, carb: 22, fat: 4 }, tupper: true },
    { name: "Mix de nueces + arándanos secos", emoji: "🫐",
      ingredients: ["20g nueces crudas", "20g arándanos secos sin azúcar añadido"],
      prep: "Prepara porciones en bolsitas el domingo. Snack de bolsillo para cuando estás fuera.",
      macros: { kcal: 180, prot: 4, carb: 18, fat: 12 }, tupper: false },
    { name: "Café proteico (protein latte)", emoji: "☕",
      ingredients: ["25g whey vainilla", "1 espresso (30ml)", "150ml leche desnatada fría"],
      prep: "Mezcla la leche fría con el whey hasta disolver. Añade el espresso. Agita bien. Frío o templado.",
      macros: { kcal: 160, prot: 22, carb: 10, fat: 2 }, tupper: false },
    { name: "Zanahoria + hummus de yogur + almendras", emoji: "🥕",
      ingredients: ["150g zanahoria en palitos", "100g yogurt griego 0%", "1 cucharadita tahini (10g)", "20g almendras", "Limón, sal"],
      prep: "Mezcla el yogur con el tahini y limón para hacer un dip casero. Sirve con zanahorias y almendras al lado.",
      macros: { kcal: 270, prot: 16, carb: 20, fat: 14 }, tupper: true },
    { name: "Yogurt griego + nueces", emoji: "🥜",
      ingredients: ["200g yogurt griego 0%", "20g nueces"],
      prep: "Mezcla y listo. Cómelo entre el desayuno y el almuerzo.",
      macros: { kcal: 200, prot: 16, carb: 10, fat: 11 }, tupper: true },
    { name: "Requesón + fresas + avena + miel", emoji: "🍓",
      ingredients: ["150g requesón 0%", "100g fresas", "20g avena en copos", "8g miel"],
      prep: "Mezcla en bowl. La avena aporta carbos lentos y la miel da el toque dulce. Tupper perfecto para llevar.",
      macros: { kcal: 250, prot: 18, carb: 34, fat: 2 }, tupper: true },
    { name: "Jamón serrano + pan integral", emoji: "🥖",
      ingredients: ["60g jamón serrano (sin grasa visible)", "40g pan integral"],
      prep: "Prepara en 1 min. Portátil y saciante. Ideal para llevar al trabajo.",
      macros: { kcal: 175, prot: 16, carb: 18, fat: 4 }, tupper: false },
    { name: "2 huevos cocidos + mandarina", emoji: "🍊",
      ingredients: ["2 huevos duros", "1 mandarina (150g)"],
      prep: "Cuece los huevos el domingo en batch. Lleva en tupper con la fruta entera.",
      macros: { kcal: 190, prot: 14, carb: 16, fat: 10 }, tupper: true },
    { name: "Almendras + manzana", emoji: "🍎",
      ingredients: ["25g almendras crudas", "1 manzana media (150g)"],
      prep: "Ideal cuando estás fuera de casa. Sin nevera necesaria.",
      macros: { kcal: 195, prot: 5, carb: 28, fat: 12 }, tupper: false },
    { name: "Tostada + mantequilla de cacahuete + plátano", emoji: "🍌",
      ingredients: ["2 rebanadas pan integral (70g)", "30g crema de cacahuete", "1 plátano mediano (120g)"],
      prep: "Tuesta el pan, unta la crema de cacahuete, plátano en rodajas encima. Ideal para días de mayor gasto.",
      macros: { kcal: 430, prot: 14, carb: 62, fat: 14 }, tupper: false },
    { name: "Batido de plátano + avena + almendras", emoji: "🥤",
      ingredients: ["1 plátano maduro (120g)", "40g avena", "20g almendras", "200ml leche desnatada", "25g whey"],
      prep: "Bate todo en licuadora. Snack denso para días de mayor volumen de entrenamiento.",
      macros: { kcal: 460, prot: 32, carb: 56, fat: 12 }, tupper: false },
    { name: "Yogur + granola + fruta + nueces", emoji: "🥣",
      ingredients: ["200g yogurt griego 0%", "30g granola sin azúcar", "100g fruta fresca", "20g nueces"],
      prep: "Monta en capas en tupper. Granola y nueces suben las calorías para días de alta actividad.",
      macros: { kcal: 380, prot: 20, carb: 44, fat: 14 }, tupper: true },
    { name: "Pan integral + aguacate + huevo duro", emoji: "🥑",
      ingredients: ["2 rebanadas pan integral (70g)", "60g aguacate", "2 huevos duros", "Sal, pimienta, limón"],
      prep: "Aplasta el aguacate sobre el pan. Huevos duros del batch cooking encima en rodajas.",
      macros: { kcal: 410, prot: 22, carb: 34, fat: 20 }, tupper: false },
  ],
  pre_entreno: [
    { name: "Arroz blanco + pollo + soja", emoji: "🍚",
      ingredients: ["60g arroz blanco (seco)", "150g pechuga de pollo", "Soja light 15ml, ajo en polvo"],
      prep: "El clásico de gym. Arroz cocido, pollo a la plancha, aliña con soja. Prepara en batch el domingo.",
      macros: { kcal: 380, prot: 38, carb: 46, fat: 5 }, tupper: true },
    { name: "Boniato cocido + pollo frío", emoji: "🍠",
      ingredients: ["200g boniato cocido", "120g pechuga de pollo cocida", "Sal, pimentón"],
      prep: "Ambos del batch cooking del domingo. Cómelo frío o calienta en microondas 2 min. Carbos + proteína perfectos.",
      macros: { kcal: 360, prot: 32, carb: 44, fat: 4 }, tupper: true },
    { name: "Tostada integral + miel + requesón", emoji: "🍯",
      ingredients: ["60g pan integral (2 rebanadas)", "10g miel", "100g requesón 0%"],
      prep: "Unta el requesón y añade la miel. La miel da carbos rápidos ideales 45 min antes del entreno.",
      macros: { kcal: 310, prot: 16, carb: 50, fat: 3 }, tupper: false },
    { name: "Batido tropical pre-entreno", emoji: "🥭",
      ingredients: ["30g whey proteína", "150ml agua de coco", "100g mango congelado o fresco"],
      prep: "Bate todo. El agua de coco aporta electrolitos naturales. Ideal 30-45 min antes de carrera o fuerza.",
      macros: { kcal: 280, prot: 26, carb: 36, fat: 2 }, tupper: false },
    { name: "Dátiles + almendras + whey disuelto", emoji: "🌴",
      ingredients: ["3 dátiles medianos (45g)", "20g almendras crudas", "20g whey en 100ml agua"],
      prep: "Come dátiles y almendras juntos, bebe el whey disuelto aparte. Energía inmediata + proteína.",
      macros: { kcal: 290, prot: 18, carb: 34, fat: 8 }, tupper: false },
    { name: "Bowl mini de avena + miel + plátano", emoji: "🍌",
      ingredients: ["35g avena en copos", "10g miel", "½ plátano (60g)", "Agua o leche desnatada 150ml"],
      prep: "Avena en microondas 2 min con leche. Añade miel y plátano en rodajas. Toma 60-90 min antes de entrenar.",
      macros: { kcal: 270, prot: 8, carb: 52, fat: 3 }, tupper: true },
    { name: "Yogur + fruta + avena + miel (pre-entreno suave)", emoji: "🍊",
      ingredients: ["200g yogurt griego 0%", "150g fruta de temporada", "30g avena en copos", "10g miel"],
      prep: "Mezcla todo en tupper la noche anterior. Carbos de absorción mixta — perfectos 60-90 min antes del entreno.",
      macros: { kcal: 350, prot: 20, carb: 56, fat: 2 }, tupper: true },
    { name: "Galletas de avena caseras", emoji: "🍪",
      ingredients: ["50g avena", "1 huevo entero", "1 plátano maduro (100g)", "Canela, cacao puro opcional"],
      prep: "Aplasta el plátano, mezcla todo. Forma galletas. Horno 180° 12 min. Prepara el domingo en batch.",
      macros: { kcal: 295, prot: 10, carb: 48, fat: 6 }, tupper: true },
    { name: "Batido de mango + chía + whey", emoji: "🥭",
      ingredients: ["30g whey proteína", "100g mango", "10g semillas de chía", "200ml agua o leche desnatada"],
      prep: "Bate todo. Deja 5 min reposar para que la chía absorba. Hidratante y con omega-3 extra.",
      macros: { kcal: 285, prot: 28, carb: 30, fat: 6 }, tupper: false },
    { name: "Protein pancakes pre-entreno", emoji: "🥞",
      ingredients: ["40g avena", "150g cottage 0%", "2 claras de huevo", "Extracto de vainilla, canela"],
      prep: "Bate todo hasta homogéneo. Cocina en sartén 3-4 min por lado. Prepara el día anterior y recalienta.",
      macros: { kcal: 330, prot: 30, carb: 36, fat: 5 }, tupper: true },
    { name: "Batido whey + plátano + leche (post-entreno)", emoji: "💪",
      ingredients: ["25g whey proteína", "1 plátano mediano (120g)", "200ml leche desnatada"],
      prep: "Bate o agita. El plátano aporta carbos rápidos para reponer glucógeno. Tomar en los primeros 30 min.",
      macros: { kcal: 320, prot: 30, carb: 42, fat: 3 }, tupper: false },
    { name: "Plátano + whey", emoji: "🍌",
      ingredients: ["30g whey proteína", "1 plátano (120g)"],
      prep: "Batido o por separado. Ideal 30-45 min antes de entrenar para carbos rápidos.",
      macros: { kcal: 235, prot: 26, carb: 30, fat: 1 }, tupper: false },
    { name: "Yogur griego + miel + plátano + almendras", emoji: "🍯",
      ingredients: ["200g yogurt griego 0%", "10g miel", "1 plátano pequeño (100g)", "15g almendras"],
      prep: "Mezcla en bol. Toma 60-90 min antes del entreno. Combina proteína, carbos y grasas para un pre-entreno completo.",
      macros: { kcal: 340, prot: 22, carb: 46, fat: 6 }, tupper: true },
    { name: "Sándwich integral + pollo + aguacate", emoji: "🥪",
      ingredients: ["2 rebanadas pan integral (70g)", "80g pechuga de pollo en lonchas", "40g aguacate", "Mostaza, tomate, sal"],
      prep: "Monta el sándwich con todos los ingredientes. Las grasas del aguacate alargan la energía durante el entreno.",
      macros: { kcal: 370, prot: 28, carb: 34, fat: 12 }, tupper: false },
    { name: "Tortitas de arroz + cacahuete + plátano + whey", emoji: "🥜",
      ingredients: ["3 tortitas de arroz (27g)", "25g crema de cacahuete", "1 plátano pequeño (100g)", "20g whey en 100ml agua"],
      prep: "Tortitas con crema de cacahuete. Plátano al lado. Batido de whey. Snack pre-entreno completo y rápido.",
      macros: { kcal: 370, prot: 22, carb: 48, fat: 10 }, tupper: false },
  ],
};


// ─── RECIPE INDEX FOR PROMPT ─────────────────────────────────
// Compact lookup: category → [{name, kcal, prot}]
const RECIPE_INDEX = {
  "desayunos": [
    {
      "name": "Tortilla de claras + avena",
      "kcal": 375,
      "prot": 39,
      "tupper": false
    },
    {
      "name": "Yogurt griego + avena + plátano",
      "kcal": 365,
      "prot": 22,
      "tupper": true
    },
    {
      "name": "Tostadas centeno + huevos revueltos",
      "kcal": 385,
      "prot": 27,
      "tupper": false
    },
    {
      "name": "Batido proteico + avena",
      "kcal": 385,
      "prot": 43,
      "tupper": true
    },
    {
      "name": "Overnight oats completo",
      "kcal": 395,
      "prot": 21,
      "tupper": true
    },
    {
      "name": "Tostada centeno + aguacate + salmón ahumado",
      "kcal": 370,
      "prot": 26,
      "tupper": false
    },
    {
      "name": "Protein pancakes de cottage",
      "kcal": 380,
      "prot": 36,
      "tupper": true
    },
    {
      "name": "Skyr + granola sin azúcar + arándanos",
      "kcal": 355,
      "prot": 26,
      "tupper": true
    },
    {
      "name": "Sándwich proteico de huevo y jamón",
      "kcal": 390,
      "prot": 30,
      "tupper": false
    },
    {
      "name": "Mug cake proteico",
      "kcal": 365,
      "prot": 34,
      "tupper": false
    },
    {
      "name": "Tortilla + jamón + queso fresco",
      "kcal": 375,
      "prot": 36,
      "tupper": false
    },
    {
      "name": "Batido verde proteico",
      "kcal": 360,
      "prot": 32,
      "tupper": true
    },
    {
      "name": "Bowl de requesón + aguacate + huevo",
      "kcal": 420,
      "prot": 30,
      "tupper": true
    },
    {
      "name": "Huevos al horno en tomate",
      "kcal": 370,
      "prot": 22,
      "tupper": false
    },
    {
      "name": "Gachas de arroz proteicas",
      "kcal": 370,
      "prot": 30,
      "tupper": true
    },
    {
      "name": "Requesón + miel + nueces",
      "kcal": 370,
      "prot": 28,
      "tupper": true
    },
    {
      "name": "Yogur griego + avena + arándanos",
      "kcal": 380,
      "prot": 24,
      "tupper": true
    },
    {
      "name": "Avena con mantequilla de cacahuete + plátano",
      "kcal": 540,
      "prot": 20,
      "tupper": true
    },
    {
      "name": "Wrap de huevos + jamón + queso",
      "kcal": 510,
      "prot": 38,
      "tupper": false
    },
    {
      "name": "Bowl de quinoa + huevo + aguacate",
      "kcal": 560,
      "prot": 28,
      "tupper": false
    },
    {
      "name": "Tostadas francesas proteicas + fruta",
      "kcal": 490,
      "prot": 32,
      "tupper": false
    },
    {
      "name": "Batido hipercalórico de recuperación",
      "kcal": 620,
      "prot": 42,
      "tupper": false
    },
    {
      "name": "Gofres proteicos con plátano",
      "kcal": 490,
      "prot": 30,
      "tupper": false
    }
  ],
  "almuerzos": [
    {
      "name": "Pollo + arroz basmati + brócoli",
      "kcal": 520,
      "prot": 52,
      "tupper": true
    },
    {
      "name": "Pollo al curry + arroz integral",
      "kcal": 510,
      "prot": 47,
      "tupper": true
    },
    {
      "name": "Salmón al horno + boniato + espinacas",
      "kcal": 520,
      "prot": 42,
      "tupper": true
    },
    {
      "name": "Ternera magra + quinoa + espinacas",
      "kcal": 530,
      "prot": 48,
      "tupper": true
    },
    {
      "name": "Pollo teriyaki + arroz + edamame",
      "kcal": 530,
      "prot": 50,
      "tupper": true
    },
    {
      "name": "Pollo al limón + patata + brócoli",
      "kcal": 510,
      "prot": 44,
      "tupper": true
    },
    {
      "name": "Bowl de pollo asado + boniato + aguacate",
      "kcal": 540,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Carne picada + patata cocida + espinacas",
      "kcal": 540,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Ternera magra + arroz + zanahoria",
      "kcal": 500,
      "prot": 44,
      "tupper": true
    },
    {
      "name": "Pollo tikka masala + arroz basmati",
      "kcal": 520,
      "prot": 50,
      "tupper": true
    },
    {
      "name": "Pollo con champiñones al ajillo + patata",
      "kcal": 510,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Pollo marroquí (chermoula) + cuscús",
      "kcal": 515,
      "prot": 48,
      "tupper": true
    },
    {
      "name": "Hamburguesa de ternera + boniato chips",
      "kcal": 530,
      "prot": 44,
      "tupper": true
    },
    {
      "name": "Berenjena rellena de carne picada",
      "kcal": 570,
      "prot": 48,
      "tupper": true
    },
    {
      "name": "Wok de ternera + brócoli + arroz",
      "kcal": 510,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Pasta integral + pollo + pesto + parmesano",
      "kcal": 680,
      "prot": 54,
      "tupper": true
    },
    {
      "name": "Ternera + arroz + aguacate + huevo frito",
      "kcal": 710,
      "prot": 54,
      "tupper": false
    },
    {
      "name": "Bowl de salmón + arroz + edamame + aguacate",
      "kcal": 720,
      "prot": 52,
      "tupper": true
    },
    {
      "name": "Pollo + boniato grande + frutos secos",
      "kcal": 690,
      "prot": 52,
      "tupper": true
    },
    {
      "name": "Estofado de ternera + patata + pan centeno",
      "kcal": 650,
      "prot": 46,
      "tupper": true
    }
  ],
  "cenas": [
    {
      "name": "Pollo + verduras asadas al horno",
      "kcal": 400,
      "prot": 48,
      "tupper": true
    },
    {
      "name": "Salmón al horno + calabacín",
      "kcal": 415,
      "prot": 40,
      "tupper": true
    },
    {
      "name": "Tortilla de claras + espinacas + champiñones",
      "kcal": 390,
      "prot": 41,
      "tupper": false
    },
    {
      "name": "Pollo + ensalada grande + huevos duros",
      "kcal": 440,
      "prot": 54,
      "tupper": true
    },
    {
      "name": "Ternera + calabacín y champiñones salteados",
      "kcal": 410,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Crema de calabaza + huevo poché + pan centeno",
      "kcal": 480,
      "prot": 24,
      "tupper": false
    },
    {
      "name": "Salmón al vapor con jengibre + brócoli",
      "kcal": 410,
      "prot": 40,
      "tupper": true
    },
    {
      "name": "Rollitos de lechuga con carne + arroz jazmín",
      "kcal": 490,
      "prot": 46,
      "tupper": false
    },
    {
      "name": "Pollo en salsa de mostaza + calabacín",
      "kcal": 405,
      "prot": 52,
      "tupper": true
    },
    {
      "name": "Tortilla española proteica",
      "kcal": 430,
      "prot": 38,
      "tupper": true
    },
    {
      "name": "Pollo al ajillo + espárragos trigueros",
      "kcal": 390,
      "prot": 50,
      "tupper": true
    },
    {
      "name": "Sopa de pollo con fideos",
      "kcal": 390,
      "prot": 42,
      "tupper": true
    },
    {
      "name": "Revuelto de claras + gambas + espárragos + patata",
      "kcal": 490,
      "prot": 48,
      "tupper": false
    },
    {
      "name": "Pollo con berenjena al horno",
      "kcal": 400,
      "prot": 50,
      "tupper": true
    },
    {
      "name": "Ternera + champiñones + crema de coliflor",
      "kcal": 410,
      "prot": 48,
      "tupper": true
    },
    {
      "name": "Pollo al pesto + calabacín a la plancha",
      "kcal": 420,
      "prot": 50,
      "tupper": true
    },
    {
      "name": "Ternera magra + espárragos + AOVE",
      "kcal": 400,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Pollo + ensalada + aguacate",
      "kcal": 430,
      "prot": 46,
      "tupper": true
    },
    {
      "name": "Salmón al horno + patata + ensalada AOVE",
      "kcal": 540,
      "prot": 44,
      "tupper": false
    },
    {
      "name": "Pollo al horno + boniato + guacamole",
      "kcal": 560,
      "prot": 50,
      "tupper": true
    },
    {
      "name": "Ternera + arroz basmati + brócoli + AOVE",
      "kcal": 530,
      "prot": 48,
      "tupper": true
    },
    {
      "name": "Tortilla española + ensalada + pan centeno",
      "kcal": 520,
      "prot": 36,
      "tupper": false
    },
    {
      "name": "Pasta integral + ternera + salsa de tomate",
      "kcal": 550,
      "prot": 44,
      "tupper": true
    }
  ],
  "media_manana": [
    {
      "name": "Skyr + frutos rojos + granola + almendras",
      "kcal": 310,
      "prot": 24,
      "tupper": true
    },
    {
      "name": "Huevos duros + aguacate + tomate",
      "kcal": 250,
      "prot": 16,
      "tupper": true
    },
    {
      "name": "Tortilla de claras + pavo + queso",
      "kcal": 220,
      "prot": 30,
      "tupper": true
    },
    {
      "name": "Jamón ibérico + manzana",
      "kcal": 175,
      "prot": 14,
      "tupper": false
    },
    {
      "name": "Smoothie proteico express",
      "kcal": 165,
      "prot": 22,
      "tupper": false
    },
    {
      "name": "Queso fresco + pepino + nueces + tomate",
      "kcal": 270,
      "prot": 18,
      "tupper": true
    },
    {
      "name": "Pollo frío + tortitas de arroz + mostaza",
      "kcal": 250,
      "prot": 32,
      "tupper": true
    },
    {
      "name": "Mix de nueces + arándanos secos",
      "kcal": 180,
      "prot": 4,
      "tupper": false
    },
    {
      "name": "Café proteico (protein latte)",
      "kcal": 160,
      "prot": 22,
      "tupper": false
    },
    {
      "name": "Zanahoria + hummus de yogur + almendras",
      "kcal": 270,
      "prot": 16,
      "tupper": true
    },
    {
      "name": "Yogurt griego + nueces",
      "kcal": 200,
      "prot": 16,
      "tupper": true
    },
    {
      "name": "Requesón + fresas + avena + miel",
      "kcal": 250,
      "prot": 18,
      "tupper": true
    },
    {
      "name": "Jamón serrano + pan integral",
      "kcal": 175,
      "prot": 16,
      "tupper": false
    },
    {
      "name": "2 huevos cocidos + mandarina",
      "kcal": 190,
      "prot": 14,
      "tupper": true
    },
    {
      "name": "Almendras + manzana",
      "kcal": 195,
      "prot": 5,
      "tupper": false
    },
    {
      "name": "Tostada + mantequilla de cacahuete + plátano",
      "kcal": 430,
      "prot": 14,
      "tupper": false
    },
    {
      "name": "Batido de plátano + avena + almendras",
      "kcal": 460,
      "prot": 32,
      "tupper": false
    },
    {
      "name": "Yogur + granola + fruta + nueces",
      "kcal": 380,
      "prot": 20,
      "tupper": true
    },
    {
      "name": "Pan integral + aguacate + huevo duro",
      "kcal": 410,
      "prot": 22,
      "tupper": false
    }
  ],
  "pre_entreno": [
    {
      "name": "Arroz blanco + pollo + soja",
      "kcal": 380,
      "prot": 38,
      "tupper": true
    },
    {
      "name": "Boniato cocido + pollo frío",
      "kcal": 360,
      "prot": 32,
      "tupper": true
    },
    {
      "name": "Tostada integral + miel + requesón",
      "kcal": 310,
      "prot": 16,
      "tupper": false
    },
    {
      "name": "Batido tropical pre-entreno",
      "kcal": 280,
      "prot": 26,
      "tupper": false
    },
    {
      "name": "Dátiles + almendras + whey disuelto",
      "kcal": 290,
      "prot": 18,
      "tupper": false
    },
    {
      "name": "Bowl mini de avena + miel + plátano",
      "kcal": 270,
      "prot": 8,
      "tupper": true
    },
    {
      "name": "Yogur + fruta + avena + miel (pre-entreno suave)",
      "kcal": 350,
      "prot": 20,
      "tupper": true
    },
    {
      "name": "Galletas de avena caseras",
      "kcal": 295,
      "prot": 10,
      "tupper": true
    },
    {
      "name": "Batido de mango + chía + whey",
      "kcal": 285,
      "prot": 28,
      "tupper": false
    },
    {
      "name": "Protein pancakes pre-entreno",
      "kcal": 330,
      "prot": 30,
      "tupper": true
    },
    {
      "name": "Batido whey + plátano + leche (post-entreno)",
      "kcal": 320,
      "prot": 30,
      "tupper": false
    },
    {
      "name": "Plátano + whey",
      "kcal": 235,
      "prot": 26,
      "tupper": false
    },
    {
      "name": "Yogur griego + miel + plátano + almendras",
      "kcal": 340,
      "prot": 22,
      "tupper": true
    },
    {
      "name": "Sándwich integral + pollo + aguacate",
      "kcal": 370,
      "prot": 28,
      "tupper": false
    },
    {
      "name": "Tortitas de arroz + cacahuete + plátano + whey",
      "kcal": 370,
      "prot": 22,
      "tupper": false
    }
  ]
};

const TRAINING_EXAMPLES = {
  push: [
    "Press banca 4×8", "Press inclinado mancuernas 3×10",
    "Aperturas 3×12", "Press militar 4×8",
    "Extensión tríceps polea 3×12", "Fondos lastrados 3×10"
  ],
  pierna: [
    "Sentadilla búlgara 4×10 cada pierna", "Peso muerto rumano 4×8",
    "Hip thrust con barra 4×12", "Curl femoral tumbado 3×12",
    "Abducción de cadera en máquina 3×15", "Zancadas con mancuernas 3×12"
  ],
  pull: [
    "Dominadas lastradas 4×6", "Remo barra 4×8",
    "Jalón al pecho 3×10", "Remo mancuerna 3×10",
    "Curl bíceps barra 3×12", "Face pull 3×15"
  ],
  fullbody: [
    "Sentadilla 4×8", "Peso muerto rumano 3×10",
    "Press banca 3×10", "Remo barra 3×10",
    "Zancadas 3×12", "Plancha 3×45s"
  ],
  running_suave: [
    "Rodaje suave 45–60min, Z2 (conversacional)",
    "FC objetivo: 130–145bpm", "Cadencia: 175–180spm",
    "Termina con 5min de vuelta a la calma andando"
  ],
  running_series: [
    "Calentamiento 15min suave",
    "Series: 6×800m con 2min descanso entre series",
    "Ritmo series: 10–15s/km más rápido que ritmo medio maratón",
    "Vuelta a la calma 10min"
  ],
  running_largo: [
    "Long run: 18–25km a ritmo muy cómodo (Z2)",
    "FC nunca por encima de 155bpm",
    "Llevar gel cada 45min a partir del km 12",
    "Hidratación: 500ml/hora en clima frío, más si hace calor"
  ],
};

// ─── MAIN APP ─────────────────────────────────────────────────
export default function App() {
  const [step, setStep] = useLocalStorage("forma_step", "setup");
  // Safety: if stuck in "generating" on load, recover
  useEffect(() => {
    if (step === "generating") setStep("setup");
  }, []);
  const [profile, setProfile] = useLocalStorage("forma_profile", DEFAULT_PROFILE);
  const [weekConfig, setWeekConfig] = useLocalStorage("forma_weekconfig", {
    days: DAYS.map(d => ({
      day: d, gym: "", running: "", freeDinner: false, notes: "",
    }))
  });
  const [result, setResult] = useLocalStorage("forma_result", null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [regenerating, setRegenerating] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [shopList, setShopList] = useLocalStorage("forma_shoplist", null);
  const [showShop, setShowShop] = useState(false);

  function updateDay(i, field, val) {
    setWeekConfig(prev => {
      const days = [...prev.days];
      days[i] = { ...days[i], [field]: val };
      return { ...prev, days };
    });
  }

  function buildPrompt(config, prof) {
    const dayLines = config.days.map((d, i) => {
      const parts = [];
      if (d.gym) {
        const gymLabels = { push: "PUSH (pecho/hombros/tríceps)", pull: "PULL (espalda/bíceps)", pierna: "PIERNA (glúteo e isquios)", fullbody: "FULL BODY" };
        parts.push(`Gym: ${gymLabels[d.gym] || d.gym.toUpperCase()}`);
      }
      if (d.running) parts.push(`Running: ${d.running}`);
      if (d.freeDinner) parts.push(`Cena libre (fuera)`);
      if (d.notes) parts.push(`Nota: ${d.notes}`);
      const activity = parts.length ? parts.join(" | ") : "Descanso activo";
      let kcal = prof.targetKcal;
      if (d.gym && d.running) kcal += 200;
      else if (d.running === "largo") kcal += 300;
      else if (!d.gym && !d.running) kcal -= 150;
      if (d.freeDinner) kcal += 100;
      return `${DAY_FULL[i]} (${activity}): objetivo ~${kcal}kcal`;
    }).join("\n");

    const restrictText = prof.restrictions?.length ? `\nRestricciones: ${prof.restrictions.join(", ")}` : "";
    const dislikeText = prof.dislikes ? `\nNo le gusta: ${prof.dislikes}` : "";
    const protText = prof.favoriteProteins?.length ? `\nProteínas favoritas: ${prof.favoriteProteins.join(", ")}` : "";

    return `Eres un nutricionista y entrenador personal experto. Genera un plan semanal completo de comidas y entrenamientos.

PERFIL:
- Nombre: ${prof.name || "Usuario"}
- Peso: ${prof.weight}kg, Altura: ${prof.height}cm, Edad: ${prof.age}, Sexo: ${prof.sex === "H" ? "Hombre" : "Mujer"}
${prof.bodyfat ? `- % Grasa corporal: ${prof.bodyfat}%` : ""}
- TDEE: ${prof.tdee}kcal
- Objetivo diario base: ${prof.targetKcal}kcal (déficit de ~${prof.tdee - prof.targetKcal}kcal)
- Objetivo: corte agresivo manteniendo masa muscular y rendimiento en running${restrictText}${dislikeText}${protText}

SEMANA:
${dayLines}

CATÁLOGO DE RECETAS (★=tupper friendly, elige SOLO de esta lista):
Desayunos: ${RECIPE_INDEX.desayunos.map(r => `${r.tupper?"★":""}${r.name} (${r.kcal}kcal,${r.prot}P)`).join(" | ")}
Media mañana: ${RECIPE_INDEX.media_manana.map(r => `${r.tupper?"★":""}${r.name} (${r.kcal}kcal,${r.prot}P)`).join(" | ")}
Almuerzos: ${RECIPE_INDEX.almuerzos.map(r => `${r.tupper?"★":""}${r.name} (${r.kcal}kcal,${r.prot}P)`).join(" | ")}
Pre-entreno: ${RECIPE_INDEX.pre_entreno.map(r => `${r.tupper?"★":""}${r.name} (${r.kcal}kcal,${r.prot}P)`).join(" | ")}
Cenas: ${RECIPE_INDEX.cenas.map(r => `${r.tupper?"★":""}${r.name} (${r.kcal}kcal,${r.prot}P)`).join(" | ")}

REGLAS IMPORTANTES:
- Prioriza recetas con tupper:true para almuerzos y cenas — facilitan el batch cooking
- BATCH COOKING: reutiliza ingredientes principales en días consecutivos. Ej: si el lunes hay pollo+brócoli, el martes puede tener pollo+quinoa (mismo pollo, distinta receta). Planifica para que se cocine brócoli para 2-3 días, no uno solo.
- Los días de running largo: +200-300kcal extra en carbos (almuerzo más grande)
- Los días de gym+running: pre-entreno siempre presente y con carbos
- Los días de descanso: sin pre-entreno, cena más ligera
- Si hay cena libre: usa "Cena libre (fuera)" como nombre
- Siempre mínimo 180g de proteína total diaria
- Varía las recetas pero comparte ingredientes base entre días para minimizar compra

Genera SOLO nombres y macros, SIN ingredientes ni preparación:
{"dias":[
  {"dia":"Lunes","kcal_objetivo":2031,"kcal_total":2050,"prot_total":185,
   "entrenamiento":{"tipo":"PUSH","duracion":"60 min","ejercicios":["Press banca 4×8 — 90s","Press militar 4×8 — 90s","Aperturas 3×12 — 60s","Extensión tríceps 3×12 — 60s"],"nota":"Consejo breve"},
   "comidas":{"desayuno":{"nombre":"Avena con whey y plátano","kcal":490,"prot":42},"media_m":{"nombre":"Skyr con granola","kcal":310,"prot":24},"almuerzo":{"nombre":"Pollo con arroz y brócoli","kcal":540,"prot":50},"pre":{"nombre":"Plátano con batido whey","kcal":320,"prot":30},"cena":{"nombre":"Salmón al horno con patata","kcal":540,"prot":44}}}
]}

Los ingredientes y preparación NO van aquí — se cargan después bajo demanda.
Responde ÚNICAMENTE con el JSON. Sin markdown, sin explicaciones, sin backticks.`;
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setStep("generating");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 55000); // 55s timeout
    try {
      const prompt = buildPrompt(weekConfig, profile);
      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 3000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      clearTimeout(timeout);
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      // Try to extract JSON even if surrounded by text
      const match = clean.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Respuesta sin JSON válido");
      const parsed = JSON.parse(match[0]);
      if (!parsed.dias?.length) throw new Error("Plan vacío");
      setResult(parsed.dias);
      setStep("result");
      setSelectedDay(0);
    } catch (e) {
      clearTimeout(timeout);
      const msg = e.name === "AbortError"
        ? "La generación tardó demasiado. Inténtalo de nuevo."
        : "Error: " + (e.message || "Comprueba la conexión.");
      setError(msg);
      setStep("setup");
    } finally {
      setLoading(false);
    }
  }

  async function regenerateSlot(dayIdx, slot) {
    setRegenerating({ dayIdx, slot });
    const day = weekConfig.days[dayIdx];
    const currentMeal = result[dayIdx]?.comidas?.[slot];
    const slotLabel = MEAL_SLOTS.find(s => s.key === slot)?.label || slot;
    try {
      const prompt = `Sugiere UNA alternativa para ${slotLabel} del ${DAY_FULL[dayIdx]}.
Actividad del día: ${day.gym || ""} ${day.running || ""} ${day.freeDinner ? "cena libre" : ""}
Receta actual (cambiar por algo distinto): ${currentMeal?.nombre || "ninguna"}
Rango calórico: ${MEAL_SLOTS.find(s => s.key === slot)?.kcal}kcal
Proteína mínima: 20g

Ejemplos disponibles: ${({"desayuno":"desayunos","media_m":"media_manana","almuerzo":"almuerzos","pre":"pre_entreno","cena":"cenas"}[slot] ? RECIPE_INDEX[{"desayuno":"desayunos","media_m":"media_manana","almuerzo":"almuerzos","pre":"pre_entreno","cena":"cenas"}[slot]].map(r => r.name).join(" | ") : "")}

Responde SOLO con este JSON sin texto extra:
{"nombre":"...","kcal":450,"prot":35,"ingredientes":["..."],"prep":"..."}`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 600,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const newMeal = JSON.parse(clean);
      setResult(prev => {
        const next = [...prev];
        next[dayIdx] = { ...next[dayIdx], comidas: { ...next[dayIdx].comidas, [slot]: newMeal } };
        return next;
      });
    } catch (e) {
      // silently fail
    } finally {
      setRegenerating(null);
    }
  }


  async function generateShopList() {
    if (!result) return;
    setLoading(true);
    try {
      // Collect all ingredients from the plan
      const allIngredients = [];
      result.forEach((day, i) => {
        Object.entries(day.comidas || {}).forEach(([slot, meal]) => {
          if (meal?.ingredientes) {
            meal.ingredientes.forEach(ing => allIngredients.push(ing));
          }
        });
      });
      const prompt = `Tengo estos ingredientes de mi plan semanal de comidas:
${[...new Set(allIngredients)].join("\n")}

Consolida esta lista de la compra eliminando duplicados y sumando cantidades cuando sea posible.
Agrúpalos en categorías: Proteínas, Lácteos, Carbohidratos, Frutas y Verduras, Frutos Secos, Condimentos y Extras.
Para cada item indica la cantidad total estimada para la semana.

Responde SOLO con este JSON sin texto adicional:
{
  "categorias": [
    {
      "nombre": "Proteínas",
      "items": [{"nombre": "Pechuga de pollo", "cantidad": "1.2 kg"}, ...]
    }
  ]
}`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      const text = data.content?.find(b => b.type === "text")?.text || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setShopList(parsed.categorias);
      setShowShop(true);
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  if (showProfile) return <ProfileView profile={profile} setProfile={setProfile} onClose={() => setShowProfile(false)}/>;
  if (showShop && shopList) return <ShopView shopList={shopList} onClose={() => setShowShop(false)}/>;
  if (step === "setup") return <SetupView config={weekConfig} setConfig={setWeekConfig} updateDay={updateDay} onGenerate={generate} loading={loading} error={error} profile={profile} onEditProfile={() => setShowProfile(true)}/>;
  if (step === "generating") return <LoadingView />;
  if (step === "result") return <ResultView result={result} config={weekConfig} selectedDay={selectedDay} setSelectedDay={setSelectedDay} onRegenerate={regenerateSlot} regenerating={regenerating} onBack={() => setStep("setup")} onShop={generateShopList} loading={loading}
    onMealDetailLoaded={(dayIdx, slotKey, detail) => {
      setResult(prev => {
        const next = [...prev];
        next[dayIdx] = { ...next[dayIdx], comidas: { ...next[dayIdx].comidas, [slotKey]: { ...next[dayIdx].comidas[slotKey], ...detail } } };
        return next;
      });
    }}
  />;
  return null;
}


// ─── TRAINING PEAKS IMPORT ────────────────────────────────────
function TPImport({ config, setConfig, updateDay }) {
  const [mode, setMode] = useState(null); // null | "paste" | "ical" | "loading" | "done"
  const [rawText, setRawText] = useState("");
  const [parsed, setParsed] = useState(null);
  const fileRef = useRef(null);
  const imageRef = useRef(null);

  async function compressImage(file, maxWidth = 1600) {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.85).split(",")[1]);
      };
      img.src = url;
    });
  }

  async function parseImage(file) {
    setMode("loading");
    try {
      const base64 = await compressImage(file);

      const prompt = `Esta es una captura del calendario de TrainingPeaks. Analiza las sesiones de entrenamiento de la semana visible y extrae la información.

Para cada día de la semana (lunes a domingo), identifica:
- Si hay sesión de gym/fuerza: tipo (push=pecho/hombros/tríceps, pull=espalda/bíceps, fullbody=piernas+todo o fuerza general)
- Si hay running: tipo (suave=Z1-Z2 o recuperación o easy, series=intervalos/tempo/fartlek, largo=long run >14km o >1h15min)
- Notas relevantes (TSS, duración, nombre de la sesión)

Si el nombre dice "fuerza", "strength", "gym", "push", "pull", clasifícalo como gym.
Si dice "run", "correr", "rodaje", "Z2", "series", "fartlek", "tempo", clasifícalo como running.

Responde SOLO con este JSON (7 días siempre, en orden lunes→domingo):
[
  {"dia": "LUN", "gym": "fullbody", "running": "", "notas": "fuerza clásica 1 - 50min"},
  {"dia": "MAR", "gym": "", "running": "series", "notas": "cambios 432 - 55min - 65 TSS"},
  ...
]

gym puede ser: "push", "pull", "pierna", "fullbody" o ""
running puede ser: "suave", "series", "largo" o ""
Si no hay sesión ese día, gym y running son "".`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 800,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64 } },
              { type: "text", text: prompt }
            ]
          }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message || JSON.stringify(data.error));
      const txt = data.content?.find(b => b.type === "text")?.text || "";
      const clean = txt.replace(/```json|```/g, "").trim();
      const days = JSON.parse(clean);
      setParsed(days);
      setMode("done");
    } catch(e) {
      console.error("parseImage error:", e);
      setMode(null);
      alert("Error: " + (e.message || "No se pudo leer la imagen. Intenta con el modo texto."));
    }
  }

  async function parseWithClaude(text, sourceType) {
    setMode("loading");
    try {
      const prompt = `Analiza este texto que contiene sesiones de entrenamiento de una semana y clasifícalas.

TEXTO:
${text.slice(0, 4000)}

Para cada día de la semana (lunes a domingo), identifica:
- gym: "push" (pecho/hombros/tríceps), "pull" (espalda/bíceps), "pierna" (glúteo, isquios, sentadilla búlgara, hip thrust, peso muerto rumano), "fullbody" (fuerza general combinada) o "" si no hay gym
- running: "suave" (Z1-Z2, easy, recovery, rodaje), "series" (intervals, tempo, fartlek, cambios, threshold), "largo" (long run, salida larga, >14km, >1h15min) o "" si no hay running

Devuelve ÚNICAMENTE este array JSON con exactamente 7 elementos, sin texto antes ni después, sin markdown:
[{"dia":"LUN","gym":"","running":"","notas":""},{"dia":"MAR","gym":"","running":"","notas":""},{"dia":"MIÉ","gym":"","running":"","notas":""},{"dia":"JUE","gym":"","running":"","notas":""},{"dia":"VIE","gym":"","running":"","notas":""},{"dia":"SÁB","gym":"","running":"","notas":""},{"dia":"DOM","gym":"","running":"","notas":""}]`;

      const res = await fetch("/api/claude", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error("API: " + (data.error.message || JSON.stringify(data.error)));
      const txt = data.content?.find(b => b.type === "text")?.text || "";
      // Try to extract JSON array even if there's surrounding text
      const match = txt.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("Respuesta no contiene JSON válido: " + txt.slice(0, 100));
      const days = JSON.parse(match[0]);
      if (!Array.isArray(days) || days.length === 0) throw new Error("JSON vacío o formato incorrecto");
      setParsed(days);
      setMode("done");
    } catch(e) {
      console.error("parseWithClaude error:", e);
      setMode("paste");
      alert("Error al analizar: " + e.message);
    }
  }

  function applyParsed() {
    if (!parsed) return;
    // Do a single setConfig update for all days at once
    setConfig(prev => {
      const days = prev.days.map((day, i) => {
        const p = parsed[i];
        if (!p) return day;
        return {
          ...day,
          gym: p.gym || "",
          running: p.running || "",
          notes: p.notas || day.notes,
        };
      });
      return { ...prev, days };
    });
    setMode(null);
    setRawText("");
    setParsed(null);
  }

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setRawText(ev.target.result);
      parseWithClaude(ev.target.result, "ical");
    };
    reader.readAsText(file);
  }

  const dayColors2 = { push: "#1a5c8a", pull: "#3a7d5a", pierna: "#8e24aa", fullbody: "#c47a1a", suave: "#6aaa82", series: "#e05a20", largo: "#8e24aa" };

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>IMPORTAR DE TRAINING PEAKS</div>

      {mode === null && (
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setMode("image")}
            style={{ flex: 1, padding: "12px 10px", background: C.accent + "18", border: `2px solid ${C.accent}40`,
              borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>📸</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>Captura</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Foto del calendario</div>
          </button>
          <button onClick={() => setMode("paste")}
            style={{ flex: 1, padding: "12px 10px", background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>📋</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Pegar texto</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Copia tu semana</div>
          </button>
          <button onClick={() => setMode("manual")}
            style={{ flex: 1, padding: "12px 10px", background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 10, cursor: "pointer", fontFamily: "inherit" }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>✏️</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>Manual</div>
            <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>Configurar tú mismo</div>
          </button>
        </div>
      )}

      {mode === "ical" && (
        <div style={{ background: C.card, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.6 }}>
            En TrainingPeaks: <strong>Calendar → Export → iCal</strong> y sube el archivo aquí.
          </div>
          <input ref={fileRef} type="file" accept=".ics,.ical" onChange={handleFile} style={{ display: "none" }}/>
          <button onClick={() => fileRef.current?.click()}
            style={{ width: "100%", padding: "12px 0", background: C.accent, color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Seleccionar archivo .ics
          </button>
          <button onClick={() => setMode(null)}
            style={{ width: "100%", marginTop: 8, padding: "8px 0", background: "none",
              border: "none", fontSize: 12, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
        </div>
      )}

      {mode === "image" && (
        <div style={{ background: C.card, borderRadius: 10, padding: 16, border: `1px solid ${C.accent}40` }}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 12, lineHeight: 1.6 }}>
            Haz una captura de pantalla de tu semana en TrainingPeaks y súbela aquí. La IA leerá las sesiones automáticamente.
          </div>
          <input ref={imageRef} type="file" accept="image/*" onChange={e => { if (e.target.files?.[0]) parseImage(e.target.files[0]); }} style={{ display: "none" }}/>
          <button onClick={() => imageRef.current?.click()}
            style={{ width: "100%", padding: "14px 0", background: C.accent, color: "#fff",
              border: "none", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
            📸 Seleccionar captura
          </button>
          <div style={{ fontSize: 10, color: C.muted, textAlign: "center", marginTop: 8 }}>
            JPG, PNG o captura directa del móvil
          </div>
          <button onClick={() => setMode(null)}
            style={{ width: "100%", marginTop: 6, padding: "8px 0", background: "none",
              border: "none", fontSize: 12, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
            Cancelar
          </button>
        </div>
      )}

      {mode === "paste" && (
        <div style={{ background: C.card, borderRadius: 10, padding: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 10, lineHeight: 1.6 }}>
            Copia el texto de tu semana en TrainingPeaks (la vista semanal o los nombres de cada sesión) y pégalo aquí:
          </div>
          <textarea value={rawText} onChange={e => setRawText(e.target.value)}
            placeholder="Ej: Lunes - Run Z2 1h / Martes - Strength Push / Miércoles - Threshold 45min..."
            rows={6}
            style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
              padding: "10px 12px", fontSize: 12, fontFamily: "inherit", color: C.text,
              resize: "vertical", boxSizing: "border-box" }}/>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button onClick={() => parseWithClaude(rawText, "paste")} disabled={!rawText.trim()}
              style={{ flex: 1, padding: "10px 0", background: rawText.trim() ? C.accent : C.border,
                color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: rawText.trim() ? "pointer" : "default", fontFamily: "inherit" }}>
              Analizar con IA →
            </button>
            <button onClick={() => setMode(null)}
              style={{ padding: "10px 14px", background: "none", border: `1px solid ${C.border}`,
                borderRadius: 8, fontSize: 12, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
              Cancelar
            </button>
          </div>
        </div>
      )}

      {mode === "loading" && (
        <div style={{ background: C.card, borderRadius: 10, padding: 24, border: `1px solid ${C.border}`,
          textAlign: "center" }}>
          <div style={{ fontSize: 13, color: C.sub, fontStyle: "italic" }}>Leyendo tu plan de entrenamiento...</div>
        </div>
      )}

      {mode === "done" && parsed && (
        <div style={{ background: C.card, borderRadius: 10, padding: 16, border: `1px solid ${C.accent}40` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: C.accent, letterSpacing: 2 }}>PLAN DETECTADO — edita si algo está mal</div>
          </div>
          {parsed.map((d, i) => {
            const gymOpts = ["", "push", "pull", "pierna", "fullbody"];
            const runOpts = ["", "suave", "series", "largo"];
            return (
              <div key={i} style={{ padding: "10px 0", borderBottom: i < 6 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, minWidth: 28 }}>{d.dia}</span>
                  {d.notas && <span style={{ fontSize: 9, color: C.muted, fontStyle: "italic", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.notas.slice(0, 40)}</span>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {/* Gym selector */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {gymOpts.map(opt => (
                      <button key={opt} onClick={() => setParsed(prev => prev.map((x, j) => j === i ? { ...x, gym: opt } : x))}
                        style={{ fontSize: 9, padding: "3px 8px", borderRadius: 8, cursor: "pointer",
                          fontFamily: "inherit", border: `1px solid ${d.gym === opt ? (dayColors2[opt] || C.muted) : C.border}`,
                          background: d.gym === opt ? (dayColors2[opt] || C.muted) + "20" : C.bg,
                          color: d.gym === opt ? (dayColors2[opt] || C.muted) : C.muted,
                          fontWeight: d.gym === opt ? 700 : 400 }}>
                        {opt === "" ? "sin gym" : opt}
                      </button>
                    ))}
                  </div>
                  {/* Running selector */}
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {runOpts.map(opt => (
                      <button key={opt} onClick={() => setParsed(prev => prev.map((x, j) => j === i ? { ...x, running: opt } : x))}
                        style={{ fontSize: 9, padding: "3px 8px", borderRadius: 8, cursor: "pointer",
                          fontFamily: "inherit", border: `1px solid ${d.running === opt ? (dayColors2[opt] || C.muted) : C.border}`,
                          background: d.running === opt ? (dayColors2[opt] || C.muted) + "20" : C.bg,
                          color: d.running === opt ? (dayColors2[opt] || C.muted) : C.muted,
                          fontWeight: d.running === opt ? 700 : 400 }}>
                        {opt === "" ? "sin run" : opt}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <button onClick={applyParsed}
              style={{ flex: 1, padding: "10px 0", background: C.accent, color: "#fff",
                border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Aplicar a la semana ✓
            </button>
            <button onClick={() => { setMode(null); setParsed(null); }}
              style={{ padding: "10px 14px", background: "none", border: `1px solid ${C.border}`,
                borderRadius: 8, fontSize: 12, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PROFILE VIEW ─────────────────────────────────────────────
function ProfileView({ profile, setProfile, onClose }) {
  const [local, setLocal] = useState({ ...profile });
  function set(k, v) { setLocal(p => ({ ...p, [k]: v })); }
  function toggleRestriction(id) {
    const cur = local.restrictions || [];
    set("restrictions", cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]);
  }
  function toggleProtein(p) {
    const cur = local.favoriteProteins || [];
    set("favoriteProteins", cur.includes(p) ? cur.filter(x => x !== p) : [...cur, p]);
  }
  function save() { setProfile(local); onClose(); }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.text, paddingBottom: 40 }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={onClose}
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.sub, fontFamily: "inherit" }}>
          ← Volver
        </button>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, flex: 1, textAlign: "center" }}>Tu perfil</span>
        <button onClick={save}
          style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8,
            padding: "7px 14px", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "inherit" }}>
          Guardar
        </button>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "24px 20px" }}>
        {/* Name */}
        <Section label="NOMBRE">
          <input value={local.name} onChange={e => set("name", e.target.value)} placeholder="Tu nombre"
            style={inputSt}/>
        </Section>

        {/* Body metrics */}
        <Section label="DATOS FÍSICOS">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["Peso (kg)","weight"],["Altura (cm)","height"],["Edad","age"],["% Grasa (opcional)","bodyfat"]].map(([l,k]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>{l}</div>
                <input type="number" value={local[k]} onChange={e => set(k, e.target.value)} style={inputSt}/>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 10, color: C.sub, marginBottom: 6 }}>Sexo</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["H","Hombre"],["M","Mujer"]].map(([v,l]) => (
                <button key={v} onClick={() => set("sex", v)}
                  style={{ flex: 1, padding: "9px 0", borderRadius: 8, fontFamily: "inherit", fontSize: 13,
                    border: `1px solid ${local.sex === v ? C.accent : C.border}`,
                    background: local.sex === v ? C.accent + "18" : C.bg,
                    color: local.sex === v ? C.accent : C.sub,
                    cursor: "pointer", fontWeight: local.sex === v ? 600 : 400 }}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </Section>

        {/* Calories */}
        <Section label="CALORÍAS">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["TDEE (kcal)","tdee"],["Objetivo diario","targetKcal"]].map(([l,k]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: C.sub, marginBottom: 4 }}>{l}</div>
                <input type="number" value={local[k]} onChange={e => set(k, +e.target.value)} style={inputSt}/>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontStyle: "italic" }}>
            Déficit: −{(local.tdee || 0) - (local.targetKcal || 0)} kcal/día
          </div>
        </Section>

        {/* Restrictions */}
        <Section label="RESTRICCIONES ALIMENTARIAS">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {RESTRICTION_OPTIONS.map(r => (
              <button key={r.id} onClick={() => toggleRestriction(r.id)}
                style={{ padding: "7px 14px", borderRadius: 20, fontFamily: "inherit", fontSize: 12,
                  border: `1px solid ${(local.restrictions||[]).includes(r.id) ? C.accent : C.border}`,
                  background: (local.restrictions||[]).includes(r.id) ? C.accent + "18" : C.bg,
                  color: (local.restrictions||[]).includes(r.id) ? C.accent : C.sub,
                  cursor: "pointer", fontWeight: (local.restrictions||[]).includes(r.id) ? 600 : 400 }}>
                {r.label}
              </button>
            ))}
          </div>
        </Section>

        {/* Favorite proteins */}
        <Section label="PROTEÍNAS FAVORITAS">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {PROTEIN_OPTIONS.map(p => (
              <button key={p} onClick={() => toggleProtein(p)}
                style={{ padding: "7px 14px", borderRadius: 20, fontFamily: "inherit", fontSize: 12,
                  border: `1px solid ${(local.favoriteProteins||[]).includes(p) ? C.orange : C.border}`,
                  background: (local.favoriteProteins||[]).includes(p) ? C.orange + "18" : C.bg,
                  color: (local.favoriteProteins||[]).includes(p) ? C.orange : C.sub,
                  cursor: "pointer", fontWeight: (local.favoriteProteins||[]).includes(p) ? 600 : 400 }}>
                {p}
              </button>
            ))}
          </div>
        </Section>

        {/* Dislikes */}
        <Section label="NO ME GUSTA / ALERGIAS">
          <textarea value={local.dislikes} onChange={e => set("dislikes", e.target.value)}
            placeholder="ej. pimientos, judías verdes, pescado azul..."
            rows={2}
            style={{ ...inputSt, resize: "none" }}/>
        </Section>

        <button onClick={save}
          style={{ width: "100%", marginTop: 8, padding: "14px 0", background: C.accent, color: "#fff",
            border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
          Guardar perfil
        </button>
      </div>
    </div>
  );
}

// ─── SHOP VIEW ────────────────────────────────────────────────
function ShopView({ shopList, onClose }) {
  const [checked, setChecked] = useState({});
  function toggle(key) { setChecked(p => ({ ...p, [key]: !p[key] })); }
  const total = shopList.reduce((s, c) => s + c.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  const catColors = {
    "Proteínas": "#1a5c8a", "Lácteos": "#8e24aa", "Carbohidratos": "#c47a1a",
    "Frutas y Verduras": "#3a7d5a", "Frutos Secos": "#bf6b00", "Condimentos y Extras": "#6b6660"
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.text, paddingBottom: 40 }}>
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "14px 20px",
        display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 10 }}>
        <button onClick={onClose}
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.sub, fontFamily: "inherit" }}>
          ← Volver
        </button>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, flex: 1, textAlign: "center" }}>Lista de compra</span>
        <span style={{ fontSize: 12, color: C.muted }}>{done}/{total}</span>
      </div>

      {/* Progress */}
      <div style={{ height: 3, background: C.border }}>
        <div style={{ height: 3, background: C.accent, width: `${(done/total)*100}%`, transition: "width 0.3s" }}/>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto", padding: "20px 16px" }}>
        {shopList.map(cat => {
          const catColor = catColors[cat.nombre] || C.muted;
          const catDone = cat.items.filter((_, j) => checked[`${cat.nombre}-${j}`]).length;
          return (
            <div key={cat.nombre} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
                marginBottom: 8, paddingBottom: 6, borderBottom: `2px solid ${catColor}30` }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: catColor, letterSpacing: 1.5 }}>
                  {cat.nombre.toUpperCase()}
                </span>
                <span style={{ fontSize: 10, color: C.muted }}>{catDone}/{cat.items.length}</span>
              </div>
              {cat.items.map((item, j) => {
                const key = `${cat.nombre}-${j}`;
                const done = !!checked[key];
                return (
                  <button key={j} onClick={() => toggle(key)}
                    style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "10px 0",
                      background: "none", border: "none", borderBottom: `1px solid ${C.border}`,
                      cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${done ? catColor : C.border}`,
                      background: done ? catColor : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                    </div>
                    <span style={{ flex: 1, fontSize: 14, color: done ? C.muted : C.text,
                      textDecoration: done ? "line-through" : "none" }}>
                      {item.nombre}
                    </span>
                    <span style={{ fontSize: 12, color: C.muted, fontStyle: "italic" }}>{item.cantidad}</span>
                  </button>
                );
              })}
            </div>
          );
        })}

        {done === total && total > 0 && (
          <div style={{ textAlign: "center", padding: 24, fontSize: 14, color: C.accent, fontStyle: "italic" }}>
            ✓ Lista completa — ¡a cocinar!
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SHARED UI ────────────────────────────────────────────────
const inputSt = {
  width: "100%", background: "#f0ede6", border: "1px solid #ddd8ce",
  borderRadius: 8, padding: "9px 12px", fontSize: 13,
  fontFamily: "'DM Sans', sans-serif", color: "#1c1c1a", boxSizing: "border-box"
};

function Section({ label, children }) {
  return (
    <div style={{ background: "#faf8f4", borderRadius: 12, padding: 16, marginBottom: 12, border: "1px solid #ddd8ce" }}>
      <div style={{ fontSize: 9, color: "#a09890", letterSpacing: 2, marginBottom: 12 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── SETUP VIEW ───────────────────────────────────────────────
function SetupView({ config, setConfig, updateDay, onGenerate, loading, error, profile, onEditProfile }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const gymOptions = [
    { val: "",         label: "— Sin gym" },
    { val: "push",     label: "💪 Push" },
    { val: "pull",     label: "🏋️ Pull" },
    { val: "pierna",   label: "🦵 Pierna / Glúteo" },
    { val: "fullbody", label: "🔥 Full Body" },
  ];
  const runOptions = [
    { val: "",        label: "— Sin running" },
    { val: "suave",   label: "🏃 Suave / Z2" },
    { val: "series",  label: "⚡ Series" },
    { val: "largo",   label: "🌅 Largo" },
  ];

  const dayColors = { push: C.blue, pull: C.accent, pierna: "#8e24aa", fullbody: C.orange, suave: "#6aaa82", series: "#e05a20", largo: "#8e24aa" };

  function getDayBadges(d) {
    const b = [];
    if (d.gym) b.push({ label: d.gym.toUpperCase(), color: dayColors[d.gym] });
    if (d.running) b.push({ label: d.running, color: dayColors[d.running] });
    if (d.freeDinner) b.push({ label: "cena libre", color: C.orange });
    return b;
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.text, paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, fontWeight: 400, letterSpacing: -0.5, color: C.text }}>FORMA</span>
          <span style={{ fontSize: 11, color: C.muted, letterSpacing: 2 }}>PLANIFICADOR SEMANAL</span>
        </div>
      </div>

      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px 20px" }}>
        {/* Profile summary */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16, marginBottom: 16, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 8 }}>TU PERFIL</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{profile.name || "Sin nombre"}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>
                {profile.weight}kg · {profile.height}cm · {profile.age} años
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.accent }}>{profile.tdee}</span>
                  <span style={{ fontSize: 10, color: C.muted }}> TDEE</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{profile.targetKcal}</span>
                  <span style={{ fontSize: 10, color: C.muted }}> objetivo</span>
                </div>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.orange }}>−{profile.tdee - profile.targetKcal}</span>
                  <span style={{ fontSize: 10, color: C.muted }}> déficit</span>
                </div>
              </div>
              {profile.restrictions?.length > 0 && (
                <div style={{ display: "flex", gap: 4, marginTop: 8, flexWrap: "wrap" }}>
                  {profile.restrictions.map(r => (
                    <span key={r} style={{ fontSize: 9, background: C.accent + "18", color: C.accent, padding: "2px 7px", borderRadius: 10 }}>
                      {RESTRICTION_OPTIONS.find(x => x.id === r)?.label || r}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button onClick={onEditProfile}
              style={{ fontSize: 11, background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
                padding: "6px 12px", cursor: "pointer", color: C.sub, fontFamily: "inherit", flexShrink: 0 }}>
              Editar
            </button>
          </div>
        </div>

        {/* TrainingPeaks import */}
        <TPImport config={config} setConfig={setConfig} updateDay={updateDay} />


        {/* Day config */}
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>CONFIGURA TU SEMANA</div>
        {config.days.map((d, i) => (
          <div key={d.day} style={{ background: C.card, borderRadius: 12, marginBottom: 8, border: `1px solid ${expandedDay === i ? C.accent : C.border}`, overflow: "hidden", transition: "border-color 0.2s" }}>
            <button onClick={() => setExpandedDay(expandedDay === i ? null : i)}
              style={{ width: "100%", background: "none", border: "none", padding: "14px 18px",
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, minWidth: 32 }}>{d.day}</span>
              <span style={{ fontSize: 13, color: C.text, flex: 1 }}>{DAY_FULL[i]}</span>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {getDayBadges(d).map(b => (
                  <span key={b.label} style={{ fontSize: 9, fontWeight: 700, background: b.color + "20",
                    color: b.color, padding: "2px 8px", borderRadius: 10, border: `1px solid ${b.color}30` }}>
                    {b.label}
                  </span>
                ))}
                {getDayBadges(d).length === 0 && <span style={{ fontSize: 10, color: C.muted }}>Descanso</span>}
              </div>
              <span style={{ color: C.muted, fontSize: 10 }}>{expandedDay === i ? "▲" : "▼"}</span>
            </button>

            {expandedDay === i && (
              <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
                  {/* Gym selector */}
                  <div>
                    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 8 }}>GYM</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {gymOptions.map(opt => (
                        <button key={opt.val} onClick={() => updateDay(i, "gym", opt.val)}
                          style={{ padding: "8px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer",
                            fontFamily: "inherit", fontSize: 12, transition: "all 0.12s",
                            background: d.gym === opt.val ? (dayColors[opt.val] || C.accent) + "18" : C.bg,
                            border: `1px solid ${d.gym === opt.val ? (dayColors[opt.val] || C.accent) : C.border}`,
                            color: d.gym === opt.val ? (dayColors[opt.val] || C.accent) : C.sub,
                            fontWeight: d.gym === opt.val ? 600 : 400 }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Running selector */}
                  <div>
                    <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 8 }}>RUNNING</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {runOptions.map(opt => (
                        <button key={opt.val} onClick={() => updateDay(i, "running", opt.val)}
                          style={{ padding: "8px 12px", borderRadius: 8, textAlign: "left", cursor: "pointer",
                            fontFamily: "inherit", fontSize: 12, transition: "all 0.12s",
                            background: d.running === opt.val ? (dayColors[opt.val] || C.accent) + "18" : C.bg,
                            border: `1px solid ${d.running === opt.val ? (dayColors[opt.val] || C.accent) : C.border}`,
                            color: d.running === opt.val ? (dayColors[opt.val] || C.accent) : C.sub,
                            fontWeight: d.running === opt.val ? 600 : 400 }}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {/* Free dinner toggle */}
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => updateDay(i, "freeDinner", !d.freeDinner)}
                    style={{ width: 36, height: 20, borderRadius: 10,
                      background: d.freeDinner ? C.orange : C.border,
                      border: "none", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                    <div style={{ position: "absolute", top: 2, left: d.freeDinner ? 18 : 2,
                      width: 16, height: 16, borderRadius: "50%", background: "#fff",
                      transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}/>
                  </button>
                  <span style={{ fontSize: 12, color: d.freeDinner ? C.orange : C.sub }}>Cena libre (fuera)</span>
                </div>
                {/* Notes */}
                <div style={{ marginTop: 12 }}>
                  <input value={d.notes} onChange={e => updateDay(i, "notes", e.target.value)}
                    placeholder="Notas adicionales (ej. doble sesión, viaje...)"
                    style={{ width: "100%", background: C.bg, border: `1px solid ${C.border}`, borderRadius: 8,
                      padding: "8px 12px", fontSize: 12, fontFamily: "inherit", color: C.text, boxSizing: "border-box" }}/>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Weekly summary */}
        <div style={{ background: C.card, borderRadius: 12, padding: 16, marginTop: 16, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>RESUMEN DE LA SEMANA</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { l: "Días gym", v: config.days.filter(d => d.gym).length },
              { l: "Días running", v: config.days.filter(d => d.running).length },
              { l: "Cenas libres", v: config.days.filter(d => d.freeDinner).length },
              { l: "Días descanso", v: config.days.filter(d => !d.gym && !d.running).length },
            ].map(x => (
              <div key={x.l}>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.accent }}>{x.v}</div>
                <div style={{ fontSize: 10, color: C.muted }}>{x.l}</div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div style={{ background: "#fff0f0", border: `1px solid ${C.red}40`, borderRadius: 8, padding: 12, marginTop: 16, fontSize: 13, color: C.red }}>
            {error}
          </div>
        )}

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
          <button onClick={() => {
              setConfig({ days: DAYS.map(d => ({ day: d, gym: "", running: "", freeDinner: false, notes: "" })) });
            }}
            style={{ padding: "16px 18px", background: "none", border: `1px solid ${C.border}`,
              borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: "pointer",
              fontFamily: "inherit", color: C.sub, whiteSpace: "nowrap" }}>
            Limpiar semana
          </button>
          <button onClick={onGenerate}
            style={{ flex: 1, padding: "16px 0", background: C.accent,
              color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700,
              cursor: "pointer", fontFamily: "inherit", letterSpacing: 0.5, boxShadow: `0 4px 20px ${C.accent}40` }}>
            Generar plan semanal →
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LOADING VIEW ─────────────────────────────────────────────
function LoadingView() {
  const [msg, setMsg] = useState(0);
  const msgs = [
    "Analizando tu semana...",
    "Eligiendo las mejores recetas...",
    "Calculando macros por día...",
    "Ajustando las cargas de entreno...",
    "Casi listo...",
  ];
  useEffect(() => {
    const t = setInterval(() => setMsg(m => (m + 1) % msgs.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ background: C.bg, minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: C.accent, marginBottom: 24,
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "pulse 1.5s ease-in-out infinite" }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
          <path d="M12 2a10 10 0 100 20A10 10 0 0012 2z" opacity="0.3"/>
          <path d="M12 2a10 10 0 0110 10"/>
        </svg>
      </div>
      <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 20, color: C.text, marginBottom: 8 }}>
        Generando tu plan
      </div>
      <div style={{ fontSize: 13, color: C.muted, fontStyle: "italic" }}>{msgs[msg]}</div>
      <style>{`@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }`}</style>
    </div>
  );
}


// ─── MEAL DETAIL — loads ingredients+prep on demand ──────────

// ─── MEAL DETAIL — loads ingredients+prep on demand ──────────
const SHOP_ITEMS = [
  { name: "Pechuga de pollo", cat: "Proteínas" }, { name: "Muslo de pollo sin piel", cat: "Proteínas" },
  { name: "Ternera magra", cat: "Proteínas" }, { name: "Ternera picada magra 5%", cat: "Proteínas" },
  { name: "Salmón fresco", cat: "Proteínas" }, { name: "Salmón ahumado", cat: "Proteínas" },
  { name: "Atún al natural (bote)", cat: "Proteínas" }, { name: "Gambas peladas", cat: "Proteínas" },
  { name: "Huevos", cat: "Proteínas" }, { name: "Claras de huevo", cat: "Proteínas" },
  { name: "Jamón serrano", cat: "Proteínas" }, { name: "Proteína whey", cat: "Proteínas" },
  { name: "Requesón / Cottage 0%", cat: "Proteínas" },
  { name: "Yogurt griego 0%", cat: "Lácteos" }, { name: "Skyr natural", cat: "Lácteos" },
  { name: "Leche desnatada", cat: "Lácteos" }, { name: "Queso fresco batido 0%", cat: "Lácteos" },
  { name: "Mozzarella light", cat: "Lácteos" }, { name: "Parmesano rallado", cat: "Lácteos" },
  { name: "Avena en copos", cat: "Carbohidratos" }, { name: "Arroz basmati", cat: "Carbohidratos" },
  { name: "Arroz integral", cat: "Carbohidratos" }, { name: "Arroz blanco", cat: "Carbohidratos" },
  { name: "Quinoa", cat: "Carbohidratos" }, { name: "Patata", cat: "Carbohidratos" },
  { name: "Boniato", cat: "Carbohidratos" }, { name: "Pan de centeno", cat: "Carbohidratos" },
  { name: "Pan integral", cat: "Carbohidratos" }, { name: "Tortitas de arroz", cat: "Carbohidratos" },
  { name: "Granola sin azúcar", cat: "Carbohidratos" }, { name: "Pasta integral", cat: "Carbohidratos" },
  { name: "Brócoli", cat: "Frutas y Verduras" }, { name: "Espinacas frescas", cat: "Frutas y Verduras" },
  { name: "Calabacín", cat: "Frutas y Verduras" }, { name: "Berenjena", cat: "Frutas y Verduras" },
  { name: "Champiñones", cat: "Frutas y Verduras" }, { name: "Zanahoria", cat: "Frutas y Verduras" },
  { name: "Cebolla", cat: "Frutas y Verduras" }, { name: "Tomate cherry", cat: "Frutas y Verduras" },
  { name: "Tomate triturado (bote)", cat: "Frutas y Verduras" }, { name: "Pepino", cat: "Frutas y Verduras" },
  { name: "Lechuga", cat: "Frutas y Verduras" }, { name: "Espárragos trigueros", cat: "Frutas y Verduras" },
  { name: "Edamame (congelado)", cat: "Frutas y Verduras" }, { name: "Calabaza", cat: "Frutas y Verduras" },
  { name: "Aguacate", cat: "Frutas y Verduras" }, { name: "Plátano", cat: "Frutas y Verduras" },
  { name: "Fresas", cat: "Frutas y Verduras" }, { name: "Arándanos", cat: "Frutas y Verduras" },
  { name: "Manzana", cat: "Frutas y Verduras" }, { name: "Mandarina", cat: "Frutas y Verduras" },
  { name: "Mango", cat: "Frutas y Verduras" }, { name: "Frutos rojos (congelados)", cat: "Frutas y Verduras" },
  { name: "Almendras", cat: "Frutos Secos" }, { name: "Nueces", cat: "Frutos Secos" },
  { name: "Crema de cacahuete natural", cat: "Frutos Secos" }, { name: "Semillas de chía", cat: "Frutos Secos" },
  { name: "Aceite de oliva (AOVE)", cat: "Condimentos" }, { name: "Miel", cat: "Condimentos" },
  { name: "Mostaza de Dijon", cat: "Condimentos" }, { name: "Salsa de soja light", cat: "Condimentos" },
  { name: "Ajo (cabeza)", cat: "Condimentos" }, { name: "Jengibre fresco", cat: "Condimentos" },
  { name: "Caldo de pollo bajo en sal", cat: "Condimentos" }, { name: "Curry en polvo", cat: "Condimentos" },
  { name: "Cúrcuma", cat: "Condimentos" }, { name: "Pimentón dulce/ahumado", cat: "Condimentos" },
  { name: "Orégano seco", cat: "Condimentos" }, { name: "Sésamo", cat: "Condimentos" },
  { name: "Tahini", cat: "Condimentos" }, { name: "Espresso / café", cat: "Condimentos" },
];

// Match a raw ingredient string to a SHOP_ITEM
function matchToShopItem(rawIng) {
  const cleaned = rawIng.toLowerCase()
    .replace(/\d+[gml]+\s*/g, '').replace(/\(.*?\)/g, '')
    .replace(/^\d+\s*/, '').replace(/→.*$/, '').trim();
  const parts = cleaned.split(/[,+·]/).map(p => p.trim()).filter(p => p.length > 2);
  const stopWords = new Set(['spray','light','fresco','natural','seco','cocido','entero','cruda','puro','molido','desnatada']);
  const found = new Set();
  parts.forEach(part => {
    let match = SHOP_ITEMS.find(si => si.name.toLowerCase() === part);
    if (!match) match = SHOP_ITEMS.find(si => { const sn = si.name.toLowerCase(); return part.includes(sn) && sn.length > 4; });
    if (!match) match = SHOP_ITEMS.find(si => { const sn = si.name.toLowerCase(); return sn.includes(part) && part.length > 5; });
    if (!match) {
      const words = part.split(' ').filter(w => w.length >= 5 && !stopWords.has(w));
      match = SHOP_ITEMS.find(si => words.some(w => si.name.toLowerCase().includes(w)));
    }
    if (match) found.add(match.name);
  });
  return [...found];
}


// ─── MEAL DETAIL ──────────────────────────────────────────────
function MealDetail({ meal, slotKey, slotLabel, dayIdx, dayActivity, onRegenerate, isRegen, onDetailLoaded, hideButton }) {
  const [detail, setDetail] = useState(
    meal.ingredientes?.length ? { ingredientes: meal.ingredientes, prep: meal.prep } : null
  );

  useEffect(() => {
    if (!detail) fetchDetail();
  }, []);

  function fetchDetail() {
    const allCats = Object.values(meals).flat();
    const found = allCats.find(r => r.name === meal.nombre);
    if (found) {
      const d = { ingredientes: found.ingredients || found.ingredientes || [], prep: found.prep || "" };
      setDetail(d);
      onDetailLoaded(d);
    } else {
      setDetail({ ingredientes: [], prep: "" });
    }
  }

  if (!detail) return (
    <div style={{ padding: "12px 0", textAlign: "center", fontSize: 12, color: C.muted, fontStyle: "italic" }}>
      Cargando...
    </div>
  );

  return (
    <div style={{ padding: "0 0 4px" }}>
      {detail.ingredientes?.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 6 }}>INGREDIENTES</div>
          <div style={{ background: C.bg, borderRadius: 8, overflow: "hidden" }}>
            {detail.ingredientes.map((ing, j) => (
              <div key={j} style={{ fontSize: 12, color: C.text, padding: "7px 12px",
                borderBottom: j < detail.ingredientes.length - 1 ? `1px solid ${C.border}` : "none",
                display: "flex", gap: 8 }}>
                <span style={{ color: C.accent, fontSize: 9, marginTop: 2 }}>▸</span>{ing}
              </div>
            ))}
          </div>
        </div>
      )}
      {detail.prep && (
        <div style={{ background: C.bg, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 4 }}>PREPARACIÓN</div>
          <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.7 }}>{detail.prep}</div>
        </div>
      )}
      {!detail.ingredientes?.length && !detail.prep && (
        <div style={{ fontSize: 12, color: C.muted, fontStyle: "italic", padding: "8px 0" }}>
          Sin detalles disponibles.
        </div>
      )}
    </div>
  );
}


// ─── INLINE SHOPPING LIST ─────────────────────────────────────
function ShoppingListInline({ result }) {
  const [checked, setChecked] = useState({});

  // Build consolidated ingredient list from all meals
  const ingredientMap = {};
  result?.forEach(day => {
    Object.values(day.comidas || {}).forEach(meal => {
      if (!meal?.ingredientes) return;
      meal.ingredientes.forEach(ing => {
        // Clean ingredient string to get base item name
        const clean = ing.toLowerCase()
          .replace(/\d+[gml]+\s*/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/^\d+\s*/, '')
          .trim();
        // Group by first meaningful words
        const key = clean.split(/[,+·]/)[0].trim();
        if (key.length < 3) return;
        if (!ingredientMap[key]) ingredientMap[key] = { label: ing, count: 0, days: [] };
        ingredientMap[key].count++;
      });
    });
  });

  // Also collect from meals database for any named recipe
  const allMeals = Object.values(meals).flat();
  result?.forEach((day, di) => {
    Object.values(day.comidas || {}).forEach(meal => {
      if (!meal?.nombre) return;
      const found = allMeals.find(m => m.name === meal.nombre);
      if (found?.ingredients) {
        found.ingredients.forEach(ing => {
          const key = ing.toLowerCase().replace(/\d+[gml]+\s*/g, '').replace(/\(.*?\)/g, '').trim().split(/[,+·]/)[0].trim();
          if (key.length < 3) return;
          if (!ingredientMap[key]) ingredientMap[key] = { label: ing, count: 0, days: [] };
          ingredientMap[key].count = Math.max(ingredientMap[key].count, 1);
        });
      }
    });
  });

  // Sort by frequency (most used first = batch cooking wins)
  const items = Object.entries(ingredientMap)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([key, val]) => ({ key, label: val.label, count: val.count }));

  // Group into categories
  function getCategory(item) {
    const l = item.toLowerCase();
    if (/pollo|ternera|salmón|salmon|atún|atun|huevo|clara|whey|proteína|jamón|gambas|bacalao|pavo|requesón/.test(l)) return "🥩 Proteínas";
    if (/yogur|yogurt|leche|queso|skyr|mozzarella|parmesano|kéfir/.test(l)) return "🥛 Lácteos";
    if (/arroz|avena|patata|boniato|pan|quinoa|pasta|tortita|granola|pan|brioche/.test(l)) return "🌾 Carbohidratos";
    if (/brócoli|espinaca|calabacín|berenjena|champiñon|zanahoria|tomate|pepino|lechuga|cebolla|espárrago|coliflor|aguacate|plátano|fresa|arándano|manzana|naranja|mango|fruta|verdura/.test(l)) return "🥦 Frutas y Verduras";
    if (/almendra|nuez|nueces|cacahuete|pistacho|semilla|chía/.test(l)) return "🥜 Frutos Secos";
    return "🧂 Condimentos";
  }

  const grouped = {};
  items.forEach(item => {
    const cat = getCategory(item.label);
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  const totalItems = items.length;
  const doneCount = Object.keys(checked).length;

  return (
    <div style={{ padding: "0 8px 40px", maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 8 }}>
        <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2 }}>LISTA DE COMPRA SEMANAL</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 10, color: C.muted }}>{doneCount}/{totalItems}</span>
          {doneCount > 0 && (
            <button onClick={() => setChecked({})}
              style={{ fontSize: 10, color: C.muted, background: "none", border: `1px solid ${C.border}`,
                borderRadius: 6, padding: "2px 8px", cursor: "pointer", fontFamily: "inherit" }}>
              Resetear
            </button>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: C.border, borderRadius: 4, height: 4, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: 4, background: C.accent, width: `${totalItems ? (doneCount/totalItems)*100 : 0}%`, transition: "width 0.3s", borderRadius: 4 }}/>
      </div>

      {Object.entries(grouped).map(([cat, catItems]) => (
        <div key={cat} style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: C.sub, letterSpacing: 1,
            borderBottom: `1px solid ${C.border}`, paddingBottom: 6, marginBottom: 8 }}>
            {cat}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {catItems.map(item => {
              const done = !!checked[item.key];
              return (
                <button key={item.key} onClick={() => setChecked(p => ({ ...p, [item.key]: !p[item.key] }))}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                    background: done ? C.accent + "10" : C.card,
                    border: `1px solid ${done ? C.accent + "40" : C.border}`,
                    borderRadius: 8, cursor: "pointer", fontFamily: "inherit", textAlign: "left" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${done ? C.accent : C.border}`,
                    background: done ? C.accent : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {done && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
                  </div>
                  <div style={{ flex: 1, overflow: "hidden" }}>
                    <div style={{ fontSize: 11, color: done ? C.muted : C.text,
                      textDecoration: done ? "line-through" : "none",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.label}
                    </div>
                    {item.count > 1 && (
                      <div style={{ fontSize: 9, color: C.accent }}>× {item.count} días</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}


function ResultView({ result, config, selectedDay, setSelectedDay, onRegenerate, regenerating, onBack, onShop, loading, onMealDetailLoaded }) {
  const [activeMeal, setActiveMeal] = useState(null); // {dayIdx, slotKey}

  const SLOT_KEYS  = ["desayuno", "media_m", "almuerzo", "pre", "cena"];
  const SLOT_LABELS = { desayuno: "Desayuno", media_m: "Media mañana", almuerzo: "Almuerzo", pre: "Pre-entreno", cena: "Cena" };
  const GYM_COLOR  = { push: "#1a5c8a", pull: "#3a7d5a", pierna: "#8e24aa", fullbody: "#c47a1a" };

  if (!result?.length) return null;

  const activeDay     = activeMeal ? result[activeMeal.dayIdx]               : null;
  const activeMealObj = activeDay  ? activeDay.comidas?.[activeMeal.slotKey] : null;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", color: C.text }}>

      {/* ── STICKY HEADER ── */}
      <div style={{ background: C.card, borderBottom: `1px solid ${C.border}`, padding: "12px 16px",
        display: "flex", alignItems: "center", gap: 10, position: "sticky", top: 0, zIndex: 20 }}>
        <button onClick={onBack}
          style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
            padding: "5px 10px", cursor: "pointer", fontSize: 11, color: C.sub, fontFamily: "inherit" }}>
          ← Editar
        </button>
        <span style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, flex: 1, textAlign: "center" }}>
          Plan semanal
        </span>
<div style={{ width: 60 }}/>
      </div>

      {/* ── WEEKLY GRID ── */}
      <div style={{ overflowX: "auto", padding: "12px 8px" }}>
        <div style={{ minWidth: 560 }}>

          {/* Day headers */}
          <div style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
            <div />
            {result.map((day, i) => {
              const conf = config.days[i];
              return (
                <div key={i} style={{ textAlign: "center", padding: "4px 2px" }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: C.accent, marginBottom: 2 }}>{DAYS[i]}</div>
                  <div style={{ fontSize: 9, color: C.muted }}>{day.kcal_total || "—"}</div>
                </div>
              );
            })}
          </div>

          {/* Training row */}
          <div style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <span style={{ fontSize: 9, color: C.muted }}>Entreno</span>
            </div>
            {result.map((day, i) => {
              const conf = config.days[i];
              const tr = day?.entrenamiento;
              const gc = GYM_COLOR[conf.gym];
              const noActivity = !conf.gym && !conf.running;
              return (
                <div key={i} style={{ background: C.card, borderRadius: 6, padding: "5px 5px",
                  border: `1px solid ${conf.gym ? gc + "50" : conf.running ? C.accent + "40" : C.border}`,
                  minHeight: 36, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {conf.gym && (
                    <div style={{ fontSize: 9, fontWeight: 700, color: gc, lineHeight: 1.2 }}>
                      {conf.gym.toUpperCase()}
                    </div>
                  )}
                  {conf.running && (
                    <div style={{ fontSize: 9, color: C.accent, lineHeight: 1.2 }}>
                      Run {conf.running}
                    </div>
                  )}
                  {tr?.duracion && (
                    <div style={{ fontSize: 8, color: C.muted }}>{tr.duracion}</div>
                  )}
                  {noActivity && (
                    <div style={{ fontSize: 9, color: C.muted, textAlign: "center" }}>—</div>
                  )}
                </div>
              );
            })}
          </div>

          {/* One row per meal slot */}
          {SLOT_KEYS.map(slotKey => (
            <div key={slotKey} style={{ display: "grid", gridTemplateColumns: "72px repeat(7, 1fr)", gap: 3, marginBottom: 3 }}>
              {/* Row label */}
              <div style={{ display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: 9, color: C.muted, lineHeight: 1.2 }}>{SLOT_LABELS[slotKey]}</span>
              </div>
              {/* Each day's cell */}
              {result.map((day, i) => {
                const meal = day?.comidas?.[slotKey];
                const isActive = activeMeal?.dayIdx === i && activeMeal?.slotKey === slotKey;
                if (!meal) return (
                  <div key={i} style={{ background: C.card, borderRadius: 6, minHeight: 48,
                    border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9, color: C.muted }}>—</span>
                  </div>
                );
                return (
                  <button key={i}
                    onClick={() => setActiveMeal(isActive ? null : { dayIdx: i, slotKey })}
                    style={{ background: isActive ? C.accent + "20" : C.card,
                      border: `1px solid ${isActive ? C.accent : C.border}`,
                      borderRadius: 6, padding: "5px 5px", cursor: "pointer",
                      fontFamily: "inherit", textAlign: "left", minHeight: 48,
                      transition: "all 0.12s" }}>
                    <div style={{ fontSize: 9, fontWeight: 600, color: isActive ? C.accent : C.text,
                      lineHeight: 1.25, overflow: "hidden", marginBottom: 2,
                      display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {meal.nombre}
                    </div>
                    <div style={{ fontSize: 8, color: C.muted }}>{meal.kcal} kcal</div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── INLINE MEAL DETAIL (shown below grid when cell selected) ── */}
      {activeMeal && activeMealObj && (
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 8px 8px" }}>
          <div style={{ background: C.card, borderRadius: 10, border: `1px solid ${C.accent}40`, overflow: "hidden" }}>
            {/* Detail header */}
            <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "flex-start",
              borderBottom: `1px solid ${C.border}` }}>
              <div>
                <div style={{ fontSize: 9, color: C.muted, letterSpacing: 1.5, marginBottom: 3 }}>
                  {DAY_FULL[activeMeal.dayIdx]} · {SLOT_LABELS[activeMeal.slotKey]}
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{activeMealObj.nombre}</div>
                <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {activeMealObj.kcal} kcal · {activeMealObj.prot}g proteína
                </div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0, marginLeft: 10 }}>
                <button onClick={() => setActiveMeal(null)}
                  style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "6px 10px", fontSize: 11, color: C.muted, cursor: "pointer", fontFamily: "inherit" }}>
                  ✕
                </button>
                <button
                  onClick={() => { onRegenerate(activeMeal.dayIdx, activeMeal.slotKey); setActiveMeal(null); }}
                  disabled={regenerating?.dayIdx === activeMeal.dayIdx && regenerating?.slot === activeMeal.slotKey}
                  style={{ background: C.accent, color: "#fff", border: "none", borderRadius: 8,
                    padding: "6px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                  ↻ Cambiar
                </button>
              </div>
            </div>
            {/* Detail body */}
            <div style={{ padding: "12px 14px" }}>
              <MealDetail
                meal={activeMealObj}
                slotKey={activeMeal.slotKey}
                slotLabel={SLOT_LABELS[activeMeal.slotKey]}
                dayIdx={activeMeal.dayIdx}
                dayActivity={`${config.days[activeMeal.dayIdx]?.gym || ""} ${config.days[activeMeal.dayIdx]?.running || ""}`.trim()}
                onRegenerate={onRegenerate}
                isRegen={regenerating?.dayIdx === activeMeal.dayIdx && regenerating?.slot === activeMeal.slotKey}
                onDetailLoaded={(detail) => onMealDetailLoaded(activeMeal.dayIdx, activeMeal.slotKey, detail)}
                hideButton
              />
            </div>
          </div>
        </div>
      )}

      {/* ── INLINE SHOPPING LIST ── */}
      <ShoppingListInline result={result} />


    </div>
  );
}
