import { HeaderSkeleton, SkeletonPage, TableSkeleton } from "../Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading">
      <HeaderSkeleton />
      <TableSkeleton thumb />
    </SkeletonPage>
  );
}
