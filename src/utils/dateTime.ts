export const getDate = () =>
  `${new Date().getFullYear()}-${('0' + (new Date().getMonth() + 1)).slice(
    -2
  )}-${('0' + new Date().getDate()).slice(-2)}`

export const getTime = () =>
  `${('0' + new Date().getHours()).slice(-2)}:${(
    '0' + new Date().getMinutes()
  ).slice(-2)}`
