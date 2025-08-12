  export const getStatusDisplay = (status: number): { text: string; className: string } => {
    switch (status) {
      case 0:
        return {
          text: "Pending",
          className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        };
      case 1:
        return {
          text: "Verified",
          className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        };
      case 2:
        return {
          text: "Rejected",
          className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        };
      default:
        return {
          text: "Unknown",
          className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        };
    }
  };