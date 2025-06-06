import Color from 'color';
import { useTheme } from 'next-themes';
import { useEffect, useRef } from 'react';

interface EmailContentProps {
  html: string;
  isBodyExpanded: boolean;
  containsQuotedContent: boolean;
}

const EmailContent = ({ html, isBodyExpanded, containsQuotedContent }: EmailContentProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const shadowRootRef = useRef<ShadowRoot | null>(null);
  const { theme } = useTheme();

  // Initialize shadow DOM
  useEffect(() => {
    if (!containerRef.current || shadowRootRef.current) return;

    try {
      shadowRootRef.current = containerRef.current.attachShadow({ mode: 'open' });

      // Create wrapper for content
      const wrapper = document.createElement('div');
      wrapper.className = 'email-content';
      wrapper.innerHTML = html;

      // Add styles
      const styleSheet = document.createElement('style');
      styleSheet.textContent = `
        .email-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.3;
          font-size: 14px;
        }
        .email-content a {
          color: #1a73e8;
          text-decoration: none;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
        .email-content img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
          max-width: 100%;
        }
        .email-content table {
          border-collapse: collapse !important;
        }
        .email-content td {
          vertical-align: top;
        }
        .hide-quotes blockquote,
        .hide-quotes div:has(blockquote) {
          display: none;
        }
        ${
          theme === 'dark'
            ? `
          .email-content {
            color-scheme: dark;
            color: #e8eaed;
            background-color: transparent;
          }
          .email-content a {
            color: #8ab4f8;
          }
          .email-content img {
            filter: brightness(0.8) contrast(1.2);
          }
          .email-content * {
            background-color: transparent !important;
          }
          .email-content * {
            color: #e8eaed !important;
          }
          .email-content [style*="color"] {
            color: #e8eaed !important;
          }
          .email-content h1,
          .email-content h2,
          .email-content h3,
          .email-content h4,
          .email-content h5,
          .email-content h6 {
            color: #ffffff !important;
          }
          .email-content a[href] {
            color: #8ab4f8 !important;
          }
          .email-content blockquote {
            border-left-color: #5f6368 !important;
            color: #9aa0a6 !important;
          }
          .email-content pre,
          .email-content code {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #e8eaed !important;
          }
          .email-content table {
            border-color: #5f6368 !important;
          }
          .email-content th,
          .email-content td {
            border-color: #5f6368 !important;
          }
          .email-content hr {
            border-color: #5f6368 !important;
          }
        `
            : `
          .email-content {
            color-scheme: light;
            color: #202124;
            background-color: transparent;
          }
          .email-content a {
            color: #1a73e8;
          }
        `
        }
      `;

      // Append elements to shadow root
      shadowRootRef.current.appendChild(styleSheet);
      shadowRootRef.current.appendChild(wrapper);

      // Initial color sanitization
      sanitizeColors(wrapper);
    } catch (error) {
      console.error('Error setting up shadow DOM:', error);
      if (containerRef.current) {
        containerRef.current.innerHTML = html;
      }
    }

    return () => {
      if (shadowRootRef.current) {
        shadowRootRef.current.innerHTML = '';
        shadowRootRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update content and styles when dependencies change
  useEffect(() => {
    if (!shadowRootRef.current) return;

    const wrapper = shadowRootRef.current.querySelector('.email-content');
    if (!wrapper) return;

    // Update content
    wrapper.innerHTML = html;

    // Update classes
    if (!isBodyExpanded && containsQuotedContent) {
      wrapper.classList.add('hide-quotes');
    } else {
      wrapper.classList.remove('hide-quotes');
    }

    // Update styles
    const styleSheet = shadowRootRef.current.querySelector('style');
    if (styleSheet) {
      styleSheet.textContent = `
        .email-content {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          line-height: 1.3;
          font-size: 14px;
        }
        .email-content a {
          color: #1a73e8;
          text-decoration: none;
        }
        .email-content a:hover {
          text-decoration: underline;
        }
        .email-content img {
          border: 0;
          height: auto;
          line-height: 100%;
          outline: none;
          text-decoration: none;
          -ms-interpolation-mode: bicubic;
          max-width: 100%;
        }
        .email-content table {
          border-collapse: collapse !important;
        }
        .email-content td {
          vertical-align: top;
        }
        .hide-quotes blockquote,
        .hide-quotes div:has(blockquote) {
          display: none;
        }
        ${
          theme === 'dark'
            ? `
          .email-content {
            color-scheme: dark;
            color: #e8eaed;
            background-color: transparent;
          }
          .email-content a {
            color: #8ab4f8;
          }
          .email-content img {
            filter: brightness(0.8) contrast(1.2);
          }
          .email-content * {
            background-color: transparent !important;
          }
          .email-content * {
            color: #e8eaed !important;
          }
          .email-content [style*="color"] {
            color: #e8eaed !important;
          }
          .email-content h1,
          .email-content h2,
          .email-content h3,
          .email-content h4,
          .email-content h5,
          .email-content h6 {
            color: #ffffff !important;
          }
          .email-content a[href] {
            color: #8ab4f8 !important;
          }
          .email-content blockquote {
            border-left-color: #5f6368 !important;
            color: #9aa0a6 !important;
          }
          .email-content pre,
          .email-content code {
            background-color: rgba(255, 255, 255, 0.1) !important;
            color: #e8eaed !important;
          }
          .email-content table {
            border-color: #5f6368 !important;
          }
          .email-content th,
          .email-content td {
            border-color: #5f6368 !important;
          }
          .email-content hr {
            border-color: #5f6368 !important;
          }
        `
            : `
          .email-content {
            color-scheme: light;
            color: #202124;
            background-color: transparent;
          }
          .email-content a {
            color: #1a73e8;
          }
        `
        }
      `;
    }

    // Update colors
    sanitizeColors(wrapper);
  }, [html, isBodyExpanded, containsQuotedContent, theme]);

  // Helper function for color sanitization
  const sanitizeColors = (wrapper: Element) => {
    const elements = wrapper.getElementsByTagName('*');

    for (const element of elements) {
      try {
        // Handle background colors
        const computedBg = getComputedStyle(element as HTMLElement).backgroundColor;
        if (computedBg && computedBg !== 'transparent' && computedBg !== 'rgba(0, 0, 0, 0)') {
          if (theme === 'dark') {
            const bg = Color(computedBg);
            const rgb = bg.rgb();
            (
              element as HTMLElement
            ).style.backgroundColor = `rgba(${rgb.red()}, ${rgb.green()}, ${rgb.blue()}, 0.1)`;
          } else {
            const bg = Color(computedBg);
            if (bg.alpha() >= 1) {
              (element as HTMLElement).style.backgroundColor = bg.rgb().toString();
            }
          }
        }

        // Handle text colors in dark mode
        if (theme === 'dark') {
          const computedColor = getComputedStyle(element as HTMLElement).color;
          if (computedColor && computedColor !== 'rgba(0, 0, 0, 0)') {
            const color = Color(computedColor);
            const rgb = color.rgb();
            // Adjust color brightness for dark mode
            const brightness = (rgb.red() * 299 + rgb.green() * 587 + rgb.blue() * 114) / 1000;
            if (brightness < 128) {
              // Dark colors become light
              (element as HTMLElement).style.color = '#e8eaed';
            } else {
              // Light colors become slightly dimmer
              (
                element as HTMLElement
              ).style.color = `rgba(${rgb.red()}, ${rgb.green()}, ${rgb.blue()}, 0.8)`;
            }
          }
        }
      } catch (error) {
        console.warn('Error parsing colors:', error);
      }
    }
  };

  return <div ref={containerRef} className='email-wrapper' />;
};

export default EmailContent;
