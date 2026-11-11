import { HeaderSkeleton, SkeletonPage, TableSkeleton } from "../Skeleton";

// Route-level skeleton, so navigating here doesn't flash the Home skeleton from app/loading.tsx.
export default function Loading() {
  return (
    <SkeletonPage label="Loading referrals">
      <HeaderSkeleton />
      <TableSkeleton />
    </SkeletonPage>
  );
}
