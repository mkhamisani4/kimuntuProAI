/**
 * AI Service
 * Handles all AI interactions via server-side API route
 * Replaces direct OpenAI client-side calls
 */

/**
 * Check if AI service is available (always true since we use server-side API)
 */
export const isConfigured = () => true;

/**
 * Call the business assistant API route
 */
const callAI = async (action, params, options = {}) => {
    try {
        const response = await fetch('/api/ai/business-assistant', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, params }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'AI request failed');
        }

        const data = await response.json();
        return data.content;
    } catch (error) {
        console.error('AI Service Error:', error);
        throw error;
    }
};

/**
 * Generate project ideas based on category and preferences
 */
export const generateProjectIdeas = async (category, userPreferences = '') => {
    try {
        const response = await callAI('generateProjectIdeas', { category, userPreferences });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error generating project ideas:', error);
        throw new Error('Failed to generate project ideas. Please try again.');
    }
};

/**
 * Generate project title suggestions
 */
export const generateTitleSuggestions = async (description, category) => {
    try {
        const response = await callAI('generateTitleSuggestions', { description, category });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error generating titles:', error);
        throw new Error('Failed to generate title suggestions.');
    }
};

/**
 * Enhance project description with AI
 */
export const enhanceDescription = async (currentDescription, category) => {
    try {
        return await callAI('enhanceDescription', { currentDescription, category });
    } catch (error) {
        console.error('Error enhancing description:', error);
        throw new Error('Failed to enhance description.');
    }
};

/**
 * Generate market analysis for project category
 */
export const generateMarketAnalysis = async (category, projectTitle) => {
    try {
        return await callAI('generateMarketAnalysis', { category, projectTitle });
    } catch (error) {
        console.error('Error generating market analysis:', error);
        throw new Error('Failed to generate market analysis.');
    }
};

/**
 * Recommend resources for the project
 */
export const recommendResources = async (projectDescription, category) => {
    try {
        const response = await callAI('recommendResources', { projectDescription, category });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error recommending resources:', error);
        throw new Error('Failed to generate resource recommendations.');
    }
};

/**
 * Identify potential challenges and risks
 */
export const identifyChallenges = async (projectDescription, category) => {
    try {
        const response = await callAI('identifyChallenges', { projectDescription, category });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error identifying challenges:', error);
        throw new Error('Failed to identify challenges.');
    }
};

/**
 * Generate project goals
 */
export const generateGoals = async (projectDescription, category) => {
    try {
        const response = await callAI('generateGoals', { projectDescription, category });
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
        }
        return JSON.parse(response);
    } catch (error) {
        console.error('Error generating goals:', error);
        throw new Error('Failed to generate goals.');
    }
};

/**
 * Get AI brainstorming assistance
 */
export const getBrainstormingHelp = async (topic, context = '') => {
    try {
        return await callAI('getBrainstormingHelp', { topic, context });
    } catch (error) {
        console.error('Error with brainstorming:', error);
        throw new Error('Failed to generate brainstorming insights.');
    }
};

/**
 * Generic AI call (for backward compatibility with components using callOpenAI)
 */
export const callOpenAI = async (messages, options = {}) => {
    // Extract system message and user message
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsg = messages.find(m => m.role === 'user');

    return await callAI('getBrainstormingHelp', {
        topic: userMsg?.content || '',
        context: systemMsg?.content || '',
    });
};
