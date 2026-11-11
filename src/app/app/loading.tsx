import { CardRowSkeleton, KpiSkeleton, SkeletonPage, TableSkeleton, Bone } from "./Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading home">
      <Bone w={260} h={30} />
      <CardRowSkeleton />
      <KpiSkeleton />
      <TableSkeleton rows={4} />
    </SkeletonPage>
  );
}
