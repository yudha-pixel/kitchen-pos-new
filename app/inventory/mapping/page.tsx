'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Calculator,
  AlertTriangle,
  CheckCircle,
  PlusCircle,
} from 'lucide-react';
import { ResponsiveShell } from '@/src/components/layout/ResponsiveShell';
import { useAuth } from '@/src/context/AuthContext';
import { useToast } from '@/src/components/ui/Toast';
import { fetchProducts } from '@/src/lib/api';
import { 
  getIngredientsWithStatus, 
  addIngredient, 
  syncRecipeIngredientsToInventory,
  getRecipesForMenuItem,
  upsertRecipe,
  deleteRecipesForMenuItem,
  calculateRecipeCost,
} from '@/src/features/inventory/recipeApiService';
import { convertToSmallestUnit, getSmallestUnit } from '@/src/features/inventory/unitConversion';

interface Product {
  id: string;
  name: string;
  price: number;
  category_id?: string;
  sku?: string;
  image_url?: string;
  description?: string;
  is_active?: boolean;
}

interface RecipeItem {
  ingredient_id: string;
  ingredient_name: string;
  quantity_required: number;
  unit: string;
  unit_price: number;
}

export default function MappingPage() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productRecipes, setProductRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recipeCost, setRecipeCost] = useState(0);
  const [newRecipeItems, setNewRecipeItems] = useState<RecipeItem[]>([]);
  const [hasRunInitialSync, setHasRunInitialSync] = useState(false);

  // Load products and ingredients on mount
  useEffect(() => {
    loadData();
  }, []);

  // Load recipes when product is selected
  useEffect(() => {
    if (selectedProduct) {
      loadProductRecipes(selectedProduct.id);
    }
  }, [selectedProduct?.id]);

  // Standard recipe dictionary based on common menu items
  const STANDARD_RECIPES: Record<string, Array<{ ingredientName: string; quantity: number; unit: string }>> = {
    // Coffee
    'affogato': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'vanilla ice cream', quantity: 2, unit: 'scoop' },
      { ingredientName: 'whipped cream', quantity: 10, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'americano': [
      { ingredientName: 'espresso', quantity: 60, unit: 'ml' },
      { ingredientName: 'hot water', quantity: 150, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'caffe latte': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 200, unit: 'ml' },
      { ingredientName: 'milk foam', quantity: 10, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'cappuccino': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 120, unit: 'ml' },
      { ingredientName: 'milk foam', quantity: 30, unit: 'ml' },
      { ingredientName: 'cocoa powder', quantity: 2, unit: 'g' },
    ],
    'caramel macchiato': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'milk foam', quantity: 20, unit: 'ml' },
      { ingredientName: 'chocolate syrup', quantity: 15, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'espresso': [
      { ingredientName: 'coffee beans', quantity: 18, unit: 'g' },
      { ingredientName: 'hot water', quantity: 30, unit: 'ml' },
    ],
    'flat white': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'milk foam', quantity: 5, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'latte': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 200, unit: 'ml' },
      { ingredientName: 'milk foam', quantity: 10, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'macchiato': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 30, unit: 'ml' },
      { ingredientName: 'milk foam', quantity: 20, unit: 'ml' },
      { ingredientName: 'cocoa powder', quantity: 2, unit: 'g' },
    ],
    'mocha': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'chocolate syrup', quantity: 20, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'whipped cream', quantity: 20, unit: 'g' },
      { ingredientName: 'cocoa powder', quantity: 3, unit: 'g' },
    ],
    'nitro cold brew': [
      { ingredientName: 'coffee beans', quantity: 25, unit: 'g' },
      { ingredientName: 'cold water', quantity: 300, unit: 'ml' },
      { ingredientName: 'ice', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'vietnamese iced coffee': [
      { ingredientName: 'coffee beans', quantity: 20, unit: 'g' },
      { ingredientName: 'condensed milk', quantity: 40, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'hot water', quantity: 50, unit: 'ml' },
    ],
    'vietnamese coffee': [
      { ingredientName: 'coffee beans', quantity: 20, unit: 'g' },
      { ingredientName: 'condensed milk', quantity: 40, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'hot water', quantity: 50, unit: 'ml' },
    ],
    'vienna coffee': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'steamed milk', quantity: 100, unit: 'ml' },
      { ingredientName: 'whipped cream', quantity: 30, unit: 'g' },
      { ingredientName: 'cocoa powder', quantity: 3, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'irish coffee': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'whiskey', quantity: 30, unit: 'ml' },
      { ingredientName: 'whipped cream', quantity: 20, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    
    // Cold Coffee
    'iced americano': [
      { ingredientName: 'espresso', quantity: 60, unit: 'ml' },
      { ingredientName: 'ice', quantity: 200, unit: 'g' },
      { ingredientName: 'cold water', quantity: 100, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'iced cappuccino': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 120, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'milk foam', quantity: 30, unit: 'ml' },
      { ingredientName: 'cocoa powder', quantity: 2, unit: 'g' },
    ],
    'iced caramel macchiato': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'chocolate syrup', quantity: 15, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'iced flat white': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'iced latte': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 200, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'iced mocha': [
      { ingredientName: 'espresso', quantity: 30, unit: 'ml' },
      { ingredientName: 'chocolate syrup', quantity: 20, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'whipped cream', quantity: 20, unit: 'g' },
    ],
    'cold brew': [
      { ingredientName: 'coffee beans', quantity: 20, unit: 'g' },
      { ingredientName: 'cold water', quantity: 250, unit: 'ml' },
      { ingredientName: 'ice', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    
    // Tea
    'chai latte': [
      { ingredientName: 'black tea', quantity: 5, unit: 'g' },
      { ingredientName: 'hot water', quantity: 150, unit: 'ml' },
      { ingredientName: 'milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
      { ingredientName: 'cinnamon', quantity: 2, unit: 'g' },
    ],
    'earl grey tea': [
      { ingredientName: 'black tea', quantity: 3, unit: 'g' },
      { ingredientName: 'hot water', quantity: 250, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'iced chai latte': [
      { ingredientName: 'black tea', quantity: 5, unit: 'g' },
      { ingredientName: 'cold water', quantity: 150, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 150, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
    ],
    'iced lemon tea': [
      { ingredientName: 'black tea', quantity: 3, unit: 'g' },
      { ingredientName: 'hot water', quantity: 200, unit: 'ml' },
      { ingredientName: 'lemon juice', quantity: 30, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
    ],
    'iced peach tea': [
      { ingredientName: 'black tea', quantity: 3, unit: 'g' },
      { ingredientName: 'hot water', quantity: 200, unit: 'ml' },
      { ingredientName: 'peach syrup', quantity: 20, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'jasmine tea': [
      { ingredientName: 'jasmine tea leaves', quantity: 3, unit: 'g' },
      { ingredientName: 'hot water', quantity: 250, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    
    // Other Drinks
    'thai milk tea': [
      { ingredientName: 'black tea', quantity: 5, unit: 'g' },
      { ingredientName: 'condensed milk', quantity: 30, unit: 'ml' },
      { ingredientName: 'evaporated milk', quantity: 30, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'matcha latte': [
      { ingredientName: 'matcha powder', quantity: 3, unit: 'g' },
      { ingredientName: 'hot water', quantity: 50, unit: 'ml' },
      { ingredientName: 'milk', quantity: 200, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'iced matcha latte': [
      { ingredientName: 'matcha powder', quantity: 3, unit: 'g' },
      { ingredientName: 'cold water', quantity: 50, unit: 'ml' },
      { ingredientName: 'cold milk', quantity: 200, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'hot chocolate': [
      { ingredientName: 'cocoa powder', quantity: 20, unit: 'g' },
      { ingredientName: 'hot water', quantity: 150, unit: 'ml' },
      { ingredientName: 'milk', quantity: 100, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
      { ingredientName: 'whipped cream', quantity: 10, unit: 'g' },
    ],
    'iced espresso tonic': [
      { ingredientName: 'espresso', quantity: 60, unit: 'ml' },
      { ingredientName: 'tonic water', quantity: 150, unit: 'ml' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'coconut water': [
      { ingredientName: 'coconut water', quantity: 300, unit: 'ml' },
      { ingredientName: 'ice', quantity: 100, unit: 'g' },
    ],
    'es teh manis': [
      { ingredientName: 'black tea', quantity: 3, unit: 'g' },
      { ingredientName: 'hot water', quantity: 200, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 20, unit: 'g' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
    ],
    'jus jeruk segar': [
      { ingredientName: 'orange juice', quantity: 250, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
      { ingredientName: 'ice', quantity: 100, unit: 'g' },
    ],
    'lemonade': [
      { ingredientName: 'lemon juice', quantity: 50, unit: 'ml' },
      { ingredientName: 'water', quantity: 200, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 20, unit: 'g' },
      { ingredientName: 'ice', quantity: 150, unit: 'g' },
    ],
    
    // Main Dishes
    'ayam bakar': [
      { ingredientName: 'chicken breast', quantity: 200, unit: 'g' },
      { ingredientName: 'soy sauce', quantity: 30, unit: 'ml' },
      { ingredientName: 'garlic', quantity: 10, unit: 'g' },
      { ingredientName: 'oil', quantity: 15, unit: 'ml' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    'nasi goreng spesial': [
      { ingredientName: 'rice', quantity: 200, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
      { ingredientName: 'soy sauce', quantity: 20, unit: 'ml' },
      { ingredientName: 'vegetable oil', quantity: 15, unit: 'ml' },
      { ingredientName: 'onion', quantity: 30, unit: 'g' },
      { ingredientName: 'garlic', quantity: 5, unit: 'g' },
    ],
    'nasi goreng': [
      { ingredientName: 'rice', quantity: 200, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
      { ingredientName: 'soy sauce', quantity: 20, unit: 'ml' },
      { ingredientName: 'vegetable oil', quantity: 15, unit: 'ml' },
      { ingredientName: 'onion', quantity: 30, unit: 'g' },
      { ingredientName: 'garlic', quantity: 5, unit: 'g' },
    ],
    'spaghetti carbonara': [
      { ingredientName: 'spaghetti', quantity: 100, unit: 'g' },
      { ingredientName: 'bacon', quantity: 50, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
      { ingredientName: 'parmesan cheese', quantity: 30, unit: 'g' },
      { ingredientName: 'cream', quantity: 50, unit: 'ml' },
      { ingredientName: 'garlic', quantity: 5, unit: 'g' },
    ],
    'beef lasagna': [
      { ingredientName: 'lasagna pasta', quantity: 100, unit: 'g' },
      { ingredientName: 'beef steak', quantity: 100, unit: 'g' },
      { ingredientName: 'tomato sauce', quantity: 50, unit: 'ml' },
      { ingredientName: 'parmesan cheese', quantity: 30, unit: 'g' },
      { ingredientName: 'cream', quantity: 30, unit: 'ml' },
      { ingredientName: 'onion', quantity: 20, unit: 'g' },
    ],
    'burger cheese': [
      { ingredientName: 'beef patty', quantity: 150, unit: 'g' },
      { ingredientName: 'cheese slice', quantity: 1, unit: 'pcs' },
      { ingredientName: 'bun', quantity: 1, unit: 'pcs' },
      { ingredientName: 'vegetable oil', quantity: 10, unit: 'ml' },
      { ingredientName: 'onion', quantity: 20, unit: 'g' },
    ],
    'caesar salad': [
      { ingredientName: 'lettuce', quantity: 100, unit: 'g' },
      { ingredientName: 'chicken breast', quantity: 100, unit: 'g' },
      { ingredientName: 'parmesan cheese', quantity: 20, unit: 'g' },
      { ingredientName: 'cream', quantity: 30, unit: 'ml' },
      { ingredientName: 'croutons', quantity: 30, unit: 'g' },
    ],
    'chicken sandwich': [
      { ingredientName: 'chicken breast', quantity: 100, unit: 'g' },
      { ingredientName: 'bread', quantity: 2, unit: 'pcs' },
      { ingredientName: 'vegetable oil', quantity: 10, unit: 'ml' },
      { ingredientName: 'lettuce', quantity: 30, unit: 'g' },
      { ingredientName: 'tomato', quantity: 30, unit: 'g' },
    ],
    'fish and chips': [
      { ingredientName: 'fish fillet', quantity: 150, unit: 'g' },
      { ingredientName: 'flour', quantity: 50, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
      { ingredientName: 'oil', quantity: 100, unit: 'ml' },
      { ingredientName: 'potato', quantity: 200, unit: 'g' },
      { ingredientName: 'salt', quantity: 3, unit: 'g' },
    ],
    'mie goreng jawa': [
      { ingredientName: 'noodles', quantity: 150, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
      { ingredientName: 'soy sauce', quantity: 20, unit: 'ml' },
      { ingredientName: 'vegetable oil', quantity: 15, unit: 'ml' },
      { ingredientName: 'onion', quantity: 30, unit: 'g' },
      { ingredientName: 'garlic', quantity: 5, unit: 'g' },
    ],
    'sate ayam': [
      { ingredientName: 'chicken', quantity: 200, unit: 'g' },
      { ingredientName: 'soy sauce', quantity: 30, unit: 'ml' },
      { ingredientName: 'peanut sauce', quantity: 30, unit: 'ml' },
      { ingredientName: 'oil', quantity: 15, unit: 'ml' },
      { ingredientName: 'garlic', quantity: 10, unit: 'g' },
      { ingredientName: 'sugar', quantity: 5, unit: 'g' },
    ],
    
    // Desserts
    'banana bread': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 60, unit: 'g' },
      { ingredientName: 'butter', quantity: 50, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
      { ingredientName: 'banana', quantity: 100, unit: 'g' },
    ],
    'blueberry muffin': [
      { ingredientName: 'flour', quantity: 80, unit: 'g' },
      { ingredientName: 'sugar', quantity: 50, unit: 'g' },
      { ingredientName: 'butter', quantity: 40, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
      { ingredientName: 'blueberry', quantity: 30, unit: 'g' },
    ],
    'brownie': [
      { ingredientName: 'flour', quantity: 60, unit: 'g' },
      { ingredientName: 'sugar', quantity: 70, unit: 'g' },
      { ingredientName: 'cocoa powder', quantity: 40, unit: 'g' },
      { ingredientName: 'butter', quantity: 50, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
    ],
    'carrot cake': [
      { ingredientName: 'flour', quantity: 80, unit: 'g' },
      { ingredientName: 'sugar', quantity: 60, unit: 'g' },
      { ingredientName: 'carrot', quantity: 100, unit: 'g' },
      { ingredientName: 'butter', quantity: 50, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
    ],
    'cheesecake slice': [
      { ingredientName: 'cream cheese', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 30, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
      { ingredientName: 'butter', quantity: 20, unit: 'g' },
      { ingredientName: 'cracker', quantity: 30, unit: 'g' },
    ],
    'chocolate muffin': [
      { ingredientName: 'flour', quantity: 80, unit: 'g' },
      { ingredientName: 'sugar', quantity: 50, unit: 'g' },
      { ingredientName: 'cocoa powder', quantity: 20, unit: 'g' },
      { ingredientName: 'butter', quantity: 40, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
    ],
    'cinnamon roll': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 50, unit: 'g' },
      { ingredientName: 'butter', quantity: 40, unit: 'g' },
      { ingredientName: 'cinnamon', quantity: 5, unit: 'g' },
      { ingredientName: 'egg', quantity: 1, unit: 'pcs' },
    ],
    'croissant almond': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'butter', quantity: 60, unit: 'g' },
      { ingredientName: 'milk', quantity: 30, unit: 'ml' },
      { ingredientName: 'yeast', quantity: 3, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
      { ingredientName: 'almond', quantity: 20, unit: 'g' },
    ],
    'croissant butter': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'butter', quantity: 60, unit: 'g' },
      { ingredientName: 'milk', quantity: 30, unit: 'ml' },
      { ingredientName: 'yeast', quantity: 3, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
      { ingredientName: 'salt', quantity: 2, unit: 'g' },
    ],
    'red velvet cake': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 80, unit: 'g' },
      { ingredientName: 'cocoa powder', quantity: 10, unit: 'g' },
      { ingredientName: 'butter', quantity: 60, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
      { ingredientName: 'cream cheese', quantity: 50, unit: 'g' },
    ],
    'chocolate cake': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'sugar', quantity: 80, unit: 'g' },
      { ingredientName: 'cocoa powder', quantity: 30, unit: 'g' },
      { ingredientName: 'butter', quantity: 60, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
    ],
    'cheesecake': [
      { ingredientName: 'cream cheese', quantity: 150, unit: 'g' },
      { ingredientName: 'sugar', quantity: 50, unit: 'g' },
      { ingredientName: 'egg', quantity: 2, unit: 'pcs' },
      { ingredientName: 'butter', quantity: 30, unit: 'g' },
      { ingredientName: 'cracker', quantity: 50, unit: 'g' },
    ],
    'tiramisu': [
      { ingredientName: 'ladyfingers', quantity: 6, unit: 'pcs' },
      { ingredientName: 'mascarpone', quantity: 100, unit: 'g' },
      { ingredientName: 'espresso', quantity: 50, unit: 'ml' },
      { ingredientName: 'cocoa powder', quantity: 10, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
    ],
    
    // Bakery
    'croissant': [
      { ingredientName: 'flour', quantity: 100, unit: 'g' },
      { ingredientName: 'butter', quantity: 60, unit: 'g' },
      { ingredientName: 'milk', quantity: 30, unit: 'ml' },
      { ingredientName: 'yeast', quantity: 3, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
      { ingredientName: 'salt', quantity: 2, unit: 'g' },
    ],
    'bread': [
      { ingredientName: 'flour', quantity: 250, unit: 'g' },
      { ingredientName: 'hot water', quantity: 150, unit: 'ml' },
      { ingredientName: 'yeast', quantity: 5, unit: 'g' },
      { ingredientName: 'salt', quantity: 5, unit: 'g' },
      { ingredientName: 'sugar', quantity: 10, unit: 'g' },
    ],
  };

  const findMatchingStandardRecipe = (productName: string): Array<{ ingredientName: string; quantity: number; unit: string }> | null => {
    const lowerName = productName.toLowerCase();
    
    // Direct match
    if (STANDARD_RECIPES[lowerName]) {
      return STANDARD_RECIPES[lowerName];
    }
    
    // Partial match
    for (const [key, recipe] of Object.entries(STANDARD_RECIPES)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return recipe;
      }
    }
    
    return null;
  };

  const generateSampleRecipe = (product: Product, availableIngredients: Ingredient[]): RecipeItem[] => {
    const sampleRecipes: RecipeItem[] = [];
    
    // Try to find a standard recipe first
    const standardRecipe = findMatchingStandardRecipe(product.name);
    
    if (standardRecipe) {
      console.log('Found standard recipe for:', product.name, 'with', standardRecipe.length, 'ingredients');
      
      // Map standard recipe ingredients to available ingredients
      for (const item of standardRecipe) {
        const matchingIngredient = availableIngredients.find(
          ing => ing.name.toLowerCase() === item.ingredientName.toLowerCase() ||
                 ing.name.toLowerCase().includes(item.ingredientName.toLowerCase()) ||
                 item.ingredientName.toLowerCase().includes(ing.name.toLowerCase())
        );
        
        if (matchingIngredient) {
          sampleRecipes.push({
            ingredient_id: matchingIngredient.id,
            ingredient_name: matchingIngredient.name,
            quantity_required: item.quantity,
            unit: item.unit,
            unit_price: matchingIngredient.unit_price,
          });
          console.log(`Matched ingredient: ${item.ingredientName} -> ${matchingIngredient.name}`);
        } else {
          console.log(`No match found for: ${item.ingredientName}`);
        }
      }
      
      // If we found at least 2 ingredients from standard recipe, return it
      if (sampleRecipes.length >= 2) {
        console.log(`Successfully mapped ${sampleRecipes.length} ingredients for ${product.name}`);
        return sampleRecipes;
      }
    }
    
    // Fallback to intelligent random generation if no standard recipe found or not enough matches
    console.log('Using fallback recipe generation for:', product.name);
    const commonIngredients = availableIngredients.filter(ing => ing.current_stock > 0);
    
    if (commonIngredients.length === 0) {
      console.log('No ingredients available for fallback');
      return sampleRecipes;
    }
    
    // Ensure we have at least 3-5 ingredients
    const targetHPP = product.price * 0.35;
    const numIngredients = Math.min(Math.max(3, Math.floor(Math.random() * 3) + 3), Math.min(5, commonIngredients.length));
    const selectedIngredients = commonIngredients
      .sort(() => Math.random() - 0.5)
      .slice(0, numIngredients);
    
    const costPerIngredient = targetHPP / numIngredients;
    
    selectedIngredients.forEach((ingredient) => {
      const quantity = Math.max(0.1, costPerIngredient / ingredient.unit_price);
      sampleRecipes.push({
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        quantity_required: Math.round(quantity * 100) / 100,
        unit: ingredient.unit,
        unit_price: ingredient.unit_price,
      });
    });
    
    console.log(`Generated fallback recipe with ${sampleRecipes.length} ingredients for ${product.name}`);
    return sampleRecipes;
  };

  const assignSampleRecipesToProducts = async (products: Product[], availableIngredients: Ingredient[]) => {
    const productsWithoutRecipes: Product[] = [];
    
    // Check which products don't have recipes
    for (const product of products) {
      try {
        const recipes = await getRecipesForMenuItem(product.id);
        if (recipes.length === 0) {
          productsWithoutRecipes.push(product);
        }
      } catch (error) {
        console.error('Failed to check recipe for product:', product.id, error);
        productsWithoutRecipes.push(product);
      }
    }
    
    // Assign sample recipes to products without them
    for (const product of productsWithoutRecipes) {
      try {
        const sampleRecipe = generateSampleRecipe(product, availableIngredients);
        
        if (sampleRecipe.length > 0) {
          // Save the sample recipe
          for (const item of sampleRecipe) {
            await upsertRecipe({
              menu_item_id: product.id,
              ingredient_id: item.ingredient_id,
              quantity_required: item.quantity_required,
              unit: item.unit,
            });
          }
          console.log(`Assigned sample recipe to product: ${product.name}`);
        }
      } catch (error) {
        console.error('Failed to assign sample recipe to product:', product.id, error);
      }
    }
  };

  const seedDefaultIngredients = async () => {
    const defaultIngredients = [
      // Coffee & Espresso (prices per smallest unit: per gram/ml)
      { name: 'espresso', current_stock: 5000, unit: 'ml', min_stock: 1000, unit_price: 67 }, // Rp 2.000 per 30ml
      { name: 'coffee beans', current_stock: 5000, unit: 'g', min_stock: 1000, unit_price: 150 }, // Rp 150.000/kg
      { name: 'hot water', current_stock: 50000, unit: 'ml', min_stock: 10000, unit_price: 0 },
      { name: 'cold water', current_stock: 50000, unit: 'ml', min_stock: 10000, unit_price: 0 },
      { name: 'ice', current_stock: 10000, unit: 'g', min_stock: 2000, unit_price: 0.1 }, // Rp 100/kg
      { name: 'whiskey', current_stock: 1000, unit: 'ml', min_stock: 200, unit_price: 5 }, // Rp 5.000/L
      { name: 'tonic water', current_stock: 2000, unit: 'ml', min_stock: 500, unit_price: 0.3 }, // Rp 300/L
      
      // Dairy (prices per smallest unit: per gram/ml)
      { name: 'steamed milk', current_stock: 10000, unit: 'ml', min_stock: 2000, unit_price: 0.1 }, // Rp 100/L
      { name: 'milk foam', current_stock: 5000, unit: 'ml', min_stock: 1000, unit_price: 0.15 }, // Rp 150/L
      { name: 'cold milk', current_stock: 10000, unit: 'ml', min_stock: 2000, unit_price: 0.1 }, // Rp 100/L
      { name: 'milk', current_stock: 10000, unit: 'ml', min_stock: 2000, unit_price: 0.1 }, // Rp 100/L
      { name: 'cream', current_stock: 5000, unit: 'ml', min_stock: 1000, unit_price: 0.2 }, // Rp 200/L
      { name: 'condensed milk', current_stock: 2000, unit: 'ml', min_stock: 500, unit_price: 0.5 }, // Rp 500/L
      { name: 'evaporated milk', current_stock: 2000, unit: 'ml', min_stock: 500, unit_price: 0.4 }, // Rp 400/L
      { name: 'whipped cream', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.5 }, // Rp 500/kg
      { name: 'vanilla ice cream', current_stock: 2000, unit: 'scoop', min_stock: 500, unit_price: 2500 }, // Rp 2.500 per scoop
      { name: 'butter', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.2 }, // Rp 200/kg
      { name: 'cream cheese', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.3 }, // Rp 300/kg
      { name: 'mascarpone', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.4 }, // Rp 400/kg
      { name: 'parmesan cheese', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.5 }, // Rp 500/kg
      
      // Sweeteners & Flavorings (prices per smallest unit: per gram/ml)
      { name: 'sugar', current_stock: 5000, unit: 'g', min_stock: 1000, unit_price: 0.015 }, // Rp 15/kg
      { name: 'sugar syrup', current_stock: 1000, unit: 'ml', min_stock: 200, unit_price: 0.5 }, // Rp 500/L
      { name: 'chocolate syrup', current_stock: 1000, unit: 'ml', min_stock: 200, unit_price: 0.8 }, // Rp 800/L
      { name: 'cocoa powder', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.3 }, // Rp 300/kg
      { name: 'cinnamon', current_stock: 200, unit: 'g', min_stock: 50, unit_price: 0.5 }, // Rp 500/kg
      { name: 'lemon juice', current_stock: 1000, unit: 'ml', min_stock: 200, unit_price: 1 }, // Rp 1.000/L
      { name: 'peach syrup', current_stock: 500, unit: 'ml', min_stock: 100, unit_price: 0.8 }, // Rp 800/L
      { name: 'coconut water', current_stock: 5000, unit: 'ml', min_stock: 1000, unit_price: 0.05 }, // Rp 50/L
      { name: 'orange juice', current_stock: 3000, unit: 'ml', min_stock: 500, unit_price: 0.2 }, // Rp 200/L
      { name: 'water', current_stock: 100000, unit: 'ml', min_stock: 20000, unit_price: 0 },
      
      // Tea (prices per smallest unit: per gram)
      { name: 'black tea', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 20 }, // Rp 20.000/kg
      { name: 'matcha powder', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 40 }, // Rp 40.000/kg
      { name: 'jasmine tea leaves', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 15 }, // Rp 15.000/kg
      
      // Meat & Poultry (prices per smallest unit: per gram)
      { name: 'chicken breast', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.15 }, // Rp 150/kg
      { name: 'chicken', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.12 }, // Rp 120/kg
      { name: 'beef steak', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.4 }, // Rp 400/kg
      { name: 'beef patty', current_stock: 1500, unit: 'g', min_stock: 300, unit_price: 0.2 }, // Rp 200/kg
      { name: 'bacon', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.25 }, // Rp 250/kg
      { name: 'fish fillet', current_stock: 1500, unit: 'g', min_stock: 300, unit_price: 0.18 }, // Rp 180/kg
      
      // Baking & Grains (prices per smallest unit: per gram/ml/pcs)
      { name: 'flour', current_stock: 10000, unit: 'g', min_stock: 2000, unit_price: 0.02 }, // Rp 20/kg
      { name: 'spaghetti', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.03 }, // Rp 30/kg
      { name: 'lasagna pasta', current_stock: 1500, unit: 'g', min_stock: 300, unit_price: 0.035 }, // Rp 35/kg
      { name: 'rice', current_stock: 10000, unit: 'g', min_stock: 2000, unit_price: 0.025 }, // Rp 25/kg
      { name: 'noodles', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.03 }, // Rp 30/kg
      { name: 'yeast', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 0.1 }, // Rp 100/kg
      { name: 'salt', current_stock: 2000, unit: 'g', min_stock: 500, unit_price: 0.005 }, // Rp 5/kg
      { name: 'eggs', current_stock: 100, unit: 'pcs', min_stock: 20, unit_price: 3000 }, // Rp 3.000 per pcs
      { name: 'egg', current_stock: 100, unit: 'pcs', min_stock: 20, unit_price: 3000 }, // Rp 3.000 per pcs
      { name: 'cracker', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.05 }, // Rp 50/kg
      { name: 'ladyfingers', current_stock: 200, unit: 'pcs', min_stock: 50, unit_price: 1000 }, // Rp 1.000 per pcs
      { name: 'bread', current_stock: 50, unit: 'pcs', min_stock: 10, unit_price: 5000 }, // Rp 5.000 per pcs
      { name: 'bun', current_stock: 50, unit: 'pcs', min_stock: 10, unit_price: 3000 }, // Rp 3.000 per pcs
      { name: 'cheese slice', current_stock: 100, unit: 'pcs', min_stock: 20, unit_price: 2000 }, // Rp 2.000 per pcs
      { name: 'croutons', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 0.1 }, // Rp 100/kg
      { name: 'potato', current_stock: 5000, unit: 'g', min_stock: 1000, unit_price: 0.03 }, // Rp 30/kg
      { name: 'almond', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 0.8 }, // Rp 800/kg
      
      // Vegetables & Herbs (prices per smallest unit: per gram/ml/sprig)
      { name: 'soy sauce', current_stock: 1000, unit: 'ml', min_stock: 200, unit_price: 0.3 }, // Rp 300/L
      { name: 'garlic', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 0.05 }, // Rp 50/kg
      { name: 'oil', current_stock: 5000, unit: 'ml', min_stock: 1000, unit_price: 0.2 }, // Rp 200/L
      { name: 'vegetable oil', current_stock: 5000, unit: 'ml', min_stock: 1000, unit_price: 0.18 }, // Rp 180/L
      { name: 'onion', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.03 }, // Rp 30/kg
      { name: 'rosemary', current_stock: 100, unit: 'sprig', min_stock: 20, unit_price: 500 }, // Rp 500 per sprig
      { name: 'lettuce', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.05 }, // Rp 50/kg
      { name: 'tomato', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.04 }, // Rp 40/kg
      { name: 'tomato sauce', current_stock: 1000, unit: 'ml', min_stock: 200, unit_price: 0.3 }, // Rp 300/L
      { name: 'peanut sauce', current_stock: 500, unit: 'ml', min_stock: 100, unit_price: 0.5 }, // Rp 500/L
      
      // Fruits & Others (prices per smallest unit: per gram)
      { name: 'banana', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.05 }, // Rp 50/kg
      { name: 'blueberry', current_stock: 500, unit: 'g', min_stock: 100, unit_price: 0.5 }, // Rp 500/kg
      { name: 'carrot', current_stock: 1000, unit: 'g', min_stock: 200, unit_price: 0.03 }, // Rp 30/kg
    ];

    console.log('Seeding default ingredients...');
    
    for (const ingredient of defaultIngredients) {
      try {
        await addIngredient(ingredient);
        console.log(`Added ingredient: ${ingredient.name}`);
      } catch (error) {
        console.error(`Failed to add ingredient ${ingredient.name}:`, error);
      }
    }
    
    console.log('Default ingredients seeded successfully');
  };

  const handleSyncInventory = async () => {
    try {
      setLoading(true);
      const result = await syncRecipeIngredientsToInventory();
      
      if (result.success) {
        toast('success', `Sinkronisasi selesai: ${result.message}`);
        // Reload ingredients after sync
        const updatedIngredients = await getIngredientsWithStatus();
        setIngredients(updatedIngredients);
      } else {
        toast('error', result.message);
      }
    } catch (error) {
      console.error('Sync failed:', error);
      toast('error', 'Gagal melakukan sinkronisasi');
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [productsData, ingredientsData] = await Promise.all([
        fetchProducts() as Promise<Product[]>,
        getIngredientsWithStatus(),
      ]);
      setProducts(productsData || []);
      setIngredients(ingredientsData);
      
      // Seed default ingredients if inventory is empty
      if (ingredientsData.length === 0) {
        console.log('No ingredients found, seeding default ingredients');
        await seedDefaultIngredients();
        // Reload ingredients after seeding
        const updatedIngredients = await getIngredientsWithStatus();
        setIngredients(updatedIngredients);
      }
      
      // Run sync audit only on first load, not on refresh
      if (!hasRunInitialSync) {
        await syncRecipeIngredientsToInventory();
        setHasRunInitialSync(true);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
      toast('error', 'Gagal memuat data');
    } finally {
      setLoading(false);
    }
  };

  const loadProductRecipes = async (productId: string) => {
    try {
      const recipes = await getRecipesForMenuItem(productId);
      console.log('Loaded recipes for product:', productId, recipes);
      setProductRecipes(recipes);
      
      // Calculate recipe cost from loaded recipes with unit conversion
      let totalCost = 0;
      for (const recipe of recipes) {
        if (recipe.ingredient) {
          const converted = convertToSmallestUnit(recipe.ingredient.unit_price, recipe.unit || recipe.ingredient.unit);
          totalCost += converted.price * recipe.quantity_required;
        }
      }
      console.log('Calculated HPP:', totalCost);
      setRecipeCost(totalCost);
    } catch (error) {
      console.error('Failed to load recipes:', error);
      setProductRecipes([]);
      setRecipeCost(0);
    }
  };

  const handleOpenModal = () => {
    // Pre-populate with existing recipes if available
    if (productRecipes.length > 0) {
      const existingItems: RecipeItem[] = productRecipes.map((recipe) => {
        // Convert price to smallest unit
        const price = recipe.ingredient?.unit_price || 0;
        const unit = recipe.unit || '';
        const converted = convertToSmallestUnit(price, unit);
        
        return {
          ingredient_id: recipe.ingredient_id,
          ingredient_name: recipe.ingredient?.name || recipe.ingredient_name || '',
          quantity_required: recipe.quantity_required,
          unit: converted.unit,
          unit_price: converted.price,
        };
      });
      setNewRecipeItems(existingItems);
    } else {
      setNewRecipeItems([]);
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setNewRecipeItems([]);
  };

  const handleAddIngredient = () => {
    setNewRecipeItems([
      ...newRecipeItems,
      {
        ingredient_id: '',
        ingredient_name: '',
        quantity_required: 0,
        unit: '',
        unit_price: 0,
      },
    ]);
  };

  const handleRemoveIngredient = (index: number) => {
    setNewRecipeItems(newRecipeItems.filter((_, i) => i !== index));
  };

  const handleIngredientChange = (index: number, field: keyof RecipeItem, value: string | number) => {
    const updated = [...newRecipeItems];
    updated[index] = { ...updated[index], [field]: value };
    
    // Validate quantity - must be positive
    if (field === 'quantity_required' && typeof value === 'number') {
      if (value < 0) {
        toast('error', 'Jumlah tidak boleh negatif');
        updated[index].quantity_required = 0;
      }
    }
    
    // If ingredient is selected, validate it exists in inventory and auto-fill unit and price
    if (field === 'ingredient_id' && typeof value === 'string') {
      if (value) {
        const ingredient = ingredients.find((ing) => ing.id === value);
        if (!ingredient) {
          toast('error', 'Bahan yang dipilih tidak ditemukan di inventory. Silakan pilih bahan yang tersedia.');
          updated[index].ingredient_id = '';
          updated[index].ingredient_name = '';
          updated[index].unit = '';
          updated[index].unit_price = 0;
          setNewRecipeItems(updated);
          return;
        }
        updated[index].ingredient_name = ingredient.name;
        
        // Convert price to smallest unit
        const converted = convertToSmallestUnit(ingredient.unit_price, ingredient.unit);
        updated[index].unit = converted.unit;
        updated[index].unit_price = converted.price;
      } else {
        // Reset if no ingredient selected
        updated[index].ingredient_name = '';
        updated[index].unit = '';
        updated[index].unit_price = 0;
      }
    }
    
    setNewRecipeItems(updated);
  };

  const handleSaveRecipe = async () => {
    if (!selectedProduct) return;

    // Validate each item before filtering
    for (let i = 0; i < newRecipeItems.length; i++) {
      const item = newRecipeItems[i];
      if (item.ingredient_id && item.quantity_required <= 0) {
        toast('error', `Bahan "${item.ingredient_name}" harus memiliki jumlah lebih dari 0`);
        return;
      }
      if (!item.ingredient_id && item.quantity_required > 0) {
        toast('error', 'Pilih bahan terlebih dahulu sebelum mengisi jumlah');
        return;
      }
      // Validate that ingredient exists in inventory
      if (item.ingredient_id) {
        const ingredientExists = ingredients.find(ing => ing.id === item.ingredient_id);
        if (!ingredientExists) {
          toast('error', `Bahan "${item.ingredient_name}" tidak ditemukan di inventory. Silakan tambahkan bahan ini melalui modul Inventory (Ringkasan Stok) terlebih dahulu.`);
          return;
        }
      }
    }

    const validItems = newRecipeItems.filter(
      (item) => item.ingredient_id && item.quantity_required > 0
    );

    if (validItems.length === 0) {
      toast('error', 'Tambahkan minimal satu bahan dengan jumlah valid');
      return;
    }

    // Calculate total HPP
    const totalHPP = validItems.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity_required);
    }, 0);

    // Validation: HPP must be less than selling price
    if (totalHPP >= selectedProduct.price) {
      toast('error', `Total HPP (Rp ${totalHPP.toLocaleString('id-ID')}) tidak boleh sama atau lebih besar dari Harga Jual (Rp ${selectedProduct.price.toLocaleString('id-ID')}). Silakan kurangi jumlah bahan atau pilih bahan dengan harga lebih murah.`);
      return;
    }

    // Validation: HPP should not be too close to selling price (less than 10% margin)
    const margin = ((selectedProduct.price - totalHPP) / selectedProduct.price) * 100;
    if (margin < 10) {
      toast('warning', `Margin hanya ${margin.toFixed(1)}%. Disarankan minimal 10% margin untuk keuntungan yang wajar.`);
      // Allow save but warn user
    }

    try {
      setLoading(true);
      
      // Delete existing recipes for this product
      await deleteRecipesForMenuItem(selectedProduct.id);
      
      // Create new recipes
      for (const item of validItems) {
        await upsertRecipe({
          menu_item_id: selectedProduct.id,
          ingredient_id: item.ingredient_id,
          quantity_required: item.quantity_required,
          unit: item.unit,
        });
      }

      toast('success', 'Resep berhasil disimpan');
      handleCloseModal();
      loadProductRecipes(selectedProduct.id);
    } catch (error) {
      console.error('Failed to save recipe:', error);
      toast('error', 'Gagal menyimpan resep');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async () => {
    if (!selectedProduct) return;

    if (!confirm('Apakah Anda yakin ingin menghapus resep ini?')) return;

    try {
      setLoading(true);
      await deleteRecipesForMenuItem(selectedProduct.id);
      toast('success', 'Resep berhasil dihapus');
      loadProductRecipes(selectedProduct.id);
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      toast('error', 'Gagal menghapus resep');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const availableIngredients = ingredients.filter(
    (ing) => !newRecipeItems.some((item) => item.ingredient_id === ing.id)
  );

  // Calculate modal total cost (only for items with valid ingredient_id)
  const modalTotalCost = newRecipeItems.reduce((sum, item) => {
    if (item.ingredient_id && item.quantity_required > 0) {
      return sum + (item.unit_price * item.quantity_required);
    }
    return sum;
  }, 0);

  return (
    <ResponsiveShell title="Mapping Resep (BOM)">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Mapping Resep (Bill of Materials)</h1>
              <p className="mt-1 text-sm text-slate-500">
                Hubungkan produk menu dengan bahan baku untuk perhitungan otomatis stok dan HPP
              </p>
            </div>
            <button
              onClick={handleSyncInventory}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              Sinkronisasi Inventory
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
              <div className="p-4 border-b border-slate-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari produk..."
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:border-violet-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
                  />
                </div>
              </div>
              <div className="max-h-[600px] overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedProduct(product)}
                    className={`w-full px-4 py-3 text-left border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                      selectedProduct?.id === product.id ? 'bg-violet-50 border-l-4 border-l-violet-600' : 'border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="font-medium text-slate-900">{product.name}</div>
                    {product.sku && (
                      <div className="text-xs text-slate-500">{product.sku}</div>
                    )}
                    <div className="text-sm text-slate-600">
                      Rp {product.price.toLocaleString('id-ID')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Recipe Details */}
          <div className="lg:col-span-2">
            {selectedProduct ? (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm">
                {/* Product Header */}
                <div className="p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{selectedProduct.name}</h2>
                      {selectedProduct.sku && (
                        <p className="text-sm text-slate-500 mt-1">SKU: {selectedProduct.sku}</p>
                      )}
                      <p className="text-lg font-semibold text-slate-900 mt-2">
                        Harga Jual: Rp {selectedProduct.price.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleOpenModal}
                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                        Edit Resep
                      </button>
                      {productRecipes.length > 0 && (
                        <button
                          onClick={handleDeleteRecipe}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Hapus
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Cost Summary */}
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Calculator className="h-4 w-4" />
                        <span>Total HPP (Bahan)</span>
                      </div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">
                        Rp {recipeCost.toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="bg-slate-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Margin</span>
                      </div>
                      <div className={`text-2xl font-bold mt-1 ${
                        selectedProduct.price > recipeCost ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {selectedProduct.price > 0
                          ? (((selectedProduct.price - recipeCost) / selectedProduct.price) * 100).toFixed(1)
                          : 0}%
                      </div>
                    </div>
                  </div>

                  {selectedProduct.price <= recipeCost && (
                    <div className="mt-3 flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Peringatan: HPP melebihi atau sama dengan harga jual</span>
                    </div>
                  )}
                </div>

                {/* Recipe Items */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Bahan Baku</h3>
                  
                  {productRecipes.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <p className="text-sm">Belum ada resep yang ditambahkan</p>
                      <button
                        onClick={handleOpenModal}
                        className="mt-2 text-violet-600 hover:text-violet-700 text-sm font-medium"
                      >
                        + Tambah Resep
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-slate-200">
                            <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">Bahan</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Jumlah</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Satuan</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Harga Satuan</th>
                            <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productRecipes.map((recipe) => {
                            // Convert price to smallest unit for display and calculation
                            const converted = recipe.ingredient 
                              ? convertToSmallestUnit(recipe.ingredient.unit_price, recipe.unit || recipe.ingredient.unit)
                              : { price: 0, unit: recipe.unit || '-' };
                            const subtotal = converted.price * recipe.quantity_required;
                            
                            return (
                              <tr key={recipe.id} className="border-b border-slate-100">
                                <td className="py-3 px-4 text-sm text-slate-900">
                                  {recipe.ingredient?.name || recipe.ingredient_name || 'Unknown'}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-900 text-right">
                                  {recipe.quantity_required}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 text-right">
                                  {converted.unit}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-600 text-right">
                                  Rp {converted.price.toLocaleString('id-ID')}/{converted.unit}
                                </td>
                                <td className="py-3 px-4 text-sm text-slate-900 text-right font-medium">
                                  Rp {subtotal.toLocaleString('id-ID')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12 text-center">
                <div className="text-slate-400">
                  <Calculator className="mx-auto h-16 w-16 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900">Pilih Produk</h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Pilih produk dari daftar di sebelah kiri untuk melihat atau mengedit resep
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Recipe Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Edit Resep - {selectedProduct?.name}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                {newRecipeItems.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Belum ada bahan ditambahkan</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {newRecipeItems.map((item, index) => (
                      <div key={index} className="flex gap-3 items-start p-4 bg-slate-50 rounded-lg">
                        <div className="flex-1">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Bahan
                          </label>
                          <div className="flex gap-2">
                            <select
                              value={item.ingredient_id}
                              onChange={(e) => handleIngredientChange(index, 'ingredient_id', e.target.value)}
                              className="flex-1 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-violet-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
                            >
                              <option value="">Pilih bahan...</option>
                              {availableIngredients.map((ing) => (
                                <option key={ing.id} value={ing.id}>
                                  {ing.name} (Stok: {ing.current_stock} {ing.unit})
                                </option>
                              ))}
                            </select>
                          </div>
                          {availableIngredients.length === 0 && (
                            <div className="col-span-2 mt-2 flex items-start gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg text-xs">
                              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                              <p>
                                Tidak ada bahan tersedia. Silakan tambahkan bahan baru melalui modul <strong>Inventory (Ringkasan Stok)</strong> terlebih dahulu.
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="w-32">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Jumlah
                          </label>
                          <input
                            type="number"
                            value={item.quantity_required}
                            onChange={(e) => handleIngredientChange(index, 'quantity_required', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="w-full rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm text-slate-800 focus:border-violet-500 focus:outline-hidden focus:ring-2 focus:ring-violet-500/20"
                          />
                        </div>
                        <div className="w-24">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Satuan
                          </label>
                          <input
                            type="text"
                            value={item.unit}
                            readOnly
                            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 px-3 text-sm text-slate-600"
                          />
                        </div>
                        <div className="w-36">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Harga/{item.unit || 'unit'}
                          </label>
                          <input
                            type="text"
                            value={item.ingredient_id ? `Rp ${item.unit_price.toLocaleString('id-ID')}` : '-'}
                            readOnly
                            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 px-3 text-sm text-slate-600"
                          />
                        </div>
                        <div className="w-28">
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Subtotal
                          </label>
                          <input
                            type="text"
                            value={item.ingredient_id ? `Rp ${(item.unit_price * item.quantity_required).toLocaleString('id-ID')}` : '-'}
                            readOnly
                            className="w-full rounded-lg border border-slate-200 bg-slate-100 py-2 px-3 text-sm text-slate-900 font-medium"
                          />
                        </div>
                        <button
                          onClick={() => handleRemoveIngredient(index)}
                          className="mt-5 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-200">
                {/* HPP and Margin Display */}
                <div className="mb-4 p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calculator className="h-4 w-4" />
                      <span>Total HPP (Sementara):</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">
                      Rp {modalTotalCost.toLocaleString('id-ID')}
                    </div>
                  </div>
                  {selectedProduct && modalTotalCost > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <span>Margin:</span>
                      </div>
                      <div className={`text-lg font-bold ${
                        modalTotalCost >= selectedProduct.price 
                          ? 'text-red-600' 
                          : ((selectedProduct.price - modalTotalCost) / selectedProduct.price * 100) < 10 
                            ? 'text-orange-500' 
                            : 'text-green-600'
                      }`}>
                        {modalTotalCost >= selectedProduct.price 
                          ? 'NEGATIF!' 
                          : `${((selectedProduct.price - modalTotalCost) / selectedProduct.price * 100).toFixed(1)}%`
                        }
                      </div>
                    </div>
                  )}
                  {selectedProduct && modalTotalCost >= selectedProduct.price && (
                    <div className="mt-2 text-xs text-red-600 font-medium">
                      ⚠️ HPP melebihi harga jual! Rekapitulasi tidak dapat disimpan.
                    </div>
                  )}
                  {selectedProduct && modalTotalCost > 0 && modalTotalCost < selectedProduct.price && ((selectedProduct.price - modalTotalCost) / selectedProduct.price * 100) < 10 && (
                    <div className="mt-2 text-xs text-orange-500 font-medium">
                      ⚠️ Margin kurang dari 10%. Pertimbangkan untuk menyesuaikan resep.
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleAddIngredient}
                    className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Tambah Bahan
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveRecipe}
                      disabled={loading || newRecipeItems.length === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="h-4 w-4" />
                      Simpan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </ResponsiveShell>
  );
}
