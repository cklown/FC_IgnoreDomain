class AddFormCompleteDomainExclusions {
	
	constructor(email_id) {

		// Array of domains to be ignored by FormComplete.
		this.skipDomains = ['domain1.com', 'domain2.com', 'domain3.com'];
		
		// Select the email element.
		this.email = document.querySelector(email_id);

		// If email not present on site, do not attempt to add event listeners.
		if (!this.email) {
			console.log('The email field was not found.');
			return;
		}

		// Add event listeners with Capture phase to intercept Bubble phase listeners set by FormComplete.
		this.email.addEventListener('input', this.checkEmail, true);
		this.email.addEventListener('keyup', this.checkEmail, true);
	}
	
	checkEmail = (event) => {

		// Get current email value.
		const emailValue = event.target.value;
		
		// Extract domain from email value.
		const emailDomain = emailValue.split('@')[1] || null;
		if (!emailDomain) {return;}
		
		// Determine if domain (or partial domain value) is present in skipDomains array and if so, stop any additional input/keyup event listeners from firing.
		// One potential/unlikely issue:  if domain 'company.co' was present in skipDomain, and user entered '...@company.com', stopPropagation would still occur. This is the trade off to prevent .co calls for .com emails.
		const skipDomain = this.skipDomains.some(domain => emailDomain.includes(domain) || domain.includes(emailDomain));
		if (skipDomain) {event.stopPropagation();}
		
	}

}

// Instantiate class with email query selector value.
new AddFormCompleteDomainExclusions('[name="email2"]');