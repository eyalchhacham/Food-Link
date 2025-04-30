export default function SkeletonCard() {
  return (
    <div className="space-y-2 animate-pulse">
      {/*image*/}
      <div className="aspect-square rounded-xl bg-gray-200" />
      
      {/* title */}
      <div className="h-3 w-1/2 bg-gray-200 rounded-full" />
    </div>
  );
}
