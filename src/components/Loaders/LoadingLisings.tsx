// src/components/common/LoadingComponents.tsx

import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table"; // Adjust path as needed

// Reusable Spinner Component
export const Spinner = () => (
  <div className="flex justify-center items-center min-h-[50vh]">
    <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
  </div>
);

// Reusable Skeleton Row Component
export const SkeletonRow = ({ hasActions = false }) => (
  <TableRow>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
    </TableCell>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-10"></div>
    </TableCell>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-40"></div>
    </TableCell>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-24"></div>
    </TableCell>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
    </TableCell>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-32"></div>
    </TableCell>
    <TableCell className="px-5 py-4">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-28"></div>
    </TableCell>
    {hasActions && (
      <TableCell className="px-5 py-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-16"></div>
      </TableCell>
    )}
  </TableRow>
);

// Reusable Table Loader Component
export const TableLoader = ({ title, hasActions = false }: { title: string; hasActions?: boolean }) => (
  <div className="min-h-screen bg-gray-50 dark:bg-dark-900 py-6 px-4 sm:px-6 lg:px-8">
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <Table>
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">ID</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Sl. No</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Project Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Property Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">User Type</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Listing Time & Date</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Location</TableCell>
                {hasActions && (
                  <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Actions</TableCell>
                )}
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {Array(10).fill(0).map((_, index) => (
                <SkeletonRow key={index} hasActions={hasActions} />
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex justify-center mt-4">
        <Spinner />
      </div>
    </div>
  </div>
);