const Configuration = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-max-line-length': [1, 'always', 120],
    'footer-max-line-length': [2, 'always', 72],
    'header-max-length': [2, 'always', 72],
    'scope-case': [2, 'always', 'upper-case'],
    'type-enum': [2, 'always', ['feat', 'fix', 'wip', 'fixup', 'chore', 'revert']],
  },
};

module.exports = Configuration;
