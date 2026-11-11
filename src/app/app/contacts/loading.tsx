import { HeaderSkeleton, KpiSkeleton, SkeletonPage, TableSkeleton } from "../Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading contacts">
      <HeaderSkeleton />
      <KpiSkeleton count={3} />
      <TableSkeleton />
    </SkeletonPage>
  );
}
