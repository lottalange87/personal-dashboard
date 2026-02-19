"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Trash2, 
  Lock, 
  Unlock,
  Save,
  MoreVertical,
  Tag,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { encryptNote, decryptNote } from "@/lib/crypto";

interface Note {
  id: string;
  title: string;
  content: string;
  encrypted: boolean;
  createdAt: number;
  updatedAt: number;
  tags: string[];
}

interface NotesAppProps {
  onBack: () => void;
}

const ENCRYPTION_PASSWORD = "LottaDash2026!"; // Same as login

export default function NotesApp({ onBack }: NotesAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [decryptedContent, setDecryptedContent] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Load notes from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("dashboard_notes");
    if (stored) {
      try {
        setNotes(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to load notes", e);
      }
    }
  }, []);

  // Save notes to localStorage
  const saveNotes = useCallback((newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem("dashboard_notes", JSON.stringify(newNotes));
  }, []);

  // Create new note
  const createNote = async () => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      title: "New Note",
      content: isEncrypted ? await encryptNote("", ENCRYPTION_PASSWORD) : "",
      encrypted: isEncrypted,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: [],
    };
    saveNotes([newNote, ...notes]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent("");
  };

  // Save note
  const saveNote = async () => {
    if (!selectedNote) return;

    const content = isEncrypted 
      ? await encryptNote(editContent, ENCRYPTION_PASSWORD)
      : editContent;

    const updatedNote: Note = {
      ...selectedNote,
      title: editTitle || "Untitled",
      content,
      encrypted: isEncrypted,
      updatedAt: Date.now(),
    };

    const updatedNotes = notes.map((n) => (n.id === selectedNote.id ? updatedNote : n));
    saveNotes(updatedNotes);
    setSelectedNote(updatedNote);
    setIsEditing(false);
    setDecryptedContent(null);
  };

  // Delete note
  const deleteNote = (id: string) => {
    saveNotes(notes.filter((n) => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setIsEditing(false);
      setDecryptedContent(null);
    }
  };

  // Decrypt note for viewing
  const decryptNoteContent = async (note: Note) => {
    if (!note.encrypted) {
      setDecryptedContent(note.content);
      return;
    }

    setIsDecrypting(true);
    try {
      const decrypted = await decryptNote(note.content, ENCRYPTION_PASSWORD);
      setDecryptedContent(decrypted);
    } catch (e) {
      setDecryptedContent("[Failed to decrypt]");
    } finally {
      setIsDecrypting(false);
    }
  };

  // Select note
  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    decryptNoteContent(note);
    setIsEditing(false);
  };

  // Start editing
  const handleEdit = () => {
    setEditTitle(selectedNote?.title || "");
    setEditContent(decryptedContent || "");
    setIsEncrypted(selectedNote?.encrypted || true);
    setIsEditing(true);
  };

  // Filter notes
  const filteredNotes = notes.filter((note) =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-xl font-bold text-white">Notes</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={createNote} size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Note
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar - Note List */}
          <div className="lg:col-span-1">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              {filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedNote?.id === note.id
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-slate-800 bg-slate-900/50 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-medium text-white truncate">{note.title}</h3>
                    {note.encrypted && <Lock className="w-3 h-3 text-emerald-400 flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-slate-500">{formatDate(note.updatedAt)}</p>
                </button>
              ))}

              {filteredNotes.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  {searchQuery ? "No notes found" : "No notes yet. Create one!"}
                </div>
              )}
            </div>
          </div>

          {/* Main Content - Note Editor/Viewer */}
          <div className="lg:col-span-2">
            {selectedNote ? (
              <div className="border border-slate-800 rounded-xl bg-slate-900/50 overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                  {isEditing ? (
                    <div className="flex items-center gap-4 flex-1">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Note title"
                        className="flex-1 bg-slate-800/50 border-slate-700 text-white"
                      />
                      <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isEncrypted}
                          onChange={(e) => setIsEncrypted(e.target.checked)}
                          className="rounded border-slate-600"
                        />
                        <Lock className="w-3 h-3" />
                        Encrypt
                      </label>
                      <Button size="sm" onClick={saveNote} className="bg-amber-500 hover:bg-amber-600">
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  ) : (
                    <>
                      <h2 className="text-lg font-semibold text-white">{selectedNote.title}</h2>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={handleEdit} className="text-slate-400 hover:text-white">
                          Edit
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                              <DialogTitle>Delete Note</DialogTitle>
                            </DialogHeader>
                            <p className="text-slate-400 mb-4">Are you sure? This cannot be undone.</p>
                            <Button 
                              onClick={() => deleteNote(selectedNote.id)} 
                              variant="destructive"
                              className="w-full"
                            >
                              Delete
                            </Button>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </>
                  )}
                </div>

                <div className="p-4">
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="Write your note here..."
                      className="min-h-[400px] bg-slate-800/50 border-slate-700 text-white resize-none"
                    />
                  ) : (
                    <div className="min-h-[400px] prose prose-invert max-w-none">
                      {isDecrypting ? (
                        <div className="text-slate-500">Decrypting...</div>
                      ) : (
                        <pre className="whitespace-pre-wrap text-slate-300 font-sans">
                          {decryptedContent || "[Empty note]"}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p>Select a note or create a new one</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
