import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { ReviewModerationItem } from "@/components/admin/review-moderation-item";

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: { author: { select: { name: true } }, subject: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-sand">Reviews</h1>
      <div className="mt-6 space-y-2">
        {reviews.length === 0 && (
          <Card>
            <p className="text-sm text-sand-dim">No reviews yet.</p>
          </Card>
        )}
        {reviews.map((r) => (
          <ReviewModerationItem
            key={r.id}
            id={r.id}
            authorName={r.author.name ?? "Unknown"}
            subjectName={r.subject.name ?? "Unknown"}
            rating={r.rating}
            comment={r.comment}
          />
        ))}
      </div>
    </div>
  );
}
