import { HeaderSkeleton, InboxSkeleton, SkeletonPage } from "../Skeleton";

export default function Loading() {
  return (
    <SkeletonPage label="Loading inbox">
      <HeaderSkeleton />
      <InboxSkeleton />
    </SkeletonPage>
  );
}
