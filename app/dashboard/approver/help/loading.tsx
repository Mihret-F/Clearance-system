export default function HelpCenterLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col space-y-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse mt-2"></div>
          </div>
        </div>

        {/* Search Skeleton */}
        <div className="relative max-w-2xl mx-auto">
          <div className="h-12 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>

        {/* Tabs Skeleton */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
          </div>

          {/* Content Skeleton */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
              <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>

              <div className="space-y-4 mt-6">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="h-5 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                    <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
