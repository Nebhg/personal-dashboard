"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Plus, BookOpen, Clock, Trash2, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  learningSessionSchema,
  bookSchema,
  type LearningSessionFormValues,
  type BookFormValues,
} from "@/lib/validations/learning";

interface LearningSession {
  id: string;
  date: string;
  category: string;
  title: string;
  durationMin: number;
  notes: string | null;
  resource: string | null;
}

interface Book {
  id: string;
  title: string;
  author: string | null;
  totalPages: number | null;
  currentPage: number;
  status: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  CODING: "bg-blue-100 text-blue-700",
  READING: "bg-green-100 text-green-700",
  FINANCE: "bg-yellow-100 text-yellow-700",
  OTHER: "bg-gray-100 text-gray-700",
};

function SessionForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<LearningSessionFormValues>({
    resolver: zodResolver(learningSessionSchema),
    defaultValues: { date: new Date(), category: "CODING", title: "", durationMin: 30 },
  });

  async function onSubmit(values: LearningSessionFormValues) {
    const res = await fetch("/api/learning", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) { form.reset(); onSuccess(); }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="date" render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input type="date" value={field.value ? format(field.value, "yyyy-MM-dd") : ""} onChange={(e) => field.onChange(new Date(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="category" render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="CODING">Coding</SelectItem>
                  <SelectItem value="READING">Reading</SelectItem>
                  <SelectItem value="FINANCE">Finance</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>What did you study?</FormLabel>
            <FormControl><Input placeholder="e.g. Next.js App Router docs" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="durationMin" render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (min)</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="resource" render={({ field }) => (
            <FormItem>
              <FormLabel>Resource (optional)</FormLabel>
              <FormControl><Input placeholder="URL or book title" {...field} value={field.value ?? ""} /></FormControl>
            </FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Log Session"}
        </Button>
      </form>
    </Form>
  );
}

function BookFormComponent({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<BookFormValues>({
    resolver: zodResolver(bookSchema),
    defaultValues: { title: "", status: "reading", currentPage: 0 },
  });

  async function onSubmit(values: BookFormValues) {
    const res = await fetch("/api/learning/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    if (res.ok) { form.reset(); onSuccess(); }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem className="col-span-2">
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Book title" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="author" render={({ field }) => (
            <FormItem>
              <FormLabel>Author</FormLabel>
              <FormControl><Input placeholder="Author name" {...field} value={field.value ?? ""} /></FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="totalPages" render={({ field }) => (
            <FormItem>
              <FormLabel>Total pages</FormLabel>
              <FormControl>
                <Input type="number" value={field.value ?? ""} onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} />
              </FormControl>
            </FormItem>
          )} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField control={form.control} name="currentPage" render={({ field }) => (
            <FormItem>
              <FormLabel>Current page</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
              </FormControl>
            </FormItem>
          )} />
          <FormField control={form.control} name="status" render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="to-read">To Read</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="finished">Finished</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )} />
        </div>
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : "Add Book"}
        </Button>
      </form>
    </Form>
  );
}

export default function LearningPage() {
  const [sessions, setSessions] = useState<LearningSession[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [sessionOpen, setSessionOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  const load = useCallback(async () => {
    const [sRes, bRes] = await Promise.all([
      fetch("/api/learning"),
      fetch("/api/learning/books"),
    ]);
    setSessions(await sRes.json());
    setBooks(await bRes.json());
  }, []);

  useEffect(() => { load(); }, [load]);

  async function updateBookPage(bookId: string, currentPage: number) {
    await fetch(`/api/learning/books/${bookId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPage }),
    });
    load();
  }

  async function deleteBook(id: string) {
    if (!confirm("Delete this book?")) return;
    await fetch(`/api/learning/books/${id}`, { method: "DELETE" });
    load();
  }

  async function deleteSession(id: string) {
    if (!confirm("Delete this session?")) return;
    await fetch(`/api/learning/${id}`, { method: "DELETE" });
    load();
  }

  const totalMin = sessions.reduce((s, sess) => s + sess.durationMin, 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-purple-500" />
            Learning
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {sessions.length} sessions · {Math.floor(totalMin / 60)}h {totalMin % 60}min total
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-4 w-4" /> Log Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Log Learning Session</DialogTitle></DialogHeader>
              <SessionForm onSuccess={() => { setSessionOpen(false); load(); }} />
            </DialogContent>
          </Dialog>
          <Dialog open={bookOpen} onOpenChange={setBookOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" /> Add Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
              <BookFormComponent onSuccess={() => { setBookOpen(false); load(); }} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="mb-4">
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="books">Books</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          {sessions.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No sessions logged yet</p>
            </div>
          )}
          <div className="space-y-2">
            {sessions.map((sess) => (
              <Card key={sess.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${CATEGORY_COLORS[sess.category] ?? "bg-gray-100 text-gray-700"}`}>
                          {sess.category}
                        </span>
                        <h3 className="text-sm font-medium truncate">{sess.title}</h3>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{format(new Date(sess.date), "MMM d, yyyy")}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />{sess.durationMin}min
                        </span>
                        {sess.resource && (
                          <a href={sess.resource} target="_blank" rel="noopener noreferrer" className="flex items-center gap-0.5 hover:text-primary">
                            <ExternalLink className="h-3 w-3" /> Resource
                          </a>
                        )}
                      </div>
                      {sess.notes && <p className="text-xs text-muted-foreground mt-1 italic">{sess.notes}</p>}
                    </div>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0" onClick={() => deleteSession(sess.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="books">
          {books.length === 0 && (
            <div className="text-center py-16 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No books added yet</p>
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {books.map((book) => {
              const pct = book.totalPages ? Math.round((book.currentPage / book.totalPages) * 100) : null;
              return (
                <Card key={book.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sm line-clamp-1">{book.title}</h3>
                        {book.author && <p className="text-xs text-muted-foreground">{book.author}</p>}
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge variant={book.status === "finished" ? "default" : book.status === "reading" ? "secondary" : "outline"} className="text-xs capitalize shrink-0">
                          {book.status}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => deleteBook(book.id)}>
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {book.totalPages && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Page {book.currentPage} of {book.totalPages}</span>
                          <span>{pct}%</span>
                        </div>
                        <Progress value={pct ?? 0} className="h-1.5" />
                        <div className="flex gap-2 mt-2">
                          <Input
                            type="number"
                            className="h-7 text-xs"
                            placeholder="Update page"
                            min={0}
                            max={book.totalPages}
                            onBlur={(e) => {
                              const val = Number(e.target.value);
                              if (val >= 0 && val !== book.currentPage) updateBookPage(book.id, val);
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
