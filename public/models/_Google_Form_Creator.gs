function createTvariseClientWebsiteBrief() {
  const form = FormApp.create('TVARISE — Client Website Brief');

  form.setDescription(
    'Tvarise website requirement form. Please fill this with as much detail as possible. ' +
    'If you are unsure about anything, you can leave it blank.'
  );
  form.setConfirmationMessage(
    'Thank you! Your website requirements have been received by Tvarise. We will review them and get back to you.'
  );
  form.setProgressBar(true);
  form.setCollectEmail(true);

  // 1 — Client & Business
  form.addSectionHeaderItem().setTitle('01 · Client & Business');

  form.addTextItem().setTitle('Client / Brand Name').setRequired(true);
  form.addTextItem().setTitle('Contact Person').setRequired(true);
  form.addTextItem().setTitle('Phone / WhatsApp').setRequired(true);
  form.addTextItem().setTitle('Business / Industry').setRequired(true);
  form.addParagraphTextItem().setTitle('What does your business do?').setRequired(true);
  form.addParagraphTextItem().setTitle('Who are your main customers / target audience?');
  form.addTextItem().setTitle('Service Area / Location');

  // 2 — Website Goal
  form.addSectionHeaderItem().setTitle('02 · Website Goal');

  form.addMultipleChoiceItem()
    .setTitle('What is the main purpose of the website?')
    .setChoiceValues(['Generate Leads', 'Sell Products', 'Branding', 'Portfolio', 'Bookings', 'Information', 'Other'])
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('What should a visitor ideally do after visiting your website?')
    .setRequired(true);

  form.addMultipleChoiceItem()
    .setTitle('Main Call-to-Action')
    .setChoiceValues(['WhatsApp', 'Call', 'Enquiry Form', 'Book Appointment', 'Buy Now', 'Other']);

  // 3 — Website Structure
  form.addSectionHeaderItem().setTitle('03 · Website Structure');

  form.addCheckboxItem()
    .setTitle('Which pages do you need?')
    .setChoiceValues([
      'Home', 'About', 'Services', 'Products', 'Portfolio / Projects',
      'Testimonials / Reviews', 'FAQ', 'Blog', 'Contact', 'Other'
    ])
    .setRequired(true);

  form.addParagraphTextItem().setTitle('Any important sections or information that must appear on the website?');

  form.addCheckboxItem()
    .setTitle('Which features do you need?')
    .setChoiceValues([
      'WhatsApp Button', 'Contact Form', 'Booking / Appointment',
      'Online Payment', 'Product Gallery', 'Google Maps', 'Search',
      'Filters', 'Login / Signup', 'Blog / CMS', 'Social Media Integration',
      'Other'
    ]);

  form.addParagraphTextItem().setTitle('Any future features you may want later?');

  // 4 — Design
  form.addSectionHeaderItem().setTitle('04 · Design & Style');

  form.addCheckboxItem()
    .setTitle('What style do you prefer?')
    .setChoiceValues([
      'Minimal', 'Premium', 'Modern', 'Corporate',
      'Luxury', 'Creative', 'Bold', 'Dark', 'Light'
    ]);

  form.addTextItem().setTitle('Preferred colours / brand colours');

  form.addTextItem().setTitle('Reference Website 1 (URL)');
  form.addTextItem().setTitle('Reference Website 2 (URL)');
  form.addParagraphTextItem().setTitle('What do you like about the reference websites?');
  form.addParagraphTextItem().setTitle('Anything you definitely want to avoid?');

  // 5 — Content & Assets
  form.addSectionHeaderItem().setTitle('05 · Content & Assets');

  form.addMultipleChoiceItem()
    .setTitle('Logo')
    .setChoiceValues(['Ready', 'Need to create', 'Not available']);

  form.addMultipleChoiceItem()
    .setTitle('Photos / Images')
    .setChoiceValues(['Ready', 'Need to create', 'Not available']);

  form.addMultipleChoiceItem()
    .setTitle('Videos')
    .setChoiceValues(['Ready', 'Need to create', 'Not available']);

  form.addMultipleChoiceItem()
    .setTitle('Website Text / Copy')
    .setChoiceValues(['Ready', 'Need help creating it', 'Not available']);

  form.addParagraphTextItem().setTitle('Social Media Links (Instagram, Facebook, LinkedIn, YouTube, etc.)');
  form.addTextItem().setTitle('Existing Website URL (if any)');

  // 6 — Business / Technical
  form.addSectionHeaderItem().setTitle('06 · Existing Setup');

  form.addMultipleChoiceItem()
    .setTitle('Do you already have a domain?')
    .setChoiceValues(['Yes', 'No', 'Not sure']);

  form.addTextItem().setTitle('Domain name (if available)');

  form.addMultipleChoiceItem()
    .setTitle('Do you already have hosting?')
    .setChoiceValues(['Yes', 'No', 'Not sure']);

  form.addParagraphTextItem().setTitle('Any existing tools / integrations we should connect?');

  // 7 — Project
  form.addSectionHeaderItem().setTitle('07 · Project');

  form.addTextItem().setTitle('Expected launch date');
  form.addTextItem().setTitle('Approximate budget range');

  form.addParagraphTextItem()
    .setTitle('What are the MUST-HAVE things for launch?')
    .setRequired(true);

  form.addParagraphTextItem().setTitle('What would be NICE-TO-HAVE (can be added later)?');
  form.addParagraphTextItem().setTitle('Anything else we should know about your project?');

  Logger.log('EDIT URL: ' + form.getEditUrl());
  Logger.log('LIVE FORM URL: ' + form.getPublishedUrl());
}
