import { defineConfig, presetUno, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  shortcuts: {
    'page': 'max-w-480px mx-auto px-4 pt-6 pb-24 min-h-screen',
  },
});
