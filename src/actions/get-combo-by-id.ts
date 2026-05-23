'use server';

import { getHomepageConfig, ComboItem } from './homepage-actions';

export async function getComboById(id: string): Promise<ComboItem | null> {
    try {
        const config = await getHomepageConfig();
        const combosSection = config.sections.find(s => s.type === 'combos');
        const combo = combosSection?.combos?.find(c => c.id === id);
        return combo || null;
    } catch (e) {
        console.error("Error in getComboById", e);
        return null;
    }
}
