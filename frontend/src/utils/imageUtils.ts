/**
 * Utility functions for robust image URL handling and crop/category specific fallbacks
 */

export const getFallbackImage = (itemNameOrCategory: string = ''): string => {
  const name = (itemNameOrCategory || '').toLowerCase();
  if (name.includes('tomato')) {
    return 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('rice') || name.includes('paddy')) {
    return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('mustard')) {
    return 'https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('drip') || name.includes('equipment') || name.includes('irrigation')) {
    return 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('fertilizer') || name.includes('urea') || name.includes('dap') || name.includes('potash') || name.includes('phosphate')) {
    return 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80';
  }
  if (name.includes('pesticide') || name.includes('neem')) {
    return 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80';
  }
  return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80';
};

export const getCleanImageUrl = (rawUrl?: string, itemNameOrCategory: string = ''): string => {
  if (!rawUrl || typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return getFallbackImage(itemNameOrCategory);
  }
  
  let clean = rawUrl.trim();

  // If user pasted an Unsplash webpage URL e.g. https://unsplash.com/photos/xyz
  if (clean.includes('unsplash.com/photos/')) {
    const photoId = clean.split('unsplash.com/photos/')[1]?.split('?')[0]?.split('#')[0];
    if (photoId) {
      return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=600&q=80`;
    }
  }

  return clean;
};
