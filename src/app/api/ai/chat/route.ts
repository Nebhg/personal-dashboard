import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, startOfDay } from "date-fns";
import { calculateStreak } from "@/lib/utils/streaks";

async function buildContext(): Promise<string> {
  const sevenDaysAgo = subDays(startOfDay(new Date()), 7);

  const [meals, workouts, sessions, habits] = await Promise.all([
    prisma.mealLog.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.workoutSession.findMany({
      where: { date: { gte: sevenDaysAgo } },
      include: { exercises: true },
      orderBy: { date: "desc" },
    }),
    prisma.learningSession.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: "desc" },
    }),
    prisma.habit.findMany({
      include: {
        logs: {
          where: { date: { gte: sevenDaysAgo } },
          orderBy: { date: "desc" },
        },
      },
    }),
  ]);

  const habitData = habits.map((h) => ({
    name: h.name,
    type: h.type,
    streak: calculateStreak(h.logs.map((l) => ({ date: l.date, kept: l.kept }))),
    keptDays: h.logs.filter((l) => l.kept).length,
    totalDays: h.logs.length,
  }));

  return `
Today's date: ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}

=== DIET (last 7 days) ===
${meals.length === 0 ? "No meals logged." : meals.map((m) =>
  `${new Date(m.date).toLocaleDateString()} - ${m.mealType}: ${m.description}${m.calories ? ` (${m.calories} kcal)` : ""}${m.protein ? `, P:${m.protein}g` : ""}${m.carbs ? `, C:${m.carbs}g` : ""}${m.fat ? `, F:${m.fat}g` : ""}`
).join("\n")}

=== EXERCISE (last 7 days) ===
${workouts.length === 0 ? "No workouts logged." : workouts.map((w) =>
  `${new Date(w.date).toLocaleDateString()} - ${w.name} (${w.type}, ${w.durationMin}min)${w.exercises.length > 0 ? ": " + w.exercises.map((e) => e.name + (e.sets && e.reps ? ` ${e.sets}x${e.reps}` : "") + (e.weightKg ? ` @${e.weightKg}kg` : "")).join(", ") : ""}`
).join("\n")}

=== LEARNING (last 7 days) ===
${sessions.length === 0 ? "No sessions logged." : sessions.map((s) =>
  `${new Date(s.date).toLocaleDateString()} - ${s.category}: ${s.title} (${s.durationMin}min)`
).join("\n")}

=== HABITS ===
${habitData.length === 0 ? "No habits tracked." : habitData.map((h) =>
  `${h.name} (${h.type}): ${h.streak} day streak, ${h.keptDays}/${h.totalDays} kept in last 7 days`
).join("\n")}
`.trim();
}

export async function POST(req: NextRequest) {
  const provider = process.env.AI_PROVIDER ?? "claude";
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (provider === "claude" && !anthropicKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not set in .env" }, { status: 500 });
  }
  if (provider === "openai" && !openaiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY not set in .env" }, { status: 500 });
  }

  const { messages } = await req.json();
  const context = await buildContext();

  const systemPrompt = `You are a personal lifestyle coach and dashboard assistant. You have access to the user's recent activity data below. Use it to give specific, data-driven advice and insights.

Be concise, direct, and encouraging. Reference specific data points when relevant. If you notice patterns (e.g., consistent workouts, missed habits, calorie trends), mention them.

${context}`;

  if (provider === "claude") {
    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: anthropicKey });

    const stream = client.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } else {
    const OpenAI = (await import("openai")).default;
    const client = new OpenAI({ apiKey: openaiKey });

    const stream = await client.chat.completions.create({
      model: "gpt-4o",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}
