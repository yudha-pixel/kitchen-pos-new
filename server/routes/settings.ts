import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/settings - Get app settings
router.get('/', async (req, res) => {
  try {
    console.log('Fetching settings from database...');
    // Get the first settings record (there should only be one)
    let settings = await prisma.appSettings.findFirst();
    console.log('Settings fetched:', settings);
    
    // If no settings exist, create default settings
    if (!settings) {
      console.log('No settings found, creating default settings...');
      settings = await prisma.appSettings.create({
        data: {
          primary_color: 'blue',
          theme_mode: 'light',
          card_style: 'rounded',
          layout_density: 'spacious',
          card_view: 'grid',
          cart_position: 'right-sidebar',
        },
      });
      console.log('Default settings created:', settings);
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// PUT /api/settings - Update app settings
router.put('/', async (req, res) => {
  try {
    const {
      primary_color,
      theme_mode,
      card_style,
      layout_density,
      card_view,
      cart_position,
    } = req.body;

    // Get the first settings record
    let settings = await prisma.appSettings.findFirst();
    
    if (settings) {
      // Update existing settings
      settings = await prisma.appSettings.update({
        where: { id: settings.id },
        data: {
          primary_color: primary_color !== undefined ? primary_color : settings.primary_color,
          theme_mode: theme_mode !== undefined ? theme_mode : settings.theme_mode,
          card_style: card_style !== undefined ? card_style : settings.card_style,
          layout_density: layout_density !== undefined ? layout_density : settings.layout_density,
          card_view: card_view !== undefined ? card_view : settings.card_view,
          cart_position: cart_position !== undefined ? cart_position : settings.cart_position,
        },
      });
    } else {
      // Create new settings
      settings = await prisma.appSettings.create({
        data: {
          primary_color: primary_color || 'blue',
          theme_mode: theme_mode || 'light',
          card_style: card_style || 'rounded',
          layout_density: layout_density || 'spacious',
          card_view: card_view || 'grid',
          cart_position: cart_position || 'right-sidebar',
        },
      });
    }
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

export default router;
