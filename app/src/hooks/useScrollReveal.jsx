import { useEffect, useRef, useState } from 'react'

/**
 * Hook that reveals an element when it scrolls into view.
 * @param {Object} options
 * @param {number} options.threshold - 0-1, how much of the element must be visible
 * @param {string} options.rootMargin - CSS margin around the root
 * @param {boolean} options.once - if true, only triggers once
 */
export const useScrollReveal = ({ threshold = 0.15, rootMargin = '0px 0px -60px 0px', once = true } = {}) => {
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
 * Component wrapper that reveals children on scroll.
 * @param {Object} props
 * @param {'fade-up'|'fade-left'|'fade-right'|'zoom'|'fade'} props.animation
 * @param {number} props.delay - delay in ms
 * @param {number} props.duration - duration in ms
 * @param {string} props.className - additional classes
 */
export const ScrollReveal = ({
    children,
    animation = 'fade-up',
    delay = 0,
    duration = 600,
    className = '',
    as: Tag = 'div',
    stagger = 0,
    ...rest
}) => {
    const [ref, isVisible] = useScrollReveal()

    const baseStyle = {
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        transitionDelay: `${delay + stagger}ms`,
    }

    const hiddenStyles = {
        'fade-up': { opacity: 0, transform: 'translateY(40px)' },
        'fade-left': { opacity: 0, transform: 'translateX(-40px)' },
        'fade-right': { opacity: 0, transform: 'translateX(40px)' },
        'zoom': { opacity: 0, transform: 'scale(0.92)' },
        'fade': { opacity: 0, transform: 'none' },
    }

    const visibleStyle = { opacity: 1, transform: 'translateY(0) translateX(0) scale(1)' }

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
