import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('PWA Manifest & Configuration Verification', () => {
  const manifestPath = path.resolve(__dirname, '../../public/manifest.json');
  const swPath = path.resolve(__dirname, '../../public/sw.js');
  const indexPath = path.resolve(__dirname, '../../index.html');
  const vercelPath = path.resolve(__dirname, '../../vercel.json');

  it('manifest.json exists and contains required PWA standalone configuration', () => {
    expect(fs.existsSync(manifestPath)).toBe(true);
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    // Critical standalone launch requirements
    expect(content.display).toBe('standalone');
    expect(content.display_override).toContain('standalone');
    expect(content.start_url).toBe('/');
    expect(content.scope).toBe('/');
    expect(content.id).toBe('/');
    expect(content.name).toBeTruthy();
    expect(content.short_name).toBeTruthy();
    expect(content.theme_color).toBe('#FAF8F5');
    expect(content.background_color).toBe('#FAF8F5');
  });

  it('manifest contains required 192x192, 512x512, and maskable icons', () => {
    const content = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    const icons = content.icons;

    const has192 = icons.some(
      (i) => i.sizes === '192x192' && i.type === 'image/png'
    );
    const has512 = icons.some(
      (i) => i.sizes === '512x512' && i.type === 'image/png'
    );
    const hasMaskable = icons.some(
      (i) => i.purpose === 'maskable' && i.type === 'image/png'
    );

    expect(has192).toBe(true);
    expect(has512).toBe(true);
    expect(hasMaskable).toBe(true);

    // Verify files actually exist on disk in public folder
    icons.forEach((icon) => {
      const iconOnDisk = path.resolve(__dirname, '../../public', icon.src.replace(/^\//, ''));
      expect(fs.existsSync(iconOnDisk)).toBe(true);
    });
  });

  it('index.html links manifest and sets standalone meta tags', () => {
    const html = fs.readFileSync(indexPath, 'utf8');

    expect(html).toContain('rel="manifest"');
    expect(html).toContain('name="theme-color"');
    expect(html).toContain('name="mobile-web-app-capable" content="yes"');
    expect(html).toContain('name="apple-mobile-web-app-capable" content="yes"');
  });

  it('sw.js exists and implements fetch handler with API bypass', () => {
    expect(fs.existsSync(swPath)).toBe(true);
    const sw = fs.readFileSync(swPath, 'utf8');

    expect(sw).toContain("self.addEventListener('install'");
    expect(sw).toContain("self.addEventListener('activate'");
    expect(sw).toContain("self.addEventListener('fetch'");
    // Zero caching of API calls
    expect(sw).toContain('/api');
  });

  it('vercel.json configures headers for sw.js and manifest.json', () => {
    expect(fs.existsSync(vercelPath)).toBe(true);
    const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));

    const swHeader = vercel.headers?.find((h) => h.source === '/sw.js');
    expect(swHeader).toBeDefined();

    const manifestHeader = vercel.headers?.find((h) => h.source === '/manifest.json');
    expect(manifestHeader).toBeDefined();
  });
});
