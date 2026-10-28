// Shimmy Specs — database connection. Fill in both values to turn on accounts and cloud saving.
// Until then the app saves on this device only. The publishable key is safe in browser code.
// Never put the service-role key here. See convo/convo v0.3.md (question 3) for where this file should live.
window.SS_CONFIG = {
  supabaseUrl: '<project-url>',
  publishableKey: '<publishable-key>'
};
