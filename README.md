# Translation vs. Localization: Japanese Landing Page Sample

A portfolio sample that shows, in three steps, why a translated landing page is not the same as a localized one.

1. **English original**: a typical US direct-to-consumer page.
2. **Faithful translation**: the same page, correctly translated into Japanese. Red pins show why it would still underperform in Japan.
3. **Localized for Japan**: the page rebuilt for Japanese buyers. Blue pins explain each change: price and tax display, voltage and PSE, payment methods, delivery terms, reviews, gifting, LINE, legally required seller disclosure, and Japanese typography.

Link to a step directly with `#original`, `#literal` or `#localized`.

**Tidewell is a fictional brand.** Nothing is sold, the buttons do nothing, and every review, figure and company detail is made up.

## Tech

Plain HTML, CSS and JavaScript: no build step, no dependencies, no tracking. Fonts come from Google Fonts. It runs as is on any static host (GitHub Pages, Cloudflare Pages).

```
index.html   pages for all three steps
styles.css   styles
app.js       version switching, numbered pins and notes
motion.js    spring motion on the Japanese page: color switch, temperature slider, cart buttons
```

## Motion

The color switch, the temperature slider and the cart buttons on the Japanese page are rebuilt from three of the [DesignBookmark Motion](https://designbookmark.com/motion) studies (Segmented control, Jelly slider, Loading to success). The code is our own, in this page's colors and type; the spring stiffness and damping values are the same as the originals. With `prefers-reduced-motion: reduce`, every spring becomes critically damped and the squash and stretch is turned off.
