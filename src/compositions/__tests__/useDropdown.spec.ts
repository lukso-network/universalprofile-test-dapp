import useDropdown from '../useDropdown'

test('can open dropdown', () => {
  const { open } = useDropdown()
  const dropdown = document.createElement('div')
  open(dropdown)

  expect(dropdown).toHaveClass('is-active')
})

test('can close dropdown', () => {
  const { close } = useDropdown()
  const dropdown = document.createElement('div')
  dropdown.classList.add('is-active')
  close(dropdown)

  expect(dropdown).not.toHaveClass('is-active')
})

test('can check if dropdown is open', () => {
  const { isOpen } = useDropdown()
  const dropdown = document.createElement('div')
  dropdown.classList.add('is-active')
  const result = isOpen(dropdown)

  expect(result).toBeTruthy()
})

test('can toggle dropdown', () => {
  const { toggle } = useDropdown()
  const dropdown = document.createElement('div')
  dropdown.classList.add('is-active')
  toggle(dropdown)

  expect(dropdown).not.toHaveClass('is-active')

  toggle(dropdown)

  expect(dropdown).toHaveClass('is-active')
})
