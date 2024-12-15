import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		colors: {
  			background: 'rgb(var(--background) / <alpha-value>)',
  			foreground: 'rgb(var(--foreground) / <alpha-value>)',
  			primary: {
  				DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
  				foreground: 'rgb(var(--primary-foreground) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
  				foreground: 'rgb(var(--secondary-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
  				foreground: 'rgb(var(--accent-foreground) / <alpha-value>)'
  			},
  			card: {
  				DEFAULT: 'rgb(var(--card) / <alpha-value>)',
  				foreground: 'rgb(var(--card-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
  				foreground: 'rgb(var(--muted-foreground) / <alpha-value>)'
  			}
  		},
  		fontFamily: {
  			sans: ["Inter", "sans-serif"],
  			display: ["Poppins", "sans-serif"],
  			mono: ["Fira Code", "monospace"]
  		},
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [tailwindcssAnimate],
};

export default config;