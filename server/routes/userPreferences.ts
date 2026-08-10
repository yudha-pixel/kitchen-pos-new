import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// GET /api/user/preferences - Get current user's preferences
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const profile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { preferences: true }
    }) as any;
    
    // Return preferences or default empty object
    const preferences = profile?.preferences || {};
    res.json({
      favorites: preferences.favorites || [],
      recent: preferences.recent || []
    });
  } catch (error) {
    console.error('Error fetching preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/user/preferences - Update user's preferences
router.put('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const userId = req.user.id;
    const { favorites, recent } = req.body;
    
    // Validate favorites max 6
    if (favorites && Array.isArray(favorites) && favorites.length > 6) {
      return res.status(400).json({ error: 'Maximum 6 favorites allowed' });
    }
    
    // Validate recent max 10
    if (recent && Array.isArray(recent) && recent.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 recent items allowed' });
    }
    
    // Get current preferences to merge
    const currentProfile = await prisma.profile.findUnique({
      where: { id: userId },
      select: { preferences: true }
    }) as any;
    
    const currentPreferences = currentProfile?.preferences || {};
    
    // Update with new values, preserving existing structure
    const updatedPreferences = {
      ...currentPreferences,
      favorites: favorites !== undefined ? favorites : currentPreferences.favorites || [],
      recent: recent !== undefined ? recent : currentPreferences.recent || []
    };
    
    const updated = await prisma.profile.update({
      where: { id: userId },
      data: { preferences: updatedPreferences as any }
    }) as any;
    
    const preferences = updated.preferences || {};
    res.json({
      favorites: preferences.favorites || [],
      recent: preferences.recent || []
    });
  } catch (error) {
    console.error('Error updating preferences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
