// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  ignores: [
    '.claude',
  ],
  rules: {
    'no-console': 'off',
    'antfu/no-top-level-await': 'off',
  },
})
