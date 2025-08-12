import { useSelector } from "react-redux";
import { RootState } from "../../store/store";

export default function UserAddressCard() {
  const { selectedUser } = useSelector((state: RootState) => state.user);

  const addressItems = [
    ...(selectedUser?.company_name
      ? [
          {
            label: "Company Name",
            value: selectedUser.company_name,
          },
        ]
      : []),
    {
      label: "Area / Road No",
      value: selectedUser?.address || "N/A",
    },
    {
      label: "Location",
      value: selectedUser?.location || "N/A",
    },
     {
      label: "City / State",
      value: `${selectedUser?.city || "Unknown City"}, ${selectedUser?.state || "Unknown State"}`,
    },
    
    {
      label: "Country",
      value: "India",
    },
   
    {
      label: "Pincode",
      value: selectedUser?.pincode || "N/A",
    },
    
  ];

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-br from-white via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 transition-all duration-500 hover:shadow-2xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="w-full">
          <h4 className="text-2xl font-bold text-slate-800 dark:text-white mb-8">
            Address Details
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-8">
            {addressItems.map((item, index) => (
              <div key={index}>
                <p className="mb-1 text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  {item.label}
                </p>
                <p className="text-base font-medium text-slate-800 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
