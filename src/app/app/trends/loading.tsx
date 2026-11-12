import { Bone, CardRowSkeleton, HeaderSkeleton, SkeletonPage } from "../Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading trends">
      <HeaderSkeleton actions={1} />
      <Bone h={40} r={12} />
      <CardRowSkeleton count={4} h={360} />
    </SkeletonPage>
  );
}
