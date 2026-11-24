import { CalendarSkeleton, HeaderSkeleton, SkeletonPage } from "../Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading calendar">
      <HeaderSkeleton />
      <CalendarSkeleton />
    </SkeletonPage>
  );
}
