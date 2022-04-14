module.exports = {
  allowCustomScopes: true,
  allowBreakingChanges: ['feat', 'fix'],
  subjectLimit: 72,
  skipQuestions: ['footer', 'breaking'],
  allowTicketNumber: false,
  isTicketNumberRequired: false,

  types: [
    { value: 'feat', name: 'feat:     New Feature Development (Jira Task/Story)' },
    { value: 'fix', name: 'fix:      Fix for a Deployed Feature (Jira Bug)' },
    { value: 'wip', name: 'wip:      Work in progress. Not ready to merge' },
    { value: 'fixup', name: 'fixup:    Fix for a New Feature after a previous commit (Jira Task/Story)' },
    { value: 'chore', name: "chore:    Other changes that don't modify src or test files" },
    { value: 'revert', name: 'revert:   Revert a previous commit' },
  ],

  messages: {
    type: "Select the type of change that you're committing:",
    customScope: 'Jira Ticket (ex: PCT-12345)',
    subject: 'Write a SHORT, IMPERATIVE tense description of the change:\n',
    body: 'Provide a LONGER description of the change (optional). Use "|" to break new line:\n',
  },
};
