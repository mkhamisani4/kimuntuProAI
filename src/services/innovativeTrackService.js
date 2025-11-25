import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../../firebase.js';

const PROJECTS_COLLECTION = 'innovativeProjects';

/**
 * Save a new project to Firestore
 * @param {string} userId - The user's ID
 * @param {Object} projectData - The project data
 * @returns {Promise<string>} - The ID of the created project
 */
export const saveProject = async (userId, projectData) => {
  try {
    console.log('Attempting to save project for userId:', userId);
    console.log('Project data:', projectData);
    console.log('Database instance:', db);

    const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
      ...projectData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('Project saved successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving project:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error; // Throw the actual error instead of a generic one
  }
};

/**
 * Get all projects for a specific user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} - Array of user's projects
 */
export const getUserProjects = async (userId) => {
  try {
    console.log('Attempting to load projects for userId:', userId);

    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`Loaded ${projects.length} projects successfully`);
    return projects;
  } catch (error) {
    console.error('Error loading projects:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    throw error; // Throw the actual error instead of a generic one
  }
};

/**
 * Get a single project by ID
 * @param {string} projectId - The project's ID
 * @returns {Promise<Object>} - The project data
 */
export const getProject = async (projectId) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      throw new Error('Project not found');
    }
  } catch (error) {
    console.error('Error getting project:', error);
    throw new Error('Failed to load project');
  }
};

/**
 * Update an existing project
 * @param {string} projectId - The project's ID
 * @param {Object} updates - The data to update
 * @returns {Promise<void>}
 */
export const updateProject = async (projectId, updates) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw new Error('Failed to update project');
  }
};

/**
 * Delete a project
 * @param {string} projectId - The project's ID
 * @returns {Promise<void>}
 */
export const deleteProject = async (projectId) => {
  try {
    const docRef = doc(db, PROJECTS_COLLECTION, projectId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw new Error('Failed to delete project');
  }
};

/**
 * Get projects by category
 * @param {string} userId - The user's ID
 * @param {string} category - The project category
 * @returns {Promise<Array>} - Array of projects in the category
 */
export const getProjectsByCategory = async (userId, category) => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return projects;
  } catch (error) {
    console.error('Error getting projects by category:', error);
    throw new Error('Failed to load projects');
  }
};

/**
 * Get projects by status
 * @param {string} userId - The user's ID
 * @param {string} status - The project status
 * @returns {Promise<Array>} - Array of projects with the status
 */
export const getProjectsByStatus = async (userId, status) => {
  try {
    const q = query(
      collection(db, PROJECTS_COLLECTION),
      where('userId', '==', userId),
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const projects = [];
    querySnapshot.forEach((doc) => {
      projects.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return projects;
  } catch (error) {
    console.error('Error getting projects by status:', error);
    throw new Error('Failed to load projects');
  }
};
