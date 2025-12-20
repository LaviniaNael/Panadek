import React, { useEffect, useRef } from 'react';

interface HangingDecorationsProps {
    isMorning: boolean;
}

const HangingDecorations: React.FC<HangingDecorationsProps> = ({ isMorning }) => {
    // Define decorations with different positions, lengths, delays, and durations for a natural feel
    const decorations = [
        { left: '10%', height: 'h-24', delay: '0s', duration: '2.5s', icon: '🎄', size: 'text-3xl' },
        { left: '25%', height: 'h-16', delay: '0.5s', duration: '2s', icon: '🔔', size: 'text-2xl' },
        { left: '40%', height: 'h-32', delay: '1.2s', duration: '3s', icon: '🎅', size: 'text-4xl' },
        { left: '60%', height: 'h-20', delay: '2.5s', duration: '2.2s', icon: '❄️', size: 'text-2xl' },
        { left: '75%', height: 'h-36', delay: '0.5s', duration: '3.5s', icon: '🎁', size: 'text-4xl' },
        { left: '90%', height: 'h-28', delay: '0.1s', duration: '2.8s', icon: '⛄', size: 'text-3xl' },
    ];

    const containerRefs = useRef<(HTMLDivElement | null)[]>([]);
    const lastScrollY = useRef(0);
    const velocity = useRef(0);
    const rotation = useRef(0);
    const rafId = useRef<number>(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            const delta = currentScrollY - lastScrollY.current;

            // Add scroll delta as an impulse to velocity
            // Clamp delta to prevent spinning out of control on fast scrolls
            const impulse = Math.max(-10, Math.min(10, delta));
            velocity.current += impulse * 0.15;

            lastScrollY.current = currentScrollY;
        };

        const updatePhysics = () => {
            // Spring physics: Pull back to 0
            const tension = 0.09;
            const damping = 0.92;

            const force = -tension * rotation.current;
            velocity.current += force;
            velocity.current *= damping;
            rotation.current += velocity.current;

            // Apply rotation to all containers
            containerRefs.current.forEach((ref, index) => {
                if (ref) {
                    // Add slight variation based on index so they don't move in perfect unison
                    const factor = 1 + (index % 2) * 0.2;
                    ref.style.transform = `rotate(${rotation.current * factor}deg)`;
                }
            });

            rafId.current = requestAnimationFrame(updatePhysics);
        };

        window.addEventListener('scroll', handleScroll);
        rafId.current = requestAnimationFrame(updatePhysics);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            cancelAnimationFrame(rafId.current);
        };
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-0 z-50 pointer-events-none">
            {decorations.map((item, index) => (
                // Outer Wrapper: Handles Scroll Physics Swing
                <div
                    key={index}
                    ref={el => { containerRefs.current[index] = el }}
                    className="absolute top-0 origin-top"
                    style={{ left: item.left }}
                >
                    {/* Inner Wrapper: Handles Idle Swing Animation */}
                    <div
                        className="origin-top animate-swing"
                        style={{
                            animationDuration: item.duration,
                            animationDelay: item.delay
                        }}
                    >
                        {/* The String */}
                        <div className={`w-0.5 bg-zinc-600 mx-auto ${item.height} opacity-50`}></div>
                        {/* The Ornament */}
                        <div className={`relative -mt-2 ${item.size} drop-shadow-lg filter transition-transform duration-300 hover:scale-125 cursor-pointer pointer-events-auto`}>
                            {item.icon}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HangingDecorations;
