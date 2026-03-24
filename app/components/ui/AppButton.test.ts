import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppButton from './AppButton.vue'

describe('AppButton.vue', () => {
  it('renders label correctly', () => {
    const wrapper = mount(AppButton, {
      props: {
        label: 'Click me'
      }
    })
    expect(wrapper.text()).toContain('Click me')
  })

  it('emits click event when clicked', async () => {
    const wrapper = mount(AppButton)
    await wrapper.trigger('click')
    expect(wrapper.emitted()).toHaveProperty('click')
  })

  it('does not emit click event when loading', async () => {
    const wrapper = mount(AppButton, {
      props: {
        loading: true
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).not.toHaveProperty('click')
  })

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(AppButton, {
      props: {
        disabled: true
      }
    })
    await wrapper.trigger('click')
    expect(wrapper.emitted()).not.toHaveProperty('click')
  })

  it('applies variant classes correctly', () => {
    const variants = ['primary', 'secondary', 'danger', 'success', 'ghost']
    variants.forEach(variant => {
      const wrapper = mount(AppButton, {
        props: {
          variant: variant as any
        }
      })
      expect(wrapper.classes()).toContain(`btn-${variant}`)
    })
  })

  it('applies size classes correctly', () => {
    const sizes = ['sm', 'md', 'lg']
    sizes.forEach(size => {
      const wrapper = mount(AppButton, {
        props: {
          size: size as any
        }
      })
      expect(wrapper.classes()).toContain(`btn-${size}`)
    })
  })
})
