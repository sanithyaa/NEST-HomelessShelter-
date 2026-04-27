// Local database for draft storage
import localforage from 'localforage';

const DRAFT_KEY = 'profile_draft';

export const draftStore = {
  async save(data: any) {
    try {
      await localforage.setItem(DRAFT_KEY, {
        ...data,
        savedAt: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Failed to save draft:', error);
      return false;
    }
  },

  async load() {
    try {
      return await localforage.getItem(DRAFT_KEY);
    } catch (error) {
      console.error('Failed to load draft:', error);
      return null;
    }
  },

  async clear() {
    try {
      await localforage.removeItem(DRAFT_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear draft:', error);
      return false;
    }
  },

  async hasDraft() {
    const draft = await this.load();
    return draft !== null;
  },
};
