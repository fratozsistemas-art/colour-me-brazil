// Watercolor-inspired color palettes for Brazilian themes

export const THEME_PALETTES = {
  amazon: {
    name: 'Amazon Rainforest',
    colors: [
      '#1B5E20', // Deep Forest Green
      '#2E7D32', // Jungle Green
      '#388E3C', // Leaf Green
      '#66BB6A', // Light Green
      '#A5D6A7', // Pale Green
      '#795548', // Tree Bark Brown
      '#8D6E63', // Light Brown
      '#D84315', // Tropical Orange
      '#FF6F00', // Amber
      '#FFA726', // Mango Orange
      '#FFB74D', // Golden Yellow
      '#FFF176', // Pale Yellow
      '#1976D2', // River Blue
      '#42A5F5', // Sky Blue
      '#90CAF9', // Light Blue
      '#000000', // Black
      '#FFFFFF'  // White
    ]
  },
  
  culture: {
    name: 'Brazilian Culture',
    colors: [
      '#FF6B35', // Sunset Orange
      '#FF8C42', // Tropical Coral
      '#FFD23F', // Golden Mango
      '#F44336', // Carnival Red
      '#E91E63', // Pink
      '#9C27B0', // Purple
      '#3F51B5', // Indigo
      '#2E86AB', // Ocean Blue
      '#06A77D', // Tropical Teal
      '#4CAF50', // Green
      '#CDDC39', // Lime
      '#FFC107', // Amber
      '#FF9800', // Orange
      '#795548', // Brown
      '#607D8B', // Blue Grey
      '#000000', // Black
      '#FFFFFF'  // White
    ]
  },
  
  folklore: {
    name: 'Folklore & Legends',
    colors: [
      '#4A148C', // Deep Purple (mystical)
      '#6A1B9A', // Purple
      '#8E24AA', // Light Purple
      '#AB47BC', // Lavender
      '#CE93D8', // Pale Purple
      '#311B92', // Deep Indigo
      '#512DA8', // Indigo
      '#7B1FA2', // Violet
      '#C2185B', // Dark Pink
      '#E91E63', // Pink
      '#F06292', // Light Pink
      '#1976D2', // Blue
      '#42A5F5', // Sky Blue
      '#FFC107', // Gold
      '#FF6F00', // Amber
      '#000000', // Black
      '#FFFFFF'  // White
    ]
  },
  
  fauna: {
    name: 'Brazilian Wildlife',
    colors: [
      '#FF6B35', // Toucan Orange
      '#FFD23F', // Toucan Yellow
      '#000000', // Toucan Black
      '#2E86AB', // Macaw Blue
      '#06A77D', // Parrot Green
      '#F44336', // Macaw Red
      '#FFC107', // Jaguar Yellow
      '#FF9800', // Orange
      '#795548', // Capybara Brown
      '#8D6E63', // Light Brown
      '#A1887F', // Tan
      '#388E3C', // Green
      '#66BB6A', // Light Green
      '#1976D2', // Blue
      '#90CAF9', // Light Blue
      '#FFFFFF', // White
      '#000000'  // Black
    ]
  },
  
  beach: {
    name: 'Beach & Coast',
    colors: [
      '#0288D1', // Ocean Blue
      '#03A9F4', // Sky Blue
      '#4FC3F7', // Light Blue
      '#81D4FA', // Pale Blue
      '#B3E5FC', // Very Pale Blue
      '#00ACC1', // Cyan
      '#26C6DA', // Light Cyan
      '#FFD54F', // Sand Yellow
      '#FFF176', // Light Yellow
      '#FFFFFF', // White
      '#C2185B', // Beach Umbrella Pink
      '#FF6F00', // Sunset Orange
      '#FFA726', // Light Orange
      '#66BB6A', // Palm Green
      '#4CAF50', // Green
      '#795548', // Driftwood Brown
      '#000000'  // Black
    ]
  },
  
  festival: {
    name: 'Festival & Carnival',
    colors: [
      '#E91E63', // Hot Pink
      '#F06292', // Light Pink
      '#F48FB1', // Pale Pink
      '#9C27B0', // Purple
      '#BA68C8', // Light Purple
      '#FFD600', // Bright Yellow
      '#FFEA00', // Lemon Yellow
      '#FF6D00', // Deep Orange
      '#FF9100', // Orange
      '#00E676', // Neon Green
      '#76FF03', // Light Green
      '#00B0FF', // Electric Blue
      '#40C4FF', // Sky Blue
      '#FF1744', // Red
      '#FF5252', // Light Red
      '#FFFFFF', // White
      '#000000'  // Black
    ]
  },
  
  food: {
    name: 'Brazilian Cuisine',
    colors: [
      '#6D4C41', // Coffee Brown
      '#8D6E63', // Light Brown
      '#A1887F', // Tan
      '#BCAAA4', // Beige
      '#4CAF50', // Lime Green (caipirinha)
      '#8BC34A', // Light Green
      '#FFEB3B', // Yellow (banana)
      '#FDD835', // Golden Yellow
      '#FF6F00', // Orange (papaya)
      '#FF9800', // Light Orange
      '#F44336', // Red (acai)
      '#E57373', // Light Red
      '#9C27B0', // Purple (acai berry)
      '#2196F3', // Blue
      '#FFFFFF', // White (coconut)
      '#5D4037', // Dark Brown
      '#000000'  // Black
    ]
  }
};

// Map book collections to palettes
export const getBookPalette = (bookData) => {
  // If book has specific cultural tags, use those
  if (bookData.cultural_tags && bookData.cultural_tags.length > 0) {
    const tags = bookData.cultural_tags.map(t => t.toLowerCase());
    
    if (tags.some(t => t.includes('amazon') || t.includes('rainforest') || t.includes('jungle'))) {
      return THEME_PALETTES.amazon;
    }
    if (tags.some(t => t.includes('folklore') || t.includes('legend') || t.includes('myth'))) {
      return THEME_PALETTES.folklore;
    }
    if (tags.some(t => t.includes('wildlife') || t.includes('animal') || t.includes('fauna'))) {
      return THEME_PALETTES.fauna;
    }
    if (tags.some(t => t.includes('beach') || t.includes('coast') || t.includes('ocean'))) {
      return THEME_PALETTES.beach;
    }
    if (tags.some(t => t.includes('carnival') || t.includes('festival') || t.includes('celebration'))) {
      return THEME_PALETTES.festival;
    }
    if (tags.some(t => t.includes('food') || t.includes('cuisine') || t.includes('cooking'))) {
      return THEME_PALETTES.food;
    }
  }
  
  // Default based on collection
  if (bookData.collection === 'amazon') {
    return THEME_PALETTES.amazon;
  }
  
  // Default to culture palette
  return THEME_PALETTES.culture;
};

// Get all palette names for display
export const getAllPaletteNames = () => {
  return Object.keys(THEME_PALETTES).map(key => ({
    id: key,
    name: THEME_PALETTES[key].name,
    colors: THEME_PALETTES[key].colors.slice(0, 5) // Preview colors
  }));
};