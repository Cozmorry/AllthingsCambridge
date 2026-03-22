import { useEffect, useRef, useState } from 'react'

/**
 * Hook that reveals an element when it scrolls into view.
 */
export const useScrollReveal = ({ threshold = 0.08, rootMargin = '0px 0px -40px 0px', once = true } = {}) => {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    if (once) observer.unobserve(el)
                } else if (!once) {
                    setIsVisible(false)
                }
            },
            { threshold, rootMargin }
        )

        observer.observe(el)
        return () => observer.unobserve(el)
    }, [threshold, rootMargin, once])

    return [ref, isVisible]
}

/**
 * Component wrapper that reveals children on scroll with buttery smooth animations.
 */
export const ScrollReveal = ({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 850,
    className = '',
    as: Tag = 'div',
    stagger = 0,
    ...rest
}) => {
    const [ref, isVisible] = useScrollReveal()

    const baseStyle = {
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay + stagger}ms`,
        willChange: 'opacity, transform',
    }

    const hiddenStyles = {
        'fade-up': { opacity: 0, transform: 'translate3d(0, 24px, 0)' },
        'fade-left': { opacity: 0, transform: 'translate3d(-24px, 0, 0)' },
        'fade-right': { opacity: 0, transform: 'translate3d(24px, 0, 0)' },
        'zoom': { opacity: 0, transform: 'scale3d(0.95, 0.95, 1)' },
        'fade': { opacity: 0, transform: 'none' },
    }

    const visibleStyle = { opacity: 1, transform: 'translate3d(0, 0, 0) scale3d(1, 1, 1)' }

    return (
        <Tag
            ref={ref}
            className={className}
            style={{
                ...baseStyle,
                ...(isVisible ? visibleStyle : hiddenStyles[animation] || hiddenStyles['fade-up']),
            }}
            {...rest}
        >
            {children}
        </Tag>
    )
}

