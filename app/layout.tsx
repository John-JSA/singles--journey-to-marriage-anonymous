import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Singles’ Journey to Marriage | Anonymous Q&A',description:'Anonymous questions about relationships, courtship, and preparing for marriage.'};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>}
