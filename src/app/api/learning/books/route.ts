import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookSchema } from "@/lib/validations/learning";

export async function GET() {
  const books = await prisma.book.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(books);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = bookSchema.parse(body);

    const book = await prisma.book.create({
      data: {
        title: data.title,
        author: data.author ?? null,
        totalPages: data.totalPages ?? null,
        currentPage: data.currentPage,
        status: data.status,
        notes: data.notes ?? null,
        startedAt: data.status === "reading" ? new Date() : null,
      },
    });

    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 400 });
  }
}
