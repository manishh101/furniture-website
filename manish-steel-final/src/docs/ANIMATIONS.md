# Animation System Documentation

This document explains how to use the animation system in the Manish Steel Furniture website to achieve professional transitions and scroll effects similar to evereststeel.com.np.

## Page Transitions

The website uses smooth page transitions between routes to create a polished, professional experience for users.

### How Page Transitions Work

When a user navigates between pages, the `PageTransition` component provides a smooth fade and slight movement animation, giving the content a natural, elegant transition.

Page transitions are automatically applied through the `LayoutWrapper` component, which wraps all page content.

## Scroll Animations

Elements can animate as they come into view during scrolling, similar to evereststeel.com.np.

### Using ScrollAnimator

The `ScrollAnimator` component can be used to animate any element when it scrolls into view:

```jsx
import ScrollAnimator from '../components/ScrollAnimator';

function MyComponent() {
  return (
    <div className="my-section">
      {/* Basic usage */}
      <ScrollAnimator>
        <h2>This will animate when scrolled into view</h2>
      </ScrollAnimator>
      
      {/* With custom animation type */}
      <ScrollAnimator animation="fadeLeft" delay={0.2}>
        <p>This will slide in from the left with a delay</p>
      </ScrollAnimator>
      
      {/* Different animation types */}
      <ScrollAnimator animation="zoom">
        <img src="/path/to/image.jpg" alt="Product" />
      </ScrollAnimator>
      
      {/* Staggered animations */}
      <div className="grid grid-cols-3 gap-4">
        {products.map((product, index) => (
          <ScrollAnimator 
            key={product.id} 
            animation="fadeUp"
            delay={index * 0.1} // Staggered delay
          >
            <ProductCard product={product} />
          </ScrollAnimator>
        ))}
      </div>
    </div>
  );
}
```

### Available Animation Types

- `fadeUp` (default) - Fades in while moving up
- `fadeDown` - Fades in while moving down
- `fadeLeft` - Fades in while moving from left
- `fadeRight` - Fades in while moving from right
- `fade` - Simple fade in with no movement
- `zoom` - Scales up while fading in
- `zoomFadeUp` - Combination of zoom and fade up

### Configuration Options

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `animation` | string | `'fadeUp'` | Animation type |
| `delay` | number | `0` | Delay before animation starts (seconds) |
| `duration` | number | `0.7` | Animation duration (seconds) |
| `threshold` | number | `0.2` | Percentage of element visible before triggering |
| `className` | string | `''` | Additional CSS classes |

## Accessibility

Both page transitions and scroll animations respect user preferences:

- Users with `prefers-reduced-motion` enabled will see simplified animations
- All interactive elements remain fully accessible during animations
- Focus management preserves keyboard navigation

## Best Practices

1. **Don't overuse animations** - Too many animations can make the site feel busy and slow
2. **Use consistent animations** - Stick to a consistent animation style throughout
3. **Keep animations brief** - Animations should be quick (0.3-0.8s)
4. **Use staggered delays** - For groups of elements, stagger animations by 0.1-0.2s
5. **Ensure performance** - Animate opacity and transform properties for best performance
