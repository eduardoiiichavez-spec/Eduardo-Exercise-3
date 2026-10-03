type Note = {
  id: string;
  title: string;
  description: string;
  updatedAt: number;
};

type NoteItemProps = {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
};

export default function NoteItem({ note, onEdit, onDelete }: NoteItemProps) {
  return (
    <article className="note-item">
      <div className="note-item-header">
        <h3>{note.title}</h3>
        <time className="note-date" dateTime={new Date(note.updatedAt).toISOString()}>
          {new Date(note.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </time>
      </div>
      <p className="note-description">{note.description}</p>
      <div className="note-actions">
        <button className="note-action" type="button" onClick={() => onEdit(note)}>Edit</button>
        <button className="note-action note-action-delete" type="button" onClick={() => onDelete(note.id)}>Delete</button>
      </div>
    </article>
  );
}