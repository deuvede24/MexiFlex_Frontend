// config/recipe-customizations.config.ts
export interface CookingMethod {
  prep?: string;
  cooking: string;
  serving?: string;
  tips?: string[];
}

export interface RecipeTypeCustomization {
  proteins: {
    [key: string]: CookingMethod;
  };
  vegetables?: {
    [key: string]: string | CookingMethod;
    default: string;
  };
  general?: {
    preparation?: string[];
    serving?: string[];
    tips?: string[];
  };
}

export const RECIPE_CUSTOMIZATIONS: Record<string, RecipeTypeCustomization> = {
  tacos: {
    proteins: {
      'pollo': {
        prep: 'desmenuzar finamente después de cocinar',
        cooking: 'cocer en agua con ajo y cebolla, luego dorar con especias',
        serving: 'servir caliente en las tortillas',
        tips: [
          'Para más sabor, dorar ligeramente después de desmenuzar',
          'Puedes prepararlo con anticipación y recalentarlo'
        ]
      },
      'res': {
        prep: 'cortar en tiras finas o cubos pequeños',
        cooking: 'sellar a fuego alto y cocinar a término medio',
        tips: ['Marinar previamente mejora el sabor']
      },
      'pescado': {
        prep: 'cortar en trozos medianos',
        cooking: 'cocinar a la plancha con limón y especias',
        tips: ['No sobrecocinar para mantener la jugosidad']
      },
      // Añadimos las proteínas que faltaban
      'chorizo': {
        prep: 'retirar de la tripa si es necesario',
        cooking: 'dorar a fuego medio-alto hasta que esté bien cocido',
        serving: 'desmenuzar ligeramente'
      },
      'carne molida': {
        prep: 'poner la carne a cocer con un chorrito de aceite',
        cooking: 'dorar a fuego medio-alto hasta que esté bien cocida',
        serving: 'escurrir exceso de grasa y reservar'
      },
      'tofu': {
        prep: 'escurrir bien y cortar en cubos medianos',
        cooking: 'dorar en sartén con aceite hasta que esté crujiente por fuera',
        serving: 'agregar las especias al final'
      },
      'heura': {
        prep: 'descongelar si es necesario',
        cooking: 'saltear a fuego alto con especias mexicanas',
        serving: 'servir inmediatamente para mantener la textura'
      },
      'cerdo': {
        prep: 'cortar en trozos pequeños uniformes',
        cooking: 'cocinar a fuego medio-alto hasta dorar',
        serving: 'servir caliente'
      },
      // Añadimos un default para proteínas no especificadas
      'default': {
        prep: 'preparar según el tipo de proteína',
        cooking: 'cocinar hasta que esté en su punto',
        serving: 'servir caliente'
      }
    },
    vegetables: {
      default: 'cortar en juliana fina',
      'aguacate': 'cortar en cubos o preparar guacamole fresco',
      'cebolla': 'picar finamente y opcionalmente curtir en limón',
      'tomate': 'cortar en cubos pequeños, retirar semillas',
      'chile': 'cortar en cubos pequeños, retirar semillas'
    },
    general: {
      preparation: [
        'Calentar las tortillas antes de servir',
        'Preparar todas las guarniciones antes de empezar'
      ],
      serving: [
        'Servir con limones frescos',
        'Ofrecer salsas aparte'
      ]
    }
  },
  sopa: {
    proteins: {
      'pollo': {
        prep: 'cortar en cubos medianos o deshebrar',
        cooking: 'cocinar en el caldo hasta que esté tierno',
        tips: ['Cocinar con hueso aporta más sabor']
      },
      'res': {
        prep: 'cortar en cubos pequeños',
        cooking: 'sellar primero y luego cocinar en el caldo',
        tips: ['Usar cortes con grasa para más sabor']
      }
    },
    vegetables: {
      default: 'cortar en cubos uniformes',
      'cilantro': 'picar finamente para decorar al servir'
    },
    general: {
      preparation: [
        'Preparar el caldo base primero',
        'Agregar verduras según su tiempo de cocción'
      ]
    }
  }
};
