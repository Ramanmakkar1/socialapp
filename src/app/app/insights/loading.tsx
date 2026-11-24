import { HeaderSkeleton, KpiSkeleton, SkeletonPage, TableSkeleton, Bone } from "../Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading analytics">
      <HeaderSkeleton actions={1} />
      <Bone h={120} r={14} />
      <KpiSkeleton count={8} />
      <TableSkeleton thumb />
    </SkeletonPage>
  );
}
