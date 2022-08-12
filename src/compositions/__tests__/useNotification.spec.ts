import useNotifications from '../useNotifications'

test('can set notification', () => {
  const { notification, setNotification } = useNotifications()

  setNotification('some notification', 'primary')

  expect(notification.value).toEqual({
    message: 'some notification',
    type: 'primary',
  })
})

test('can clear notification', () => {
  const { notification, setNotification, clearNotification } =
    useNotifications()

  setNotification('some notification', 'primary')
  clearNotification()

  expect(notification.value).toEqual({})
})
