import { getEmailFromLinkedIn } from './services/linkedinService.js';

(async () => {
    const linkedinUrl = "https://www.linkedin.com/in/steven-litt-7857341b2";
    
    try {
        const email = await getEmailFromLinkedIn(linkedinUrl);
        
        if (email) {
            console.log('Email found:', email);
        } else {
            console.log('No email found for this LinkedIn profile');
        }
    } catch (error) {
        console.error('Error:', error);
    }
})();