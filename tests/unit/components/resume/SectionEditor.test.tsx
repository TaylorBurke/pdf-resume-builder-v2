import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SectionEditor from '@/components/resume/SectionEditor'
import type { ResumeContent } from '@/types'

const mockContent: ResumeContent = {
  summary: 'Test summary',
  experience: [{ company: 'Acme', title: 'Engineer', dates: '2020-2023', bullets: ['Built stuff'] }],
  skills: [{ name: 'Frontend', items: ['React', 'TypeScript'] }],
}

describe('SectionEditor', () => {
  it('renders section names for sections present in content', () => {
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    expect(screen.getByRole('button', { name: /summary/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /experience/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /skills/i })).toBeInTheDocument()
  })

  it('does not render sections not present in content', () => {
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    expect(screen.queryByRole('button', { name: /education/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /projects/i })).not.toBeInTheDocument()
  })

  it('expands a section when clicked', async () => {
    const user = userEvent.setup()
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    await user.click(screen.getByRole('button', { name: /summary/i }))
    expect(screen.getByDisplayValue('Test summary')).toBeInTheDocument()
  })

  it('collapses the open section when another is clicked', async () => {
    const user = userEvent.setup()
    render(<SectionEditor content={mockContent} onSave={vi.fn()} isSaving={false} />)
    await user.click(screen.getByRole('button', { name: /summary/i }))
    expect(screen.getByDisplayValue('Test summary')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /experience/i }))
    expect(screen.queryByDisplayValue('Test summary')).not.toBeInTheDocument()
  })

  it('calls onSave with updated content when Save is clicked', async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<SectionEditor content={mockContent} onSave={onSave} isSaving={false} />)
    await user.click(screen.getByRole('button', { name: /summary/i }))
    const textarea = screen.getByDisplayValue('Test summary')
    await user.clear(textarea)
    await user.type(textarea, 'Updated summary')
    await user.click(screen.getByRole('button', { name: /save/i }))
    expect(onSave).toHaveBeenCalledWith({ ...mockContent, summary: 'Updated summary' })
  })
})
