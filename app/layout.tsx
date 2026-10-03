import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Fieldnotes | A personal notebook",
	description: "A quiet place to collect ideas, reminders, and things worth coming back to.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en">
			<body>{children}</body>
		</html>
	);
}
