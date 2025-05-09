import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				poppins: ['Poppins', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// CREALINK Custom Colors
				crealink: {
					dark: '#0A0A0A',
					purple: '#6112D9',
					pink: '#EE7BF4',
					'purple-glow': 'rgba(97, 18, 217, 0.5)',
					'pink-glow': 'rgba(238, 123, 244, 0.5)',
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'pulse-slow': {
					'0%, 100%': { 
						opacity: '0.8'
					},
					'50%': { 
						opacity: '1'
					},
				},
				glow: {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(97, 18, 217, 0.5), 0 0 15px rgba(238, 123, 244, 0.5)' 
					},
					'50%': { 
						boxShadow: '0 0 15px rgba(97, 18, 217, 0.8), 0 0 30px rgba(238, 123, 244, 0.8)' 
					},
				},
				'text-glow': {
					'0%, 100%': { 
						textShadow: '0 0 5px rgba(97, 18, 217, 0.5), 0 0 15px rgba(238, 123, 244, 0.5)' 
					},
					'50%': { 
						textShadow: '0 0 15px rgba(97, 18, 217, 0.8), 0 0 30px rgba(238, 123, 244, 0.8)' 
					},
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'typing': {
					from: { width: '0%' },
					to: { width: '100%' },
				},
				'blink': {
					from: { borderRight: '2px solid rgba(238, 123, 244, 0.5)' },
					to: { borderRight: '2px solid transparent' },
				},
				'fade-in': {
					from: { opacity: '0', transform: 'translateY(20px)' },
					to: { opacity: '1', transform: 'translateY(0)' },
				},
				'rotate-glow': {
					'0%': { 
						transform: 'rotate(0deg)',
						boxShadow: '0 0 10px rgba(97, 18, 217, 0.7)' 
					},
					'50%': { 
						boxShadow: '0 0 20px rgba(238, 123, 244, 0.8)' 
					},
					'100%': { 
						transform: 'rotate(360deg)',
						boxShadow: '0 0 10px rgba(97, 18, 217, 0.7)' 
					},
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-slow': 'pulse-slow 6s ease-in-out infinite',
				'glow': 'glow 2s infinite',
				'text-glow': 'text-glow 2s infinite',
				'float': 'float 4s ease-in-out infinite',
				'typing': 'typing 3.5s steps(30, end)',
				'blink': 'blink 0.7s step-end infinite',
				'fade-in': 'fade-in 0.6s ease-out forwards',
				'rotate-glow': 'rotate-glow 10s linear infinite'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'gradient-glow': 'linear-gradient(180deg, rgba(97, 18, 217, 0.5) 0%, rgba(238, 123, 244, 0.5) 100%)',
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(20px)',
			},
		}
	},
	plugins: [animate],
} satisfies Config;
