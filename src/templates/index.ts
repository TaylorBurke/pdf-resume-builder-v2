import { CleanTemplate } from './clean/CleanTemplate'
import { BoldTemplate } from './bold/BoldTemplate'
import { ExecutiveTemplate } from './executive/ExecutiveTemplate'

export const TEMPLATES = {
  clean: {
    name: 'Clean',
    component: CleanTemplate,
    description: 'Minimalist and elegant',
  },
  bold: {
    name: 'Bold',
    component: BoldTemplate,
    description: 'Modern two-column layout',
  },
  executive: {
    name: 'Executive',
    component: ExecutiveTemplate,
    description: 'Professional and authoritative',
  },
} as const

export type TemplateId = keyof typeof TEMPLATES
