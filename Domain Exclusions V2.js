/*

Exclude certain domains from being processed by FormComplete.

Assumptions:
	A page may contain 0 or more forms that may use FormComplete.
	The email field on a form may have unique or shared name value with other email fields across other forms.
	The email field may have custom triggers attached for validation and or for other purposes and should remain visible to a user to interact with.
	
Soltuion:
	Client adds a hidden field to the form.  It must have an attribute in which can be leveraged across multiple forms such as a Name, Class, or Data value.
	With the field being hidden, users can not directly interact with it to allow for this script to dictate what emails to send to FormComplete.

	The visble email field will have input and keyup triggers added which run checkEmail method.

	The checkEmail method checks if the current value of the visible email field contains a domain to be ignored.
	If the email's domain is not to be ignored, the visible email's value is passed to the hidden email field and the input event on the hidden field is triggered which indirectly triggers FormComplete's event to begin processing.

*/

class FormCompleteDomainExclusions {
	
	constructor(querySelectorForm, querySelectorEmail, querySelectorHiddenEmail) {
		
		// Array of domains to be ignored by FormComplete.
		this.skipDomains = ['domain1.com', 'domain2.com', 'domain3.com'];
		
		// Locate input fields with the name value 'zi_email'.
		const hiddenEmails = document.querySelectorAll(querySelectorHiddenEmail);
		
		// For each hidden email field, collect the parent form node, and also locate the visible email field using the provided querySelector value.
		hiddenEmails.forEach(function(hiddenEmail) {
			
			const formContainer = hiddenEmail.closest(querySelectorForm);
			if (!formContainer) {
				console.log('ZI - Form container not found for hidden field using querySelector value: '+querySelectorForm, hiddenEmail);
				continue;
			}
			
			const visibleEmail = formContainer.querySelector(querySelectorEmail);
			if (!formContainer) {
				console.log('ZI - Visible Email field not found using querySelector value: '+querySelectorEmail, hiddenEmail);
				continue;
			}
			
			const self = this;
			
			// Add input+keyup listeners onto the visible email field. When event triggered, run checkEmail method.
			visibleEmail.addEventListener('input', (event) => {self.checkEmail(event, formContainer, hiddenEmail);}, true);
			visibleEmail.addEventListener('keyup', (event) => {self.checkEmail(event, formContainer, hiddenEmail);}, true);

		});

	}
	
	checkEmail = (event, formContainer, hiddenEmail) => {

		// Get current email value.
		const emailValue = event.target.value;
		
		// Extract domain from email value.
		const emailDomain = emailValue.split('@')[1] || null;
		if (!emailDomain) {return;}
		
		// Determine if domain (or partial domain value) is present in skipDomains array and if so, stop any additional input/keyup event listeners from firing.
		// One potential/unlikely issue:  if domain 'company.co' was present in skipDomain, and user entered '...@company.com', stopPropagation would still occur. This is the trade off to prevent .co calls for .com emails.
		const skipDomain = this.skipDomains.some(domain => emailDomain.includes(domain) || domain.includes(emailDomain));
		if (!skipDomain) {

			// update hidden email field value.
			hiddenEmail.value = emailValue;

			// trigger input event so FormComplete begins processing. 
			hiddenEmail.addEventListener('input', this.triggerInput(hiddenEmail), true);
			
		}

	}
	
	triggerInput = (hiddenEmail) => {
		
		// Generic event to be fired to trigger other input events.
		var inputEvent = new Event('input', {
			bubbles:true,
			cancelable:true
		});
		
		// Dispatch event.
		hiddenEmail.dispatchEvent(inputEvent);
		
	}

}

// Wait for HTML and JS to fully parse.
document.addEventListener("DOMContentLoaded", (event) => {

	// Instantiate class with form, email, and hidden email query selector values.
	// If form container is a non-form element, use the approperiate query selector.
	new FormCompleteDomainExclusions('form', 'input[name="visible_email"]', 'input[name="hidden_email"]');

});
