-- Allow up to two reviews per booking (owner->caregiver and caregiver->owner)
DROP INDEX "Review_bookingId_key";
CREATE UNIQUE INDEX "Review_bookingId_authorId_key" ON "Review"("bookingId", "authorId");
