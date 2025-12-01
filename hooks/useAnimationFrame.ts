import { useEffect, useRef } from 'react'


export default function useAnimationFrame(callback: (dt: number) => void, active = true) {
const last = useRef<number | null>(null)
const raf = useRef<number | null>(null)


useEffect(() => {
if (!active) return
function loop(now: number) {
if (last.current == null) last.current = now
const dt = (now - last.current) / 1000
last.current = now
callback(dt)
raf.current = requestAnimationFrame(loop)
}
raf.current = requestAnimationFrame(loop)
return () => { if (raf.current) cancelAnimationFrame(raf.current); last.current = null }
}, [callback, active])
}