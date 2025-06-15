## Cleanup Instructions

As part of the improvements to match the Everest Steel website's animations:

1. The `ScrollRevealElement.js` component should be deleted since it has been replaced with the more powerful `ScrollAnimator.js` component.

2. Run this command to remove the file:
```
rm src/components/ScrollRevealElement.js
```

3. The new animation system includes:
   - Enhanced page transitions (PageTransition.js)
   - Scroll-triggered animations (ScrollAnimator.js)
   - Documentation (src/docs/ANIMATIONS.md)

4. All pages should be updated to use the new ScrollAnimator component for elements that should animate on scroll.

5. Check for any remaining uses of CSS classes like `.animate-fadeIn` and `.animate-fadeInUp` and replace them with the ScrollAnimator component.
