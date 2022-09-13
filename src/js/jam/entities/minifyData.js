export default function minifyData(data) {
  const out = []

  data.forEach((item) => {
    const min = {};

    ['position', 'points', 'radius']. forEach(key => min[key] = item[key])

    if (item.alpha !== 1) min.alpha = item.alpha
    if (item.color !== '#000' && item.color !== '#000000') min.color = item.color
    if (item.lineCap === 'square') min.lineCap = 'square'

    //min.radius = item.radius
    //min.radius = item.radius
    out.push(min)
  })

  return out
}
