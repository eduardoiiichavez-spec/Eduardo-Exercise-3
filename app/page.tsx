"use client";

import { FormEvent, useEffect, useState } from "react";
import NoteItem from "./components/NoteItem";

type Note = {
	id: string;
	title: string;
	description: string;
	updatedAt: number;
};

const STORAGE_KEY = "fieldnotes-notes";

export default function Home() {
	const [notes, setNotes] = useState<Note[]>([]);
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isDuplicate, setIsDuplicate] = useState(false);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		const timer = window.setTimeout(() => {
			try {
				const storedNotes = window.localStorage.getItem(STORAGE_KEY);
				if (storedNotes) {
					const parsedNotes: unknown = JSON.parse(storedNotes);
					if (Array.isArray(parsedNotes)) setNotes(parsedNotes as Note[]);
				}
			} catch {
				window.localStorage.removeItem(STORAGE_KEY);
			} finally {
				setIsReady(true);
			}
		}, 0);
		return () => window.clearTimeout(timer);
	}, []);

	useEffect(() => {
		if (isReady) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
	}, [isReady, notes]);

	useEffect(() => {
		const normalizedTitle = title.trim().toLocaleLowerCase();
		const timer = window.setTimeout(() => {
			setIsDuplicate(
				Boolean(
					normalizedTitle &&
						notes.some(
							(note) =>
								note.id !== editingId &&
								note.title.trim().toLocaleLowerCase() === normalizedTitle,
						),
					),
			);
		}, 0);
		return () => window.clearTimeout(timer);
	}, [editingId, notes, title]);

	function resetEditor() {
		setTitle("");
		setDescription("");
		setEditingId(null);
	}

	function saveNote(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const cleanTitle = title.trim();
		const cleanDescription = description.trim();
		if (!cleanTitle || !cleanDescription || isDuplicate) return;

		if (editingId) {
			setNotes((currentNotes) =>
				currentNotes.map((note) =>
					note.id === editingId
						? { ...note, title: cleanTitle, description: cleanDescription, updatedAt: Date.now() }
						: note,
				),
			);
		} else {
			setNotes((currentNotes) => [
				{
					id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
					title: cleanTitle,
					description: cleanDescription,
					updatedAt: Date.now(),
				},
				...currentNotes,
			]);
		}
		resetEditor();
	}

	function editNote(note: Note) {
		setTitle(note.title);
		setDescription(note.description);
		setEditingId(note.id);
	}

	function deleteNote(id: string) {
		setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
		if (editingId === id) resetEditor();
	}

	return (
		<main className="app-shell">
			<header className="topbar">
				<a className="wordmark" href="#top" aria-label="Fieldnotes home">
					<span className="wordmark-mark" aria-hidden="true">F</span>
					<span>fieldnotes</span>
				</a>
				<span className="topbar-caption">A quiet place for good thoughts</span>
				<span className="save-status"><span className="status-dot" />Saved on this device</span>
			</header>

			<section className="intro" id="top">
				<div>
					<p className="eyebrow">YOUR PERSONAL NOTEBOOK</p>
					<h1>Make room for<br />what matters.</h1>
					<p className="intro-copy">A little space to collect ideas, reminders, and things worth coming back to.</p>
				</div>
				<div className="note-count" aria-label={`${notes.length} notes`}>
					<span className="count-number">{notes.length.toString().padStart(2, "0")}</span>
					<span className="count-label">{notes.length === 1 ? "NOTE" : "NOTES"} IN YOUR BOOK</span>
				</div>
			</section>

			<div className="workspace">
				<section className="editor-panel" aria-labelledby="editor-heading">
					<div className="section-heading editor-heading">
						<div>
							<p className="eyebrow">{editingId ? "MAKE A CHANGE" : "CAPTURE A THOUGHT"}</p>
							<h2 id="editor-heading">{editingId ? "Edit note" : "New note"}</h2>
						</div>
						{editingId && <button className="text-button" type="button" onClick={resetEditor}>Cancel</button>}
					</div>

					<form className="note-form" onSubmit={saveNote}>
						<label htmlFor="note-title">Title</label>
						<input
							id="note-title"
							type="text"
							value={title}
							onChange={(event) => setTitle(event.target.value)}
							placeholder="Give this note a name"
							maxLength={80}
							required
						/>
						{isDuplicate && <p className="field-message" role="status">A note with this title already exists.</p>}

						<label htmlFor="note-description">Description</label>
						<textarea
							id="note-description"
							value={description}
							onChange={(event) => setDescription(event.target.value)}
							placeholder="Write down the details..."
							rows={7}
							maxLength={2000}
							required
						/>
						<div className="form-footer">
							<span className="character-count">{description.length}/2000</span>
							<button className="primary-button" type="submit" disabled={isDuplicate}>
								{editingId ? "Update note" : "Add note"}<span aria-hidden="true">↗</span>
							</button>
						</div>
					</form>
					<p className="editor-footnote">Your notes stay in this browser, on this device.</p>
				</section>

				<section className="notes-panel" aria-labelledby="notes-heading">
					<div className="section-heading notes-heading">
						<div>
							<p className="eyebrow">THE COLLECTION</p>
							<h2 id="notes-heading">Your notes</h2>
						</div>
						<span className="collection-count">{notes.length} {notes.length === 1 ? "entry" : "entries"}</span>
					</div>

					{!isReady ? (
						<p className="loading-state">Opening your notebook...</p>
					) : notes.length === 0 ? (
						<div className="empty-state">
							<span className="empty-mark" aria-hidden="true">✳</span>
							<h3>The page is yours.</h3>
							<p>Your notes will find a home here. Start with a thought you want to keep.</p>
						</div>
					) : (
						<div className="notes-list">
							{notes.map((note) => <NoteItem key={note.id} note={note} onEdit={editNote} onDelete={deleteNote} />)}
						</div>
					)}
				</section>
			</div>
			<footer className="page-footer"><span>FIELDNOTES</span><span>Small thoughts add up.</span></footer>
		</main>
	);
}
