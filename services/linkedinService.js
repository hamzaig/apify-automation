import { ApifyClient } from 'apify-client';

/**
 * Fetches email from a LinkedIn profile URL using Apify
 * @param {string} linkedinUrl - The LinkedIn profile URL
 * @param {string} apifyToken - The Apify API token
 * @returns {Promise<string|null>} - The email address or null if not found
 */
export async function getEmailFromLinkedIn(linkedinUrl, apifyToken) {
    try {
        // Initialize the ApifyClient with API token
        const client = new ApifyClient({
            token: apifyToken,
        });

        // Prepare Actor input
        const input = {
            "linkedin_profile_url": linkedinUrl
        };

        // Run the Actor and wait for it to finish
        const run = await client.actor("TthkVR0ZjJt8gbtRy").call(input);

        // Fetch Actor results from the run's dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems();
        
        // Extract email from the results
        // The email is typically in the first item's email field
        if (items && items.length > 0) {
            const profileData = items[0];
            return profileData.email || null;
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching email from LinkedIn:', error);
        throw error;
    }
}

