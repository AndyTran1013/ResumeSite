# Company logo assets

Place approved company logo files here when you are ready to use them in the site.

Use these filenames so the future component can find them consistently:

- `bmo.png`
- `cibc-white.png`
- `rbc.svg`

SVG files are preferred because they stay sharp at any size. The current BMO and CIBC icon assets are PNG files because they deliberately omit company-name text. `cibc.png` is retained as the original file; the site uses `cibc-white.png`, which has a white background for the company-mark circle.

This is a Vite `public` folder: files inside it are copied unchanged into the published site. When using an asset in React, build its path with Vite's base URL so it works both locally and on GitHub Pages:

```jsx
const logoPath = `${import.meta.env.BASE_URL}assets/companies/bmo.png`
```

Use only logo assets that you are allowed to publish. The logos are not connected to the page yet; this folder is a drop location for later.
