export const getDate = () =>
  `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(
    -2
  )}-${('0' + new Date().getDate()).slice(-2)}`

export const getTime = (offset = 0) => {
  const date = Date.now() + offset

  return `${('0' + new Date(date).getHours()).slice(-2)}:${(
    '0' + new Date(date).getMinutes()
  ).slice(-2)}`
}
