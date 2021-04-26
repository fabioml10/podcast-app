export function convertDurationToTimeString(duration: number) {
  const hours = Math.floor(duration / (60 * 60))
  const minutes = Math.floor((duration % (60 * 60) / 60))
  const seconds = duration % 60

  //se retornar um só char, coloca o zero na frente
  const timeString = [hours, minutes, seconds]
    .map(unit => String(unit).padStart(2, '0'))
    .join(':')

  return timeString
}
