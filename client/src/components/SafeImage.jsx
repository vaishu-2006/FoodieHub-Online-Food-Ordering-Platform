import fallbackImage from '../assets/food-fallback.svg'

export default function SafeImage({ src, alt = '', ...props }) {
  const useFallback = (event) => {
    event.currentTarget.onerror = null
    event.currentTarget.src = fallbackImage
  }
  return <img src={src || fallbackImage} alt={alt} onError={useFallback} {...props} />
}
